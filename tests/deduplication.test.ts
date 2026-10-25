import { describe, it, expect } from 'vitest';
import { checkSubmissionDuplicate } from '../src/core/sync/deduplication';
import { SyncIndex } from '../src/core/types/sync-index';
import { PlatformSubmission } from '../src/core/types/submission';
import { computeContentHash } from '../src/core/utils/crypto';

describe('4. Duplicate-submission detection', () => {
  const sampleSubmission: PlatformSubmission = {
    problemId: '1',
    problemTitle: 'Two Sum',
    problemSlug: 'two-sum',
    url: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'Easy',
    language: 'cpp',
    code: 'class Solution { public: vector<int> twoSum(vector<int>& nums, int target) {} };',
    submissionId: '987654321',
    timestamp: Date.now(),
    status: 'Accepted',
  };

  it('detects duplicate by explicit submission ID', async () => {
    const existingIndex: SyncIndex = {
      schemaVersion: 2,
      lastUpdated: new Date().toISOString(),
      totalProblems: 1,
      totalSubmissions: 1,
      submissions: {
        '987654321': {
          problemId: '0001',
          slug: 'two-sum',
          title: 'Two Sum',
          difficulty: 'Easy',
          language: 'cpp',
          approachName: 'solution',
          submissionId: '987654321',
          contentHash: 'somehash',
          syncedAt: new Date().toISOString(),
          filePath: 'problems/0001-two-sum/cpp/solution.cpp',
        },
      },
      problems: {},
    };

    const res = await checkSubmissionDuplicate(sampleSubmission, 'solution', existingIndex);
    expect(res.isDuplicate).toBe(true);
    if (res.isDuplicate) {
      expect(res.reason).toBe('SUBMISSION_ID_EXISTS');
      expect(res.existingFilePath).toBe('problems/0001-two-sum/cpp/solution.cpp');
    }
  });

  it('detects duplicate by content hash even without submission ID', async () => {
    const hash = await computeContentHash(sampleSubmission.code);
    const existingIndex: SyncIndex = {
      schemaVersion: 2,
      lastUpdated: new Date().toISOString(),
      totalProblems: 1,
      totalSubmissions: 1,
      submissions: {
        'other-id': {
          problemId: '0001',
          slug: 'two-sum',
          title: 'Two Sum',
          difficulty: 'Easy',
          language: 'cpp',
          approachName: 'solution',
          contentHash: hash,
          syncedAt: new Date().toISOString(),
          filePath: 'problems/0001-two-sum/cpp/solution.cpp',
        },
      },
      problems: {},
    };

    const res = await checkSubmissionDuplicate(
      { ...sampleSubmission, submissionId: undefined },
      'solution',
      existingIndex
    );

    expect(res.isDuplicate).toBe(true);
    if (res.isDuplicate) {
      expect(res.reason).toBe('CONTENT_HASH_EXISTS');
    }
  });

  it('allows different approach or revised code as non-duplicate', async () => {
    const existingIndex: SyncIndex = {
      schemaVersion: 2,
      lastUpdated: new Date().toISOString(),
      totalProblems: 1,
      totalSubmissions: 1,
      submissions: {
        '987654321': {
          problemId: '0001',
          slug: 'two-sum',
          title: 'Two Sum',
          difficulty: 'Easy',
          language: 'cpp',
          approachName: 'brute-force',
          submissionId: '987654321',
          contentHash: 'hash1',
          syncedAt: new Date().toISOString(),
          filePath: 'problems/0001-two-sum/cpp/brute-force.cpp',
        },
      },
      problems: {
        '1': {
          id: '0001',
          title: 'Two Sum',
          slug: 'two-sum',
          difficulty: 'Easy',
          languages: ['cpp'],
          approachesCount: 1,
          lastSyncedAt: new Date().toISOString(),
          confidenceRating: 4,
          nextReviewDate: '2026-10-30',
          tags: ['Array'],
          patterns: [],
        },
      },
    };

    // New approach: optimal hash map with different submission ID and code
    const newSubmission: PlatformSubmission = {
      ...sampleSubmission,
      submissionId: '999999999',
      code: 'class Solution { // optimal hash map };',
    };

    const res = await checkSubmissionDuplicate(newSubmission, 'hash-map', existingIndex);
    expect(res.isDuplicate).toBe(false);
    if (!res.isDuplicate) {
      expect(res.isUpdateToExistingProblem).toBe(true);
    }
  });
});
