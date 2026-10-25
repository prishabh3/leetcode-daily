import { SyncIndex } from '../types/sync-index';
import { PlatformSubmission } from '../types/submission';
import { computeContentHash } from '../utils/crypto';
import { sanitizeApproachName } from './path-sanitizer';

export type SubmissionDeduplicationResult =
  | {
      isDuplicate: true;
      reason: 'SUBMISSION_ID_EXISTS' | 'CONTENT_HASH_EXISTS';
      existingFilePath: string;
      matchedKey: string;
    }
  | {
      isDuplicate: false;
      contentHash: string;
      isUpdateToExistingProblem: boolean;
      existingProblemId?: string;
    };

/**
 * Checks a submission against the sync index for duplicate status
 */
export async function checkSubmissionDuplicate(
  submission: PlatformSubmission,
  approachName: string,
  syncIndex: SyncIndex | null
): Promise<SubmissionDeduplicationResult> {
  const contentHash = await computeContentHash(submission.code);
  const cleanApproach = sanitizeApproachName(approachName);

  if (!syncIndex || !syncIndex.submissions) {
    return {
      isDuplicate: false,
      contentHash,
      isUpdateToExistingProblem: false,
    };
  }

  // 1. Check by explicit submissionId if provided
  if (submission.submissionId) {
    const existingById = syncIndex.submissions[submission.submissionId];
    if (existingById) {
      return {
        isDuplicate: true,
        reason: 'SUBMISSION_ID_EXISTS',
        existingFilePath: existingById.filePath,
        matchedKey: submission.submissionId,
      };
    }
  }

  // 2. Check by content hash across all submissions for this problem
  for (const [key, entry] of Object.entries(syncIndex.submissions)) {
    if (
      entry.slug === submission.problemSlug &&
      entry.language === submission.language &&
      entry.approachName === cleanApproach &&
      entry.contentHash === contentHash
    ) {
      return {
        isDuplicate: true,
        reason: 'CONTENT_HASH_EXISTS',
        existingFilePath: entry.filePath,
        matchedKey: key,
      };
    }
  }

  // Check if problem already exists (for tracking update vs brand new)
  const isExistingProblem = Boolean(
    (submission.problemId && syncIndex.problems[submission.problemId]) ||
      syncIndex.problems[submission.problemSlug]
  );

  return {
    isDuplicate: false,
    contentHash,
    isUpdateToExistingProblem: isExistingProblem,
    existingProblemId: isExistingProblem ? submission.problemId : undefined,
  };
}
