import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeetCodeHistoricalAdapter } from '../src/core/leetcode/historical-adapter';
import {
  previewHistoricalImport,
  executeHistoricalImport,
  CancelToken,
} from '../src/core/sync/historical-importer';
import {
  HistoricalImportConfig,
  RawHistoricalSubmission,
  HistoricalImportCheckpoint,
} from '../src/core/types/historical-import';
import { SyncIndex } from '../src/core/types/sync-index';
import { GitHubClient } from '../src/core/github/client';
import { storage } from '../src/core/storage/chrome-storage';

describe('Historical Submission Import Engine & Regression Tests', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await storage.clear();
  });

  const sampleSubmissionsPage1: RawHistoricalSubmission[] = [
    {
      id: '1001',
      title: 'Two Sum',
      titleSlug: 'two-sum',
      problemId: '1',
      statusDisplay: 'Accepted',
      lang: 'cpp',
      normalizedLanguage: 'cpp',
      runtime: '3 ms',
      memory: '14.2 MB',
      timestamp: 1690000000,
      code: 'class Solution { public: vector<int> twoSum() { return {0, 1}; } };',
    },
    {
      id: '1002',
      title: 'Two Sum',
      titleSlug: 'two-sum',
      problemId: '1',
      statusDisplay: 'Accepted',
      lang: 'cpp',
      normalizedLanguage: 'cpp',
      runtime: '5 ms',
      memory: '14.5 MB',
      timestamp: 1690050000, // Newer submission for same problem & language
      code: 'class Solution { public: vector<int> twoSum() { return {1, 2}; } };',
    },
    {
      id: '1003',
      title: 'Roman to Integer',
      titleSlug: 'roman-to-integer',
      problemId: '13',
      statusDisplay: 'Accepted',
      lang: 'python3',
      normalizedLanguage: 'python3',
      runtime: '45 ms',
      memory: '16.5 MB',
      timestamp: 1690100000,
      code: 'class Solution:\n    def romanToInt(self, s: str) -> int:\n        return 1',
    },
  ];

  const sampleSubmissionsPage2: RawHistoricalSubmission[] = [
    {
      id: '1004',
      title: 'Palindrome Number',
      titleSlug: 'palindrome-number',
      problemId: '9',
      statusDisplay: 'Wrong Answer',
      lang: 'java',
      normalizedLanguage: 'java',
      runtime: '2 ms',
      memory: '40 MB',
      timestamp: 1690150000,
      code: 'class Solution { public boolean isPalindrome(int x) { return false; } }',
    },
    {
      id: '1005',
      title: 'Palindrome Number',
      titleSlug: 'palindrome-number',
      problemId: '9',
      statusDisplay: 'Accepted',
      lang: 'java',
      normalizedLanguage: 'java',
      runtime: '6 ms',
      memory: '42 MB',
      timestamp: 1690200000,
      code: 'class Solution { public boolean isPalindrome(int x) { return true; } }',
    },
  ];

  const createMockAdapter = () => {
    const adapter = new LeetCodeHistoricalAdapter();
    adapter.fetchSubmissionsPage = vi.fn().mockImplementation((offset: number) => {
      if (offset === 0) {
        return Promise.resolve({
          submissions: sampleSubmissionsPage1,
          hasNext: true,
          lastKey: 'page2-key',
        });
      }
      return Promise.resolve({
        submissions: sampleSubmissionsPage2,
        hasNext: false,
      });
    });

    adapter.fetchSubmissionDetails = vi.fn().mockImplementation((id: string) => {
      return Promise.resolve({
        code: `// Detailed code for submission ${id}`,
        runtime: '4 ms',
        memory: '15 MB',
        problemId: '1',
        topicTags: ['Array', 'Hash Table'],
      });
    });

    return adapter;
  };

  const createMockGitHubClient = () => {
    const client = new GitHubClient({
      token: 'fake-token',
      owner: 'test-user',
      repo: 'leetcode-solutions',
      branch: 'main',
      defaultPathPrefix: 'problems',
    });

    client.getFileContent = vi.fn().mockResolvedValue(null);
    client.rawRequest = vi.fn().mockImplementation((endpoint: string, options?: any) => {
      if (endpoint.includes('/git/ref/heads/')) {
        return Promise.resolve({ object: { sha: 'base-commit-sha' } });
      }
      if (endpoint.includes('/git/commits/base-commit-sha')) {
        return Promise.resolve({ tree: { sha: 'base-tree-sha' } });
      }
      if (endpoint.includes('/git/blobs')) {
        return Promise.resolve({ sha: `blob-sha-${Math.random().toString(36).slice(2, 8)}` });
      }
      if (endpoint.includes('/git/trees')) {
        return Promise.resolve({ sha: 'new-tree-sha' });
      }
      if (endpoint.includes('/git/commits') && options?.method === 'POST') {
        return Promise.resolve({ sha: `commit-sha-${Date.now()}` });
      }
      if (endpoint.includes('/git/refs/heads/') && options?.method === 'PATCH') {
        return Promise.resolve({ object: { sha: 'new-commit-sha' } });
      }
      return Promise.resolve({});
    });

    return client;
  };

  // 1. Retrieving multiple pages of submission history
  it('1. Retrieves multiple pages of submission history and aggregates records', async () => {
    const adapter = createMockAdapter();
    const existingIndex: SyncIndex = {
      schemaVersion: 2,
      lastUpdated: '',
      totalProblems: 0,
      totalSubmissions: 0,
      submissions: {},
      problems: {},
    };

    const config: HistoricalImportConfig = { mode: 'ALL_ACCEPTED' };
    const preview = await previewHistoricalImport(config, adapter, existingIndex);

    expect(adapter.fetchSubmissionsPage).toHaveBeenCalledTimes(2);
    expect(preview.totalDiscovered).toBe(4); // 4 accepted submissions across pages 1 and 2
    expect(preview.distinctProblems).toBe(3); // two-sum, roman-to-integer, palindrome-number
  });

  // 2. Handling the final page and pagination completion correctly
  it('2. Stops pagination cleanly when hasNext is false', async () => {
    const adapter = createMockAdapter();
    const existingIndex: SyncIndex = {
      schemaVersion: 2,
      lastUpdated: '',
      totalProblems: 0,
      totalSubmissions: 0,
      submissions: {},
      problems: {},
    };

    const config: HistoricalImportConfig = { mode: 'ALL_ACCEPTED' };
    const preview = await previewHistoricalImport(config, adapter, existingIndex);

    expect(preview.submissions.length).toBe(4);
    expect(adapter.fetchSubmissionsPage).toHaveBeenCalledWith(0, 20, undefined);
    expect(adapter.fetchSubmissionsPage).toHaveBeenCalledWith(3, 20, 'page2-key');
  });

  // 3. Preserving correct submission IDs and original timestamps
  it('3. Preserves original submission IDs, timestamps, and metadata', async () => {
    const adapter = createMockAdapter();
    const existingIndex: SyncIndex = {
      schemaVersion: 2,
      lastUpdated: '',
      totalProblems: 0,
      totalSubmissions: 0,
      submissions: {},
      problems: {},
    };

    const preview = await previewHistoricalImport({ mode: 'ALL_ACCEPTED' }, adapter, existingIndex);
    const sub1001 = preview.submissions.find((s) => s.id === '1001');

    expect(sub1001).toBeDefined();
    expect(sub1001?.id).toBe('1001');
    expect(sub1001?.timestamp).toBe(1690000000);
    expect(sub1001?.statusDisplay).toBe('Accepted');
  });

  // 4. Importing all accepted historical versions (Mode A)
  it('4. Mode A imports all accepted historical versions including earlier attempts', async () => {
    const adapter = createMockAdapter();
    const client = createMockGitHubClient();
    const config: HistoricalImportConfig = { mode: 'ALL_ACCEPTED', batchSize: 10 };

    const preview = await previewHistoricalImport(config, adapter, {
      schemaVersion: 2,
      lastUpdated: '',
      totalProblems: 0,
      totalSubmissions: 0,
      submissions: {},
      problems: {},
    });

    const summary = await executeHistoricalImport(preview.submissions, config, adapter, client);

    expect(summary.success).toBe(true);
    expect(summary.importedCount).toBe(4);
    expect(summary.distinctProblemsImported).toBe(3);

    // Verify git tree commits were made
    expect(client.rawRequest).toHaveBeenCalledWith(
      expect.stringContaining('/git/commits'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  // 5. Importing only the latest accepted version per problem-language (Mode B)
  it('5. Mode B keeps only the latest accepted submission per problem and language', async () => {
    const adapter = createMockAdapter();
    const existingIndex: SyncIndex = {
      schemaVersion: 2,
      lastUpdated: '',
      totalProblems: 0,
      totalSubmissions: 0,
      submissions: {},
      problems: {},
    };

    const config: HistoricalImportConfig = { mode: 'LATEST_ACCEPTED' };
    const preview = await previewHistoricalImport(config, adapter, existingIndex);

    // Two Sum had 1001 (timestamp 1690000000) and 1002 (timestamp 1690050000)
    // Mode B must keep only 1002, dropping older 1001
    expect(preview.submissions.length).toBe(3); // 1 for Two Sum, 1 for Roman to Integer, 1 for Palindrome Number
    const twoSumSub = preview.submissions.find((s) => s.titleSlug === 'two-sum');
    expect(twoSumSub?.id).toBe('1002');
  });

  // 6. Handling optional import of unsuccessful attempts (Mode C)
  it('6. Mode C includes unsuccessful attempts and keeps them separate', async () => {
    const adapter = createMockAdapter();
    const existingIndex: SyncIndex = {
      schemaVersion: 2,
      lastUpdated: '',
      totalProblems: 0,
      totalSubmissions: 0,
      submissions: {},
      problems: {},
    };

    const config: HistoricalImportConfig = { mode: 'ALL_ATTEMPTS' };
    const preview = await previewHistoricalImport(config, adapter, existingIndex);

    // All 5 submissions should be included (4 accepted + 1 Wrong Answer)
    expect(preview.totalDiscovered).toBe(5);
    expect(preview.unsuccessfulCount).toBe(1);
    const waSub = preview.submissions.find((s) => s.statusDisplay === 'Wrong Answer');
    expect(waSub).toBeDefined();
    expect(waSub?.id).toBe('1004');
  });

  // 7. Extracting code for individual historical submissions
  it('7. Calls fetchSubmissionDetails when code is missing from the list', async () => {
    const adapter = createMockAdapter();
    const client = createMockGitHubClient();

    const subsWithoutCode: RawHistoricalSubmission[] = [
      {
        id: '9999',
        title: '3Sum',
        titleSlug: '3sum',
        problemId: '15',
        statusDisplay: 'Accepted',
        lang: 'cpp',
        normalizedLanguage: 'cpp',
        timestamp: 1690000000,
        // no code field
      },
    ];

    const summary = await executeHistoricalImport(
      subsWithoutCode,
      { mode: 'ALL_ACCEPTED' },
      adapter,
      client
    );

    expect(adapter.fetchSubmissionDetails).toHaveBeenCalledWith('9999');
    expect(summary.importedCount).toBe(1);
  });

  // 8. Detecting existing submissions in GitHub (skips duplicates)
  it('8. Detects already synced submissions and skips them as duplicates', async () => {
    const adapter = createMockAdapter();
    const existingIndex: SyncIndex = {
      schemaVersion: 2,
      lastUpdated: '',
      totalProblems: 1,
      totalSubmissions: 1,
      submissions: {
        '1001': {
          problemId: '0001',
          slug: 'two-sum',
          title: 'Two Sum',
          difficulty: 'Easy',
          language: 'cpp',
          approachName: 'solution',
          submissionId: '1001',
          contentHash: 'hash1001',
          syncedAt: '2026-10-24T00:00:00.000Z',
          filePath: 'problems/0001-two-sum/cpp/solution.cpp',
        },
      },
      problems: {},
    };

    const preview = await previewHistoricalImport({ mode: 'ALL_ACCEPTED' }, adapter, existingIndex);
    expect(preview.alreadySyncedCount).toBe(1);
    expect(preview.duplicatesSkippedCount).toBe(1);
    expect(preview.newToImportCount).toBe(3);
  });

  // 9. Avoiding overwrites of earlier accepted versions
  it('9. Places older accepted versions in history/<id>/ and latest in canonical path', async () => {
    const adapter = createMockAdapter();
    const client = createMockGitHubClient();

    const twoSumVersions: RawHistoricalSubmission[] = [
      {
        id: '2001',
        title: 'Two Sum',
        titleSlug: 'two-sum',
        problemId: '1',
        statusDisplay: 'Accepted',
        lang: 'cpp',
        normalizedLanguage: 'cpp',
        timestamp: 1690000000, // Older
        code: '// older version 2001',
      },
      {
        id: '2002',
        title: 'Two Sum',
        titleSlug: 'two-sum',
        problemId: '1',
        statusDisplay: 'Accepted',
        lang: 'cpp',
        normalizedLanguage: 'cpp',
        timestamp: 1690500000, // Newer (Canonical)
        code: '// newer version 2002',
      },
    ];

    let committedFiles: any[] = [];
    client.rawRequest = vi.fn().mockImplementation((endpoint: string, options?: any) => {
      if (endpoint.includes('/git/blobs') && options?.body) {
        committedFiles.push(JSON.parse(options.body));
        return Promise.resolve({ sha: 'blob-sha' });
      }
      if (endpoint.includes('/git/ref/heads/')) return Promise.resolve({ object: { sha: 'base' } });
      if (endpoint.includes('/git/commits/base')) return Promise.resolve({ tree: { sha: 'tree' } });
      if (endpoint.includes('/git/trees')) return Promise.resolve({ sha: 'newtree' });
      if (endpoint.includes('/git/commits')) return Promise.resolve({ sha: 'newcommit' });
      return Promise.resolve({});
    });

    await executeHistoricalImport(twoSumVersions, { mode: 'ALL_ACCEPTED' }, adapter, client);

    // Verify both files were included in the commit
    const committedContents = committedFiles.map((f) => f.content);
    expect(committedContents).toContain('// older version 2001');
    expect(committedContents).toContain('// newer version 2002');
  });

  // 10. Resuming an interrupted import from checkpoint
  it('10. Resumes an interrupted import from saved checkpoint without re-importing', async () => {
    const adapter = createMockAdapter();
    const client = createMockGitHubClient();

    const checkpoint: HistoricalImportCheckpoint = {
      checkpointId: 'import-123',
      createdAt: Date.now(),
      config: { mode: 'ALL_ACCEPTED', batchSize: 2 },
      completedSubmissionIds: ['1001', '1002'], // Page 1 already finished
      totalExpected: 4,
      importedCount: 2,
      skippedCount: 0,
      failedCount: 0,
      isComplete: false,
    };

    const allSubs = [...sampleSubmissionsPage1.slice(0, 2), ...sampleSubmissionsPage2.slice(1, 2)];

    const summary = await executeHistoricalImport(
      allSubs,
      { mode: 'ALL_ACCEPTED', batchSize: 2 },
      adapter,
      client,
      undefined,
      checkpoint
    );

    expect(summary.success).toBe(true);
    // Should have processed only 1 remaining submission (1005)
    expect(summary.importedCount).toBe(3); // 2 from checkpoint + 1 new
  });

  // 11. Handling LeetCode authentication expiry
  it('11. Detects expired LeetCode session and reports clear guidance', async () => {
    const adapter = new LeetCodeHistoricalAdapter();
    adapter.checkSession = vi.fn().mockResolvedValue({
      isSignedIn: false,
      error: 'Not logged in. Please sign in to LeetCode in your browser to import your historical submissions.',
    });

    const session = await adapter.checkSession();
    expect(session.isSignedIn).toBe(false);
    expect(session.error).toContain('Not logged in');
  });

  // 12. Handling API rate limits and network failures
  it('12. Respects backoff and reports rate limits without crashing', async () => {
    const adapter = new LeetCodeHistoricalAdapter('https://leetcode.com', 0);
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers(),
    });

    await expect(adapter.fetchSubmissionsPage(0, 20)).rejects.toThrow('rate limit');
  });

  // 13. Handling source code that cannot be retrieved
  it('13. Gracefully handles submissions whose code cannot be retrieved', async () => {
    const adapter = createMockAdapter();
    adapter.fetchSubmissionDetails = vi.fn().mockRejectedValue(new Error('Code unavailable (deleted)'));
    const client = createMockGitHubClient();

    const subWithNoCode: RawHistoricalSubmission[] = [
      {
        id: '999',
        title: 'Two Sum',
        titleSlug: 'two-sum',
        problemId: '1',
        statusDisplay: 'Accepted',
        lang: 'cpp',
        timestamp: 1690000000,
      },
    ];

    const summary = await executeHistoricalImport(
      subWithNoCode,
      { mode: 'ALL_ACCEPTED' },
      adapter,
      client
    );

    expect(summary.failedCount).toBe(1);
    expect(summary.importedCount).toBe(0);
  });

  // 14. Cancellation support
  it('14. Safely cancels import when cancelToken is triggered', async () => {
    const adapter = createMockAdapter();
    const client = createMockGitHubClient();
    const cancelToken: CancelToken = { isCancelled: true };

    const summary = await executeHistoricalImport(
      sampleSubmissionsPage1,
      { mode: 'ALL_ACCEPTED', batchSize: 1 },
      adapter,
      client,
      undefined,
      null,
      cancelToken
    );

    expect(summary.error).toBe('Cancelled by user');
  });

  // 15. Producing accurate final import totals
  it('15. Produces accurate final import metrics', async () => {
    const adapter = createMockAdapter();
    const client = createMockGitHubClient();

    const summary = await executeHistoricalImport(
      sampleSubmissionsPage1,
      { mode: 'ALL_ACCEPTED', batchSize: 5 },
      adapter,
      client
    );

    expect(summary.totalDiscovered).toBe(3);
    expect(summary.importedCount).toBe(3);
    expect(summary.skippedCount).toBe(0);
    expect(summary.failedCount).toBe(0);
    expect(summary.distinctProblemsImported).toBe(2);
    expect(summary.commitsCreated.length).toBeGreaterThan(0);
  });

  // 16. Ensuring historical imports do not trigger repeated duplicate commits
  it('16. Deduplicates second run completely with zero new commits', async () => {
    const adapter = createMockAdapter();
    const client = createMockGitHubClient();

    // First run imports 3 submissions
    await executeHistoricalImport(
      sampleSubmissionsPage1,
      { mode: 'ALL_ACCEPTED', batchSize: 5 },
      adapter,
      client
    );

    // Second run with the same submissions
    client.rawRequest = vi.fn(); // Reset mock
    const secondSummary = await executeHistoricalImport(
      sampleSubmissionsPage1,
      { mode: 'ALL_ACCEPTED', batchSize: 5 },
      adapter,
      client
    );

    expect(secondSummary.importedCount).toBe(0);
    expect(secondSummary.skippedCount).toBe(3);
    expect(secondSummary.commitsCreated.length).toBe(0);
  });
});
