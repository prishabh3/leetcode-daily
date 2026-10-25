import { GitHubClient, FileChange } from '../github/client';
import { createAtomicCommit } from '../github/git-database';
import { LeetCodeHistoricalAdapter } from '../leetcode/historical-adapter';
import {
  HistoricalImportConfig,
  HistoricalImportPreview,
  HistoricalImportProgress,
  HistoricalImportSummary,
  HistoricalImportCheckpoint,
  RawHistoricalSubmission,
} from '../types/historical-import';
import { SyncIndex, SyncIndexEntry, ProblemSummaryEntry } from '../types/sync-index';
import { ProblemMetadata, SolutionRecord } from '../types/problem';
import { SupportedLanguage } from '../types/submission';
import { computeContentHash } from '../utils/crypto';
import {
  formatProblemId,
  getSolutionFilePath,
  getMetadataFilePath,
  getNotesFilePath,
  getHistoricalSolutionFilePath,
  getHistoricalMetadataFilePath,
  getAttemptSolutionFilePath,
  getAttemptMetadataFilePath,
  SYNC_INDEX_PATH,
  PROGRESS_SVG_PATH,
  README_PATH,
} from './path-sanitizer';
import { generateReadme } from '../generator/readme-generator';
import { generateProgressSvg, ProgressStats } from '../generator/svg-generator';
import { formatNotesMarkdown, parseNotesMarkdown } from '../generator/template';
import { migrateProblemMetadata } from '../storage/schema-migration';
import { calculateNextReview } from '../revision/scheduler';
import { storage } from '../storage/chrome-storage';

export interface CancelToken {
  isCancelled: boolean;
}

/**
 * Enumerates all accessible historical submissions matching configuration and returns preview analytics
 */
export async function previewHistoricalImport(
  config: HistoricalImportConfig,
  adapter: LeetCodeHistoricalAdapter,
  existingSyncIndex: SyncIndex,
  onProgress?: (msg: string) => void,
  cancelToken?: CancelToken
): Promise<HistoricalImportPreview> {
  const discovered: RawHistoricalSubmission[] = [];
  let offset = 0;
  const limit = 20;
  let hasNext = true;
  let lastKey: string | undefined;

  onProgress?.('Fetching submission history from LeetCode...');

  while (hasNext) {
    if (cancelToken?.isCancelled) {
      break;
    }

    const page = await adapter.fetchSubmissionsPage(offset, limit, lastKey);
    if (!page.submissions || page.submissions.length === 0) {
      break;
    }

    for (const sub of page.submissions) {
      // 1. Filter by mode
      const isAccepted = sub.statusDisplay === 'Accepted';
      if (config.mode !== 'ALL_ATTEMPTS' && !isAccepted) {
        continue;
      }

      // 2. Filter by date range
      if (config.dateRange?.startDate) {
        const startSec = Math.floor(new Date(config.dateRange.startDate).getTime() / 1000);
        if (sub.timestamp < startSec) continue;
      }
      if (config.dateRange?.endDate) {
        const endSec = Math.floor(new Date(config.dateRange.endDate).getTime() / 1000) + 86400;
        if (sub.timestamp > endSec) continue;
      }

      // 3. Filter by language
      if (config.languages && config.languages.length > 0) {
        if (!sub.normalizedLanguage || !config.languages.includes(sub.normalizedLanguage)) {
          continue;
        }
      }

      discovered.push(sub);
    }

    offset += page.submissions.length;
    hasNext = page.hasNext;
    lastKey = page.lastKey;

    onProgress?.(`Discovered ${discovered.length} eligible submissions...`);

    // Safety brake to prevent runaway loops if an API behaves unexpectedly
    if (offset >= 5000) {
      break;
    }
  }

  // Analytics computation
  let acceptedCount = 0;
  let unsuccessfulCount = 0;
  const problemSet = new Set<string>();
  const langDist: Record<string, number> = {};
  let alreadySyncedCount = 0;
  let duplicatesSkippedCount = 0;
  let codeMissingCount = 0;

  // Deduplicate discovered items based on mode
  let finalSubmissions: RawHistoricalSubmission[] = [];

  if (config.mode === 'LATEST_ACCEPTED') {
    // Mode B: Keep only the latest accepted per (problemSlug, language)
    const latestMap = new Map<string, RawHistoricalSubmission>();
    for (const sub of discovered) {
      if (sub.statusDisplay !== 'Accepted') continue;
      const key = `${sub.titleSlug}::${sub.normalizedLanguage || sub.lang}`;
      const existing = latestMap.get(key);
      if (!existing || sub.timestamp > existing.timestamp) {
        latestMap.set(key, sub);
      }
    }
    finalSubmissions = Array.from(latestMap.values());
  } else {
    // Mode A or Mode C: Keep all matching submissions
    finalSubmissions = discovered;
  }

  for (const sub of finalSubmissions) {
    if (sub.statusDisplay === 'Accepted') acceptedCount++;
    else unsuccessfulCount++;

    problemSet.add(sub.titleSlug);
    const lang = sub.normalizedLanguage || sub.lang || 'unknown';
    langDist[lang] = (langDist[lang] || 0) + 1;

    // Check if submission already exists in sync-index
    if (existingSyncIndex.submissions[sub.id]) {
      alreadySyncedCount++;
      duplicatesSkippedCount++;
    }

    if (!sub.code) {
      codeMissingCount++;
    }
  }

  const newToImportCount = finalSubmissions.length - duplicatesSkippedCount;

  return {
    totalDiscovered: finalSubmissions.length,
    acceptedCount,
    unsuccessfulCount,
    distinctProblems: problemSet.size,
    languageDistribution: langDist,
    alreadySyncedCount,
    newToImportCount: Math.max(0, newToImportCount),
    duplicatesSkippedCount,
    codeMissingCount,
    submissions: finalSubmissions,
  };
}

/**
 * Executes historical import in bounded atomic batches with resumability and checkpoints
 */
export async function executeHistoricalImport(
  submissions: RawHistoricalSubmission[],
  config: HistoricalImportConfig,
  adapter: LeetCodeHistoricalAdapter,
  client: GitHubClient,
  onProgress?: (progress: HistoricalImportProgress) => void,
  existingCheckpoint?: HistoricalImportCheckpoint | null,
  cancelToken?: CancelToken
): Promise<HistoricalImportSummary> {
  const startTime = Date.now();
  const commitsCreated: string[] = [];
  const batchSize = Math.max(1, Math.min(config.batchSize || 6, 15));

  // 1. Fetch current sync-index from GitHub or local storage
  let syncIndex: SyncIndex = await storage.getSyncIndex();
  try {
    const remoteIndexFile = await client.getFileContent(SYNC_INDEX_PATH);
    if (remoteIndexFile?.content) {
      syncIndex = JSON.parse(remoteIndexFile.content);
    }
  } catch {
    // use local index
  }

  const completedIds = new Set<string>(existingCheckpoint?.completedSubmissionIds || []);
  let importedCount = existingCheckpoint?.importedCount || 0;
  let skippedCount = existingCheckpoint?.skippedCount || 0;
  let failedCount = existingCheckpoint?.failedCount || 0;

  // Filter out submissions already processed in previous checkpoint
  const pendingSubmissions = submissions.filter((s) => !completedIds.has(s.id));
  const totalCount = submissions.length;

  // Determine latest accepted submission per (problemSlug, language)
  // so we know which one takes the canonical solution path
  const latestAcceptedPerProblemLang = new Map<string, string>(); // key -> submissionId
  for (const s of submissions) {
    if (s.statusDisplay === 'Accepted') {
      const key = `${s.titleSlug}::${s.normalizedLanguage || s.lang}`;
      const curr = latestAcceptedPerProblemLang.get(key);
      if (!curr) {
        latestAcceptedPerProblemLang.set(key, s.id);
      } else {
        const currSub = submissions.find((sub) => sub.id === curr);
        if (currSub && s.timestamp > currSub.timestamp) {
          latestAcceptedPerProblemLang.set(key, s.id);
        }
      }
    }
  }

  // Divide pending submissions into bounded batches
  const batches: RawHistoricalSubmission[][] = [];
  for (let i = 0; i < pendingSubmissions.length; i += batchSize) {
    batches.push(pendingSubmissions.slice(i, i + batchSize));
  }

  const distinctProblemsSet = new Set<string>();

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    if (cancelToken?.isCancelled) {
      onProgress?.({
        status: 'cancelled',
        processedCount: completedIds.size,
        totalCount,
        importedCount,
        skippedDuplicatesCount: skippedCount,
        failedCount,
        awaitingRetryCount: 0,
        currentBatch: batchIdx,
        totalBatches: batches.length,
        message: 'Import cancelled by user. Progress has been saved.',
      });
      return {
        success: false,
        mode: config.mode,
        totalDiscovered: totalCount,
        importedCount,
        skippedCount,
        failedCount,
        distinctProblemsImported: distinctProblemsSet.size,
        commitsCreated,
        durationMs: Date.now() - startTime,
        error: 'Cancelled by user',
      };
    }

    const currentBatch = batches[batchIdx];
    const fileChanges: FileChange[] = [];
    const batchProcessedIds: string[] = [];

    onProgress?.({
      status: 'importing',
      processedCount: completedIds.size,
      totalCount,
      importedCount,
      skippedDuplicatesCount: skippedCount,
      failedCount,
      awaitingRetryCount: 0,
      currentBatch: batchIdx + 1,
      totalBatches: batches.length,
      message: `Processing batch ${batchIdx + 1} of ${batches.length} (${currentBatch.length} submissions)...`,
    });

    for (const sub of currentBatch) {
      if (cancelToken?.isCancelled) break;

      // Duplicate check against existing sync-index
      if (syncIndex.submissions[sub.id]) {
        completedIds.add(sub.id);
        skippedCount++;
        continue;
      }

      // 2. Retrieve code if missing
      let code = sub.code;
      let problemId = sub.problemId;
      let tags = sub.topicTags || [];

      if (!code || code.trim().length === 0) {
        try {
          const details = await adapter.fetchSubmissionDetails(sub.id);
          code = details.code;
          if (details.problemId) problemId = details.problemId;
          if (details.topicTags && details.topicTags.length > 0) tags = details.topicTags;
        } catch {
          // Code retrieval failure
          failedCount++;
          completedIds.add(sub.id);
          continue;
        }
      }

      if (!code || code.trim().length === 0) {
        failedCount++;
        completedIds.add(sub.id);
        continue;
      }

      const lang: SupportedLanguage = sub.normalizedLanguage || 'cpp';
      const cleanProblemId = formatProblemId(problemId || '0');
      const contentHash = await computeContentHash(code);
      const isAccepted = sub.statusDisplay === 'Accepted';
      const canonicalKey = `${sub.titleSlug}::${lang}`;
      const isCanonicalLatest = isAccepted && latestAcceptedPerProblemLang.get(canonicalKey) === sub.id;

      distinctProblemsSet.add(sub.titleSlug);

      // Determine appropriate storage file path
      let solutionPath: string;
      let metadataPath: string;

      if (!isAccepted) {
        // Mode C unsuccessful attempts
        solutionPath = getAttemptSolutionFilePath(cleanProblemId, sub.titleSlug, sub.id, lang);
        metadataPath = getAttemptMetadataFilePath(cleanProblemId, sub.titleSlug, sub.id);
      } else if (isCanonicalLatest) {
        // Canonical latest accepted solution
        solutionPath = getSolutionFilePath(cleanProblemId, sub.titleSlug, lang, 'solution');
        metadataPath = getMetadataFilePath(cleanProblemId, sub.titleSlug);
      } else {
        // Older accepted version (Mode A)
        solutionPath = getHistoricalSolutionFilePath(cleanProblemId, sub.titleSlug, sub.id, lang);
        metadataPath = getHistoricalMetadataFilePath(cleanProblemId, sub.titleSlug, sub.id);
      }

      // Add solution code file
      fileChanges.push({
        path: solutionPath,
        content: code,
      });

      // Prepare metadata
      const isoDate = new Date(sub.timestamp * 1000).toISOString();
      const solutionRecord: SolutionRecord = {
        language: lang,
        approachName: isCanonicalLatest ? 'solution' : `submission-${sub.id}`,
        filePath: solutionPath,
        submissionId: sub.id,
        contentHash,
        syncedAt: isoDate,
        runtime: sub.runtime,
        memory: sub.memory,
      };

      if (isCanonicalLatest) {
        // Load or create ProblemMetadata
        let existingMeta = await storage.getProblemMetadata(cleanProblemId);
        if (!existingMeta) {
          existingMeta = migrateProblemMetadata(null, cleanProblemId, sub.titleSlug);
        }

        const reviewCalc = calculateNextReview(3, existingMeta.reviewsCount || 0, 0);

        const updatedMeta: ProblemMetadata = {
          ...existingMeta,
          id: cleanProblemId,
          title: sub.title || existingMeta.title,
          slug: sub.titleSlug,
          difficulty: sub.difficulty || existingMeta.difficulty || 'Medium',
          tags: Array.from(new Set([...existingMeta.tags, ...tags])),
          lastSyncedAt: isoDate,
          solutions: {
            ...existingMeta.solutions,
            [`${lang}/solution`]: solutionRecord,
          },
          nextReviewDate: reviewCalc.nextReviewDate,
        };

        fileChanges.push({
          path: metadataPath,
          content: JSON.stringify(updatedMeta, null, 2),
        });

        // Add default notes.md if not present
        const notesPath = getNotesFilePath(cleanProblemId, sub.titleSlug);
        const existingNotes = formatNotesMarkdown(updatedMeta, parseNotesMarkdown(''));
        fileChanges.push({
          path: notesPath,
          content: existingNotes,
        });

        await storage.saveProblemMetadata(updatedMeta);
      } else {
        // Isolated version metadata for history/attempts
        const versionMeta = {
          submissionId: sub.id,
          problemTitle: sub.title,
          slug: sub.titleSlug,
          verdict: sub.statusDisplay,
          language: lang,
          timestamp: isoDate,
          runtime: sub.runtime,
          memory: sub.memory,
          contentHash,
        };

        fileChanges.push({
          path: metadataPath,
          content: JSON.stringify(versionMeta, null, 2),
        });
      }

      // Update sync-index entry
      const indexEntry: SyncIndexEntry = {
        problemId: cleanProblemId,
        slug: sub.titleSlug,
        title: sub.title,
        difficulty: sub.difficulty || 'Medium',
        language: lang,
        approachName: isCanonicalLatest ? 'solution' : `sub-${sub.id}`,
        submissionId: sub.id,
        contentHash,
        syncedAt: isoDate,
        filePath: solutionPath,
      };

      syncIndex.submissions[sub.id] = indexEntry;

      const existingProblemSummary = syncIndex.problems[cleanProblemId];
      const existingLanguages = existingProblemSummary?.languages || [];
      const updatedLanguages = Array.from(new Set([...existingLanguages, lang]));

      const problemSummary: ProblemSummaryEntry = {
        id: cleanProblemId,
        title: sub.title,
        slug: sub.titleSlug,
        difficulty: sub.difficulty || existingProblemSummary?.difficulty || 'Medium',
        languages: updatedLanguages,
        approachesCount: (existingProblemSummary?.approachesCount || 0) + 1,
        lastSyncedAt: isoDate,
        confidenceRating: existingProblemSummary?.confidenceRating || 3,
        nextReviewDate: existingProblemSummary?.nextReviewDate || new Date().toISOString().split('T')[0],
        tags: Array.from(new Set([...(existingProblemSummary?.tags || []), ...tags])),
        patterns: existingProblemSummary?.patterns || [],
      };

      syncIndex.problems[cleanProblemId] = problemSummary;
      importedCount++;
      batchProcessedIds.push(sub.id);
    }

    if (fileChanges.length > 0) {
      syncIndex.totalProblems = Object.keys(syncIndex.problems).length;
      syncIndex.totalSubmissions = Object.keys(syncIndex.submissions).length;
      syncIndex.lastUpdated = new Date().toISOString();

      // Regenerate README and SVG
      let existingReadme: string | null = null;
      try {
        const remoteReadme = await client.getFileContent(README_PATH);
        existingReadme = remoteReadme?.content || null;
      } catch {
        // ignore
      }

      const generatedReadme = generateReadme(existingReadme, syncIndex, {
        repoName: client.rawSettings.repo,
      });

      // Progress SVG stats
      let easyCount = 0;
      let mediumCount = 0;
      let hardCount = 0;
      const languagesCount: Record<string, number> = {};
      for (const p of Object.values(syncIndex.problems)) {
        if (p.difficulty === 'Easy') easyCount++;
        else if (p.difficulty === 'Medium') mediumCount++;
        else if (p.difficulty === 'Hard') hardCount++;
        for (const l of p.languages) {
          languagesCount[l] = (languagesCount[l] || 0) + 1;
        }
      }

      const progressStats: ProgressStats = {
        totalTracked: syncIndex.totalProblems,
        totalSubmissions: syncIndex.totalSubmissions,
        easyCount,
        mediumCount,
        hardCount,
        languagesCount,
        reviewsCompleted: 0,
      };

      const generatedSvg = generateProgressSvg(progressStats);

      fileChanges.push(
        { path: SYNC_INDEX_PATH, content: JSON.stringify(syncIndex, null, 2) },
        { path: README_PATH, content: generatedReadme },
        { path: PROGRESS_SVG_PATH, content: generatedSvg }
      );

      // Execute atomic batch commit via GitHub Git DB API
      const commitMsg = `feat(history): import ${batchProcessedIds.length} historical submissions (batch ${batchIdx + 1}/${batches.length})`;
      const commitSha = await createAtomicCommit(client, {
        message: commitMsg,
        files: fileChanges,
      });

      commitsCreated.push(commitSha);

      // Save local sync index
      await storage.saveSyncIndex(syncIndex);

      // Update checkpoint
      for (const id of batchProcessedIds) {
        completedIds.add(id);
      }

      const checkpoint: HistoricalImportCheckpoint = {
        checkpointId: `import-${startTime}`,
        createdAt: Date.now(),
        config,
        completedSubmissionIds: Array.from(completedIds),
        totalExpected: totalCount,
        importedCount,
        skippedCount,
        failedCount,
        isComplete: completedIds.size >= totalCount,
      };

      await storage.saveHistoricalCheckpoint(checkpoint);

      onProgress?.({
        status: 'importing',
        processedCount: completedIds.size,
        totalCount,
        importedCount,
        skippedDuplicatesCount: skippedCount,
        failedCount,
        awaitingRetryCount: 0,
        currentBatch: batchIdx + 1,
        totalBatches: batches.length,
        message: `Committed batch ${batchIdx + 1}: ${commitSha.slice(0, 7)}`,
        latestCommitSha: commitSha,
      });
    } else {
      // All items in batch were duplicates or skipped
      for (const sub of currentBatch) {
        completedIds.add(sub.id);
      }
    }
  }

  // Clear checkpoint on successful completion
  await storage.clearHistoricalCheckpoint();

  onProgress?.({
    status: 'completed',
    processedCount: totalCount,
    totalCount,
    importedCount,
    skippedDuplicatesCount: skippedCount,
    failedCount,
    awaitingRetryCount: 0,
    currentBatch: batches.length,
    totalBatches: batches.length,
    message: `Historical import completed: ${importedCount} imported, ${skippedCount} skipped, ${failedCount} failed.`,
    latestCommitSha: commitsCreated[commitsCreated.length - 1],
  });

  return {
    success: true,
    mode: config.mode,
    totalDiscovered: totalCount,
    importedCount,
    skippedCount,
    failedCount,
    distinctProblemsImported: distinctProblemsSet.size,
    commitsCreated,
    durationMs: Date.now() - startTime,
  };
}
