import { SyncQueueItem } from '../types/sync-queue';
import { SyncIndex, SyncIndexEntry, ProblemSummaryEntry } from '../types/sync-index';
import { ProblemMetadata, SolutionRecord } from '../types/problem';
import { GitHubClient, FileChange } from '../github/client';
import { createAtomicCommit } from '../github/git-database';
import { checkSubmissionDuplicate } from './deduplication';
import {
  formatProblemId,
  getSolutionFilePath,
  getMetadataFilePath,
  getNotesFilePath,
  SYNC_INDEX_PATH,
  PROGRESS_SVG_PATH,
  README_PATH,
  sanitizeApproachName,
} from './path-sanitizer';
import { formatNotesMarkdown, parseNotesMarkdown } from '../generator/template';
import { generateReadme } from '../generator/readme-generator';
import { extractLeetCodeUsername } from '../leetcode/profile-validator';
import { generateProgressSvg, ProgressStats } from '../generator/svg-generator';
import { calculateNextReview } from '../revision/scheduler';
import { migrateProblemMetadata } from '../storage/schema-migration';
import { storage } from '../storage/chrome-storage';

export interface SyncExecutionResult {
  success: boolean;
  isDuplicate: boolean;
  commitSha?: string;
  error?: string;
  filesUpdated: string[];
}

/**
 * Orchestrates synchronization of a submission into the destination GitHub repository
 */
export async function executeSyncItem(
  item: SyncQueueItem,
  client: GitHubClient
): Promise<SyncExecutionResult> {
  const settings = client.rawSettings;
  const submission = item.submission;
  const approachName = sanitizeApproachName(item.approachName || 'solution');

  // 1. Fetch current sync-index from repo or local fallback
  let syncIndex: SyncIndex = await storage.getSyncIndex();
  try {
    const remoteIndexFile = await client.getFileContent(SYNC_INDEX_PATH);
    if (remoteIndexFile?.content) {
      const parsed = JSON.parse(remoteIndexFile.content);
      syncIndex = parsed;
    }
  } catch {
    // If not found remotely, use local index
  }

  // 2. Duplicate detection
  const dupCheck = await checkSubmissionDuplicate(submission, approachName, syncIndex);
  if (dupCheck.isDuplicate) {
    return {
      success: true,
      isDuplicate: true,
      filesUpdated: [],
      error: `Skipped commit: Identical submission already synced at ${dupCheck.existingFilePath}`,
    };
  }

  const contentHash = dupCheck.contentHash;
  const now = new Date().toISOString();
  const basePrefix = settings.defaultPathPrefix || 'solutions';

  const paddedId = formatProblemId(submission.problemId);
  const solutionRelPath = getSolutionFilePath(
    submission.problemId,
    submission.problemSlug,
    submission.language,
    approachName,
    basePrefix
  );
  const metadataRelPath = getMetadataFilePath(
    submission.problemId,
    submission.problemSlug,
    basePrefix
  );
  const notesRelPath = getNotesFilePath(
    submission.problemId,
    submission.problemSlug,
    basePrefix
  );

  // 3. Load or initialize ProblemMetadata
  let existingMeta: ProblemMetadata | null = null;
  try {
    const remoteMetaFile = await client.getFileContent(metadataRelPath);
    if (remoteMetaFile?.content) {
      existingMeta = migrateProblemMetadata(
        JSON.parse(remoteMetaFile.content),
        paddedId,
        submission.problemSlug
      );
    }
  } catch {
    // fallback to local cache
  }

  if (!existingMeta) {
    existingMeta = (await storage.getProblemMetadata(paddedId)) ||
      migrateProblemMetadata(null, paddedId, submission.problemSlug);
  }

  // Calculate revision schedule
  const reviewCalc = calculateNextReview(
    item.confidence || existingMeta.confidenceRating || 3,
    existingMeta.reviewsCount || 0,
    existingMeta.reviewHistory[existingMeta.reviewHistory.length - 1]?.intervalDays || 0
  );

  const solutionRecord: SolutionRecord = {
    language: submission.language,
    approachName,
    filePath: solutionRelPath,
    submissionId: submission.submissionId,
    contentHash,
    syncedAt: now,
    runtime: submission.runtime,
    memory: submission.memory,
    complexity: {
      time: item.timeComplexity || existingMeta.estimatedTimeComplexity || 'O(?)',
      space: item.spaceComplexity || existingMeta.estimatedSpaceComplexity || 'O(?)',
    },
  };

  const solutionKey = `${submission.language}/${approachName}`;

  const updatedMeta: ProblemMetadata = {
    ...existingMeta,
    id: paddedId,
    title: submission.problemTitle || existingMeta.title,
    slug: submission.problemSlug,
    url: submission.url || existingMeta.url,
    difficulty: submission.difficulty !== 'Unknown' ? submission.difficulty : existingMeta.difficulty,
    tags: Array.from(new Set([...existingMeta.tags, ...(item.tags || [])])),
    patterns: Array.from(new Set([...existingMeta.patterns, ...(item.patterns || [])])),
    lastSyncedAt: now,
    solutions: {
      ...existingMeta.solutions,
      [solutionKey]: solutionRecord,
    },
    confidenceRating: item.confidence,
    nextReviewDate: reviewCalc.nextReviewDate,
    reviewsCount: existingMeta.reviewsCount + 1,
    failedRecallCount: existingMeta.failedRecallCount + (reviewCalc.recalled ? 0 : 1),
    reviewHistory: [...existingMeta.reviewHistory, reviewCalc.newReviewRecord],
    estimatedTimeComplexity: item.timeComplexity || existingMeta.estimatedTimeComplexity,
    estimatedSpaceComplexity: item.spaceComplexity || existingMeta.estimatedSpaceComplexity,
    verifiedComplexity: false,
  };

  // 4. Load or merge Notes
  let notesContent = '';
  try {
    const remoteNotesFile = await client.getFileContent(notesRelPath);
    if (remoteNotesFile?.content) {
      const existingParsed = parseNotesMarkdown(remoteNotesFile.content);
      const mergedNotes = { ...existingParsed, ...(item.notes || {}) };
      notesContent = formatNotesMarkdown(updatedMeta, mergedNotes);
    }
  } catch {
    // remote notes not present
  }

  if (!notesContent) {
    notesContent = formatNotesMarkdown(updatedMeta, item.notes || {});
  }

  // 5. Update SyncIndex
  const indexKey = submission.submissionId || `${submission.problemSlug}-${contentHash.slice(0, 12)}`;
  const indexEntry: SyncIndexEntry = {
    problemId: paddedId,
    slug: submission.problemSlug,
    title: submission.problemTitle,
    difficulty: updatedMeta.difficulty,
    language: submission.language,
    approachName,
    submissionId: submission.submissionId,
    contentHash,
    syncedAt: now,
    filePath: solutionRelPath,
  };

  const existingProblemSummary = syncIndex.problems[paddedId] || syncIndex.problems[submission.problemSlug];
  const problemLanguages = Array.from(
    new Set([...(existingProblemSummary?.languages || []), submission.language])
  );

  const problemSummary: ProblemSummaryEntry = {
    id: paddedId,
    title: submission.problemTitle,
    slug: submission.problemSlug,
    difficulty: updatedMeta.difficulty,
    languages: problemLanguages,
    approachesCount: Object.keys(updatedMeta.solutions).length,
    lastSyncedAt: now,
    confidenceRating: item.confidence,
    nextReviewDate: reviewCalc.nextReviewDate,
    tags: updatedMeta.tags,
    patterns: updatedMeta.patterns,
  };

  syncIndex.submissions[indexKey] = indexEntry;
  syncIndex.problems[paddedId] = problemSummary;
  syncIndex.totalProblems = Object.keys(syncIndex.problems).length;
  syncIndex.totalSubmissions = Object.keys(syncIndex.submissions).length;
  syncIndex.lastUpdated = now;

  // 6. Generate deterministic README & Progress SVG
  let existingReadme: string | null = null;
  try {
    const remoteReadme = await client.getFileContent(README_PATH);
    existingReadme = remoteReadme?.content || null;
  } catch {
    // no existing readme
  }

  // Migrate any legacy 'problems/' paths to canonical basePrefix
  for (const sub of Object.values(syncIndex.submissions)) {
    if (sub.filePath && sub.filePath.startsWith('problems/')) {
      sub.filePath = sub.filePath.replace(/^problems\//, `${basePrefix}/`);
    }
  }

  const appSettings = await storage.getSettings();
  const cleanLeetCodeUser = extractLeetCodeUsername(appSettings?.leetcodeProfileUsername);
  const cacheBuster = Math.floor(new Date(now).getTime() / 1000);

  const generatedReadme = generateReadme(existingReadme, syncIndex, {
    repoName: settings.repo,
    githubUsername: settings.owner,
    leetcodeUsername: cleanLeetCodeUser || undefined,
    leetcodeSite: appSettings?.leetcodeSite || 'us',
    basePrefix,
    cacheBuster,
  });

  // Calculate stats for SVG
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
    reviewsCompleted: updatedMeta.reviewsCount,
  };

  const generatedSvg = generateProgressSvg(progressStats);

  // 7. Prepare atomic multi-file commit changes
  const fileChanges: FileChange[] = [
    {
      path: solutionRelPath,
      content: submission.code ?? '',
    },
    {
      path: metadataRelPath,
      content: JSON.stringify(updatedMeta, null, 2),
    },
    {
      path: notesRelPath,
      content: notesContent,
    },
    {
      path: SYNC_INDEX_PATH,
      content: JSON.stringify(syncIndex, null, 2),
    },
    {
      path: README_PATH,
      content: generatedReadme,
    },
    {
      path: PROGRESS_SVG_PATH,
      content: generatedSvg,
    },
  ];

  // 8. Commit message formatting
  const commitMessage = `feat(leetcode): sync ${submission.problemTitle || submission.problemSlug} (${submission.language.toUpperCase()})`;

  const commitSha = await createAtomicCommit(client, {
    message: commitMessage,
    files: fileChanges,
    author: settings.authorName && settings.authorEmail
      ? { name: settings.authorName, email: settings.authorEmail }
      : undefined,
  });

  // 9. Persist updated index & problem cache locally
  await storage.saveSyncIndex(syncIndex);
  await storage.saveProblemMetadata(updatedMeta);

  return {
    success: true,
    isDuplicate: false,
    commitSha,
    filesUpdated: fileChanges.map((f) => f.path),
  };
}
