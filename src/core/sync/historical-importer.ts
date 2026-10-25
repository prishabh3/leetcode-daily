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
  CommitDateStrategy,
} from '../types/historical-import';
import { SyncIndex, SyncIndexEntry, ProblemSummaryEntry } from '../types/sync-index';
import { ProblemMetadata, SolutionRecord } from '../types/problem';
import { SupportedLanguage } from '../types/submission';
import { computeContentHash } from '../utils/crypto';
import { getLanguageConfig, getLanguageDialect } from '../utils/languages';
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
import { extractLeetCodeUsername } from '../leetcode/profile-validator';
import { generateProgressSvg, ProgressStats } from '../generator/svg-generator';
import { formatNotesMarkdown, parseNotesMarkdown } from '../generator/template';
import { migrateProblemMetadata } from '../storage/schema-migration';
import { calculateNextReview } from '../revision/scheduler';
import { storage } from '../storage/chrome-storage';

/**
 * Builds all file changes (solution file, metadata.json, notes.md) and updates in-memory syncIndex
 * for a single historical submission.
 */
async function buildSubmissionFileChanges(
  sub: RawHistoricalSubmission,
  code: string,
  problemId: string,
  tags: string[],
  syncIndex: SyncIndex,
  isCanonicalLatest: boolean,
  basePrefix: string
): Promise<FileChange[]> {
  const fileChanges: FileChange[] = [];
  const lang: SupportedLanguage = sub.normalizedLanguage || 'unknown';
  const cleanProblemId = formatProblemId(problemId || '0');
  const contentHash = await computeContentHash(code);
  const isAccepted = sub.statusDisplay === 'Accepted';

  let solutionPath: string;
  let metadataPath: string;

  if (!isAccepted) {
    solutionPath = getAttemptSolutionFilePath(cleanProblemId, sub.titleSlug, sub.id, lang, basePrefix);
    metadataPath = getAttemptMetadataFilePath(cleanProblemId, sub.titleSlug, sub.id, basePrefix);
  } else if (isCanonicalLatest) {
    solutionPath = getSolutionFilePath(cleanProblemId, sub.titleSlug, lang, 'solution', basePrefix);
    metadataPath = getMetadataFilePath(cleanProblemId, sub.titleSlug, basePrefix);
  } else {
    solutionPath = getHistoricalSolutionFilePath(cleanProblemId, sub.titleSlug, sub.id, lang, basePrefix);
    metadataPath = getHistoricalMetadataFilePath(cleanProblemId, sub.titleSlug, sub.id, basePrefix);
  }

  fileChanges.push({ path: solutionPath, content: code });

  const originalIsoDate = sub.timestamp > 0 ? new Date(sub.timestamp * 1000).toISOString() : new Date().toISOString();
  const importNowIsoDate = new Date().toISOString();

  const solutionRecord: SolutionRecord = {
    language: lang,
    approachName: isCanonicalLatest ? 'solution' : `submission-${sub.id}`,
    filePath: solutionPath,
    submissionId: sub.id,
    contentHash,
    syncedAt: importNowIsoDate,
    runtime: sub.runtime,
    memory: sub.memory,
    rawPlatformLanguage: sub.lang || undefined,
    languageDialect: getLanguageDialect(sub.lang || '') || undefined,
  };

  if (isCanonicalLatest) {
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
      firstTrackedAt: existingMeta.firstTrackedAt || originalIsoDate,
      lastSyncedAt: importNowIsoDate,
      solutions: {
        ...existingMeta.solutions,
        [`${lang}/solution`]: solutionRecord,
      },
      nextReviewDate: reviewCalc.nextReviewDate,
      rawPlatformLanguage: sub.lang || existingMeta.rawPlatformLanguage,
      languageDialect: getLanguageDialect(sub.lang || '') || existingMeta.languageDialect,
    };

    fileChanges.push({
      path: metadataPath,
      content: JSON.stringify(updatedMeta, null, 2),
    });

    const notesPath = getNotesFilePath(cleanProblemId, sub.titleSlug, basePrefix);
    const existingNotes = formatNotesMarkdown(updatedMeta, parseNotesMarkdown(''));
    fileChanges.push({
      path: notesPath,
      content: existingNotes,
    });

    await storage.saveProblemMetadata(updatedMeta);
  } else {
    const versionMeta = {
      submissionId: sub.id,
      problemTitle: sub.title,
      slug: sub.titleSlug,
      verdict: sub.statusDisplay,
      language: lang,
      rawPlatformLanguage: sub.lang || undefined,
      languageDialect: getLanguageDialect(sub.lang || '') || undefined,
      submittedAt: originalIsoDate,
      importedAt: importNowIsoDate,
      runtime: sub.runtime,
      memory: sub.memory,
      contentHash,
    };
    fileChanges.push({
      path: metadataPath,
      content: JSON.stringify(versionMeta, null, 2),
    });
  }

  // Update syncIndex in memory
  const indexEntry: SyncIndexEntry = {
    problemId: cleanProblemId,
    slug: sub.titleSlug,
    title: sub.title,
    difficulty: sub.difficulty || 'Medium',
    language: lang,
    approachName: isCanonicalLatest ? 'solution' : `sub-${sub.id}`,
    submissionId: sub.id,
    contentHash,
    syncedAt: importNowIsoDate,
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
    lastSyncedAt: importNowIsoDate,
    confidenceRating: existingProblemSummary?.confidenceRating || 3,
    nextReviewDate: existingProblemSummary?.nextReviewDate || new Date().toISOString().split('T')[0],
    tags: Array.from(new Set([...(existingProblemSummary?.tags || []), ...tags])),
    patterns: existingProblemSummary?.patterns || [],
  };
  syncIndex.problems[cleanProblemId] = problemSummary;

  return fileChanges;
}

/**
 * Builds auxiliary repository tracking files: sync-index.json, README.md, and progress.svg
 */
async function buildAuxiliaryFiles(
  client: GitHubClient,
  syncIndex: SyncIndex,
  basePrefix: string
): Promise<FileChange[]> {
  syncIndex.totalProblems = Object.keys(syncIndex.problems).length;
  syncIndex.totalSubmissions = Object.keys(syncIndex.submissions).length;
  syncIndex.lastUpdated = new Date().toISOString();

  let existingReadme: string | null = null;
  try {
    const remoteReadme = await client.getFileContent(README_PATH);
    existingReadme = remoteReadme?.content || null;
  } catch {
    // ignore
  }

  const appSettings = await storage.getSettings();
  const cleanLeetCodeUser = extractLeetCodeUsername(appSettings?.leetcodeProfileUsername);
  const cacheBuster = Math.floor(Date.now() / 1000);

  const generatedReadme = generateReadme(existingReadme, syncIndex, {
    repoName: client.rawSettings.repo,
    githubUsername: client.rawSettings.owner,
    leetcodeUsername: cleanLeetCodeUser || undefined,
    leetcodeSite: appSettings?.leetcodeSite || 'us',
    basePrefix,
    cacheBuster,
  });

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

  return [
    { path: SYNC_INDEX_PATH, content: JSON.stringify(syncIndex, null, 2) },
    { path: README_PATH, content: generatedReadme },
    { path: PROGRESS_SVG_PATH, content: generatedSvg },
  ];
}

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
  const dateStrategy: CommitDateStrategy = config.commitDateStrategy || 'IMPORT_DATE';

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
  let recordsWithOriginalTimestamp = 0;
  let recordsWithoutTimestamp = 0;

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

    if (typeof sub.timestamp === 'number' && sub.timestamp > 0) {
      recordsWithOriginalTimestamp++;
    } else {
      recordsWithoutTimestamp++;
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
    recordsWithOriginalTimestamp,
    recordsWithoutTimestamp,
    selectedDateStrategy: dateStrategy,
    submissions: finalSubmissions,
  };
}

/**
 * Executes historical import in bounded atomic batches with resumability, checkpoints,
 * and support for custom Commit Date Strategies.
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
  const commitDateStrategy: CommitDateStrategy =
    config.commitDateStrategy || existingCheckpoint?.commitDateStrategy || 'IMPORT_DATE';
  const basePrefix = client.rawSettings.defaultPathPrefix || 'solutions';

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

  // Migrate any legacy 'problems/' paths to canonical basePrefix in sync-index
  for (const sub of Object.values(syncIndex.submissions)) {
    if (sub.filePath && sub.filePath.startsWith('problems/')) {
      sub.filePath = sub.filePath.replace(/^problems\//, `${basePrefix}/`);
    }
  }

  const completedIds = new Set<string>(existingCheckpoint?.completedSubmissionIds || []);
  let importedCount = existingCheckpoint?.importedCount || 0;
  let skippedCount = existingCheckpoint?.skippedCount || 0;
  let failedCount = existingCheckpoint?.failedCount || 0;
  let fallbackTimestampsCount = existingCheckpoint?.fallbackTimestampsCount || 0;

  // Filter out submissions already processed in previous checkpoint
  let pendingSubmissions = submissions.filter((s) => !completedIds.has(s.id));
  const totalCount = submissions.length;

  // If ORIGINAL_DATE mode: Sort chronologically ascending so commits build in historical sequence
  if (commitDateStrategy === 'ORIGINAL_DATE') {
    pendingSubmissions = [...pendingSubmissions].sort((a, b) => a.timestamp - b.timestamp);
  }

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

  // Divide pending submissions into batches
  // In ORIGINAL_DATE mode, group by calendar date (YYYY-MM-DD) or max 8 submissions so commits reflect honest dates
  const batches: RawHistoricalSubmission[][] = [];
  const maxBatchSize = Math.max(1, Math.min(config.batchSize || 6, 12));

  if (commitDateStrategy === 'ORIGINAL_DATE') {
    let currentDayBatch: RawHistoricalSubmission[] = [];
    let currentDayStr = '';

    for (const sub of pendingSubmissions) {
      const subDay = sub.timestamp > 0 ? new Date(sub.timestamp * 1000).toISOString().split('T')[0] : 'unknown';
      if (currentDayBatch.length === 0) {
        currentDayBatch.push(sub);
        currentDayStr = subDay;
      } else if (subDay === currentDayStr && currentDayBatch.length < maxBatchSize) {
        currentDayBatch.push(sub);
      } else {
        batches.push(currentDayBatch);
        currentDayBatch = [sub];
        currentDayStr = subDay;
      }
    }
    if (currentDayBatch.length > 0) {
      batches.push(currentDayBatch);
    }
  } else {
    for (let i = 0; i < pendingSubmissions.length; i += maxBatchSize) {
      batches.push(pendingSubmissions.slice(i, i + maxBatchSize));
    }
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
        message: 'Import cancelled by user. Progress has been saved in checkpoint.',
      });
      return {
        success: false,
        mode: config.mode,
        commitDateStrategy,
        totalDiscovered: totalCount,
        importedCount,
        skippedCount,
        failedCount,
        distinctProblemsImported: distinctProblemsSet.size,
        commitsCreated,
        fallbackTimestampsCount,
        durationMs: Date.now() - startTime,
        error: 'Cancelled by user',
      };
    }

    const currentBatch = batches[batchIdx];
    const eligibleSubmissionsInBatch: Array<{
      sub: RawHistoricalSubmission;
      code: string;
      problemId: string;
      tags: string[];
    }> = [];

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

    const saveCheckpoint = async () => {
      const checkpoint: HistoricalImportCheckpoint = {
        checkpointId: `import-${startTime}`,
        createdAt: Date.now(),
        config,
        commitDateStrategy,
        completedSubmissionIds: Array.from(completedIds),
        totalExpected: totalCount,
        importedCount,
        skippedCount,
        failedCount,
        fallbackTimestampsCount,
        isComplete: completedIds.size >= totalCount,
      };
      await storage.saveHistoricalCheckpoint(checkpoint);
    };

    for (const sub of currentBatch) {
      if (cancelToken?.isCancelled) break;
      if (completedIds.has(sub.id)) continue;

      // Duplicate check against current syncIndex
      if (syncIndex.submissions[sub.id]) {
        completedIds.add(sub.id);
        skippedCount++;
        continue;
      }

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

      eligibleSubmissionsInBatch.push({
        sub,
        code,
        problemId: problemId || '0',
        tags,
      });
    }

    if (eligibleSubmissionsInBatch.length > 0) {
      let batchSuccess = false;
      const fileChanges: FileChange[] = [];
      const batchProcessedIds: string[] = [];

      for (const item of eligibleSubmissionsInBatch) {
        const canonicalKey = `${item.sub.titleSlug}::${item.sub.normalizedLanguage || item.sub.lang}`;
        const isCanonicalLatest =
          item.sub.statusDisplay === 'Accepted' &&
          latestAcceptedPerProblemLang.get(canonicalKey) === item.sub.id;
        distinctProblemsSet.add(item.sub.titleSlug);

        const subFiles = await buildSubmissionFileChanges(
          item.sub,
          item.code,
          item.problemId,
          item.tags,
          syncIndex,
          isCanonicalLatest,
          basePrefix
        );
        fileChanges.push(...subFiles);
        batchProcessedIds.push(item.sub.id);
      }

      const auxFiles = await buildAuxiliaryFiles(client, syncIndex, basePrefix);
      fileChanges.push(...auxFiles);

      // Determine commit date based on strategy
      let commitDateIso = new Date().toISOString();
      if (commitDateStrategy === 'ORIGINAL_DATE') {
        const refSub = eligibleSubmissionsInBatch[eligibleSubmissionsInBatch.length - 1].sub;
        if (refSub && typeof refSub.timestamp === 'number' && refSub.timestamp > 0) {
          commitDateIso = new Date(refSub.timestamp * 1000).toISOString();
        } else {
          fallbackTimestampsCount++;
        }
      }

      const authorName = client.rawSettings.authorName || client.rawSettings.owner || 'LC-Sync';
      const authorEmail =
        client.rawSettings.authorEmail || `${client.rawSettings.owner || 'user'}@users.noreply.github.com`;

      let commitMsg: string;
      if (batchProcessedIds.length === 1) {
        const singleSub = eligibleSubmissionsInBatch[0].sub;
        const langConfig = getLanguageConfig((singleSub.normalizedLanguage || 'cpp') as any);
        commitMsg = `feat(leetcode): add ${singleSub.title} (${langConfig.name}) [historical]`;
      } else {
        commitMsg = `feat(history): import ${batchProcessedIds.length} historical submissions (batch ${batchIdx + 1}/${batches.length})`;
      }

      try {
        const commitSha = await createAtomicCommit(client, {
          message: commitMsg,
          files: fileChanges,
          author: { name: authorName, email: authorEmail, date: commitDateIso },
          committer: { name: authorName, email: authorEmail, date: commitDateIso },
        });

        commitsCreated.push(commitSha);
        for (const id of batchProcessedIds) {
          completedIds.add(id);
          importedCount++;
        }
        await storage.saveSyncIndex(syncIndex);
        batchSuccess = true;

        await saveCheckpoint();
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
          message: `Committed batch ${batchIdx + 1}: ${commitSha.slice(0, 7)} (${commitDateStrategy === 'ORIGINAL_DATE' ? commitDateIso.split('T')[0] : 'today'})`,
          latestCommitSha: commitSha,
        });
      } catch (batchErr: any) {
        console.warn(
          `[historical-import] Batch ${batchIdx + 1} commit failed: ${batchErr?.message}. Falling back to 1-by-1 recovery...`
        );
      }

      // If batch commit failed, recover individual submissions one-by-one!
      if (!batchSuccess) {
        for (const item of eligibleSubmissionsInBatch) {
          if (completedIds.has(item.sub.id)) continue;
          try {
            // Reconcile with latest remote sync index
            try {
              const remoteIdx = await client.getFileContent(SYNC_INDEX_PATH);
              if (remoteIdx?.content) {
                const parsed = JSON.parse(remoteIdx.content);
                syncIndex.submissions = { ...syncIndex.submissions, ...parsed.submissions };
                syncIndex.problems = { ...syncIndex.problems, ...parsed.problems };
              }
            } catch {
              // ignore
            }

            const canonicalKey = `${item.sub.titleSlug}::${item.sub.normalizedLanguage || item.sub.lang}`;
            const isCanonicalLatest =
              item.sub.statusDisplay === 'Accepted' &&
              latestAcceptedPerProblemLang.get(canonicalKey) === item.sub.id;

            const singleFiles = await buildSubmissionFileChanges(
              item.sub,
              item.code,
              item.problemId,
              item.tags,
              syncIndex,
              isCanonicalLatest,
              basePrefix
            );
            const singleAux = await buildAuxiliaryFiles(client, syncIndex, basePrefix);
            singleFiles.push(...singleAux);

            let singleDateIso = new Date().toISOString();
            if (commitDateStrategy === 'ORIGINAL_DATE' && item.sub.timestamp > 0) {
              singleDateIso = new Date(item.sub.timestamp * 1000).toISOString();
            }

            const langConfig = getLanguageConfig((item.sub.normalizedLanguage || 'cpp') as any);
            const singleMsg = `feat(leetcode): add ${item.sub.title} (${langConfig.name}) [historical]`;

            const singleSha = await createAtomicCommit(client, {
              message: singleMsg,
              files: singleFiles,
              author: { name: authorName, email: authorEmail, date: singleDateIso },
              committer: { name: authorName, email: authorEmail, date: singleDateIso },
            });

            commitsCreated.push(singleSha);
            completedIds.add(item.sub.id);
            importedCount++;
            await storage.saveSyncIndex(syncIndex);
            await saveCheckpoint();

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
              message: `Recovered submission "${item.sub.title}": ${singleSha.slice(0, 7)}`,
              latestCommitSha: singleSha,
            });
          } catch (singleErr: any) {
            // Isolate individual submission failure
            failedCount++;
            completedIds.add(item.sub.id);
            await saveCheckpoint();

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
              message: `Submission "${item.sub.title || item.sub.id}" failed: ${singleErr?.message || 'Commit error'}. Continuing to next submission...`,
            });
          }
        }
      }
    } else {
      // All items in batch were duplicates or previously processed
      for (const sub of currentBatch) {
        completedIds.add(sub.id);
      }
      await saveCheckpoint();
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
    commitDateStrategy,
    totalDiscovered: totalCount,
    importedCount,
    skippedCount,
    failedCount,
    distinctProblemsImported: distinctProblemsSet.size,
    commitsCreated,
    fallbackTimestampsCount,
    durationMs: Date.now() - startTime,
  };
}
