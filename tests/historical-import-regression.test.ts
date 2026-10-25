import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeHistoricalImport } from '../src/core/sync/historical-importer';
import { RawHistoricalSubmission, HistoricalImportConfig } from '../src/core/types/historical-import';
import { SyncIndex } from '../src/core/types/sync-index';
import { GitHubClient } from '../src/core/github/client';
import { LeetCodeHistoricalAdapter } from '../src/core/leetcode/historical-adapter';
import { storage } from '../src/core/storage/chrome-storage';
import { isProviderUserNotFoundError, verifyLeetCodeUsername } from '../src/core/leetcode/profile-validator';

describe('Historical Import & LeetCode Statistics Regression Test Suite', () => {
  beforeEach(async () => {
    await storage.clear();
  });

  // Scenario 1: 58 historical submissions, 2 duplicates, 1 non-fast-forward conflict, recovery with refreshed HEAD and new commit parent, continuing to completion
  it('reproduces 58 submissions with duplicates and non-fast-forward conflict, rebuilding on fresh branch head', async () => {
    // Generate 58 submissions
    const submissions: RawHistoricalSubmission[] = [];
    for (let i = 1; i <= 58; i++) {
      const id = String(1000 + i);
      submissions.push({
        id,
        title: `Problem ${i}`,
        titleSlug: `problem-${i}`,
        problemId: String(i),
        statusDisplay: 'Accepted',
        lang: i % 5 === 0 ? 'mysql' : 'cpp',
        normalizedLanguage: i % 5 === 0 ? 'sql' : 'cpp',
        runtime: '10 ms',
        memory: '10 MB',
        timestamp: 1690000000 + i * 3600,
        code: `// solution for problem ${i}`,
      });
    }

    // First two submissions are already present in existing sync-index
    const existingIndex: SyncIndex = {
      schemaVersion: 2,
      lastUpdated: new Date().toISOString(),
      totalProblems: 2,
      totalSubmissions: 2,
      submissions: {
        '1001': {
          problemId: '0001',
          slug: 'problem-1',
          title: 'Problem 1',
          difficulty: 'Easy',
          language: 'cpp',
          approachName: 'solution',
          submissionId: '1001',
          contentHash: 'hash1',
          syncedAt: new Date().toISOString(),
          filePath: 'solutions/0001-problem-1/cpp/solution.cpp',
        },
        '1002': {
          problemId: '0002',
          slug: 'problem-2',
          title: 'Problem 2',
          difficulty: 'Medium',
          language: 'cpp',
          approachName: 'solution',
          submissionId: '1002',
          contentHash: 'hash2',
          syncedAt: new Date().toISOString(),
          filePath: 'solutions/0002-problem-2/cpp/solution.cpp',
        },
      },
      problems: {},
    };
    await storage.saveSyncIndex(existingIndex);

    const adapter = new LeetCodeHistoricalAdapter();
    adapter.fetchSubmissionDetails = vi.fn().mockImplementation((id: string) => {
      return Promise.resolve({
        code: `// Details for ${id}`,
        runtime: '5 ms',
        memory: '12 MB',
        problemId: id,
        topicTags: ['Array'],
      });
    });

    const client = new GitHubClient({
      token: 'fake-token',
      owner: 'test-user',
      repo: 'test-repo',
      branch: 'main',
      defaultPathPrefix: 'solutions',
    });

    let currentBranchHead = 'initial-head-sha';
    let patchCount = 0;
    const commitParentsMap = new Map<string, string[]>(); // commitSha -> parents

    client.getFileContent = vi.fn().mockResolvedValue(null);
    client.rawRequest = vi.fn().mockImplementation((endpoint: string, options?: any) => {
      // 1. Branch ref endpoints
      if (endpoint.includes('/git/ref/heads/')) {
        return Promise.resolve({ object: { sha: currentBranchHead } });
      }

      // 2. Commit parent inspection
      if (endpoint.includes('/git/commits/') && options?.method !== 'POST') {
        const sha = endpoint.split('/git/commits/')[1].split('?')[0];
        return Promise.resolve({
          sha,
          tree: { sha: `tree-for-${sha}` },
        });
      }

      // 3. Blob creation
      if (endpoint.includes('/git/blobs')) {
        return Promise.resolve({ sha: `blob-${Math.random().toString(36).slice(2, 7)}` });
      }

      // 4. Tree creation
      if (endpoint.includes('/git/trees')) {
        return Promise.resolve({ sha: `tree-${Math.random().toString(36).slice(2, 7)}` });
      }

      // 5. Commit creation: records the parents passed to verify ancestry
      if (endpoint.includes('/git/commits') && options?.method === 'POST') {
        const body = JSON.parse(options.body);
        const commitSha = `commit-${Math.random().toString(36).slice(2, 8)}`;
        commitParentsMap.set(commitSha, body.parents);
        return Promise.resolve({ sha: commitSha });
      }

      // 6. Branch ref update (PATCH)
      if (endpoint.includes('/git/refs/heads/') && options?.method === 'PATCH') {
        patchCount++;
        const body = JSON.parse(options.body);

        // Simulate non-fast-forward conflict on the first attempt of the first new batch
        if (patchCount === 1) {
          // Branch moves forward remotely to 'advanced-head-sha'
          currentBranchHead = 'advanced-head-sha';
          const err: any = new Error('Update is not a fast forward');
          err.status = 422;
          return Promise.reject(err);
        }

        // Subsequent attempts update current branch head to new commit SHA
        currentBranchHead = body.sha;
        return Promise.resolve({ object: { sha: body.sha } });
      }

      return Promise.resolve({});
    });

    const progressMessages: string[] = [];
    let latestProgressProcessed = 0;

    const config: HistoricalImportConfig = {
      mode: 'ALL_ACCEPTED',
      batchSize: 10,
      commitDateStrategy: 'IMPORT_DATE',
    };

    const summary = await executeHistoricalImport(
      submissions,
      config,
      adapter,
      client,
      (p) => {
        progressMessages.push(p.message);
        latestProgressProcessed = p.processedCount;
      }
    );

    // Verify 58 total submissions accounted for:
    // 2 duplicates skipped + 56 newly imported = 58 processed
    expect(summary.totalDiscovered).toBe(58);
    expect(summary.skippedCount).toBe(2);
    expect(summary.importedCount).toBe(56);
    expect(summary.failedCount).toBe(0);
    expect(latestProgressProcessed).toBe(58);
    expect(summary.success).toBe(true);

    // Verify non-fast-forward was retried
    expect(patchCount).toBeGreaterThan(1);

    // Verify retried commit parent was the refreshed 'advanced-head-sha'
    const parentsList = Array.from(commitParentsMap.values());
    const usedRefreshedParent = parentsList.some((parents) => parents.includes('advanced-head-sha'));
    expect(usedRefreshedParent).toBe(true);
  });

  // Scenario 2: Failed submission isolation: 1 failing record does not stop remaining records
  it('isolates a failing submission and continues processing remaining records to completion', async () => {
    const submissions: RawHistoricalSubmission[] = [
      {
        id: '2001',
        title: 'Good Problem 1',
        titleSlug: 'good-problem-1',
        problemId: '1',
        statusDisplay: 'Accepted',
        lang: 'cpp',
        timestamp: 1690001000,
        code: 'void f() {}',
      },
      {
        id: '2002',
        title: 'Corrupt Problem 2',
        titleSlug: 'corrupt-problem-2',
        problemId: '2',
        statusDisplay: 'Accepted',
        lang: 'cpp',
        timestamp: 1690002000,
        code: '', // Missing code and details will fail
      },
      {
        id: '2003',
        title: 'Good Problem 3',
        titleSlug: 'good-problem-3',
        problemId: '3',
        statusDisplay: 'Accepted',
        lang: 'cpp',
        timestamp: 1690003000,
        code: 'void g() {}',
      },
    ];

    const adapter = new LeetCodeHistoricalAdapter();
    adapter.fetchSubmissionDetails = vi.fn().mockImplementation((id: string) => {
      if (id === '2002') {
        return Promise.reject(new Error('Submission details not found on LeetCode'));
      }
      return Promise.resolve({
        code: 'int main() {}',
        problemId: id,
        runtime: '1 ms',
        memory: '1 MB',
      });
    });

    const client = new GitHubClient({
      token: 'fake-token',
      owner: 'test-user',
      repo: 'test-repo',
      branch: 'main',
      defaultPathPrefix: 'solutions',
    });

    client.getFileContent = vi.fn().mockResolvedValue(null);
    client.rawRequest = vi.fn().mockImplementation((endpoint: string, options?: any) => {
      if (endpoint.includes('/git/ref/heads/')) {
        return Promise.resolve({ object: { sha: 'head-sha' } });
      }
      if (endpoint.includes('/git/commits/') && options?.method !== 'POST') {
        return Promise.resolve({ tree: { sha: 'tree-sha' } });
      }
      if (endpoint.includes('/git/blobs') || endpoint.includes('/git/trees')) {
        return Promise.resolve({ sha: 'blob-or-tree-sha' });
      }
      if (endpoint.includes('/git/commits') && options?.method === 'POST') {
        return Promise.resolve({ sha: 'new-commit-sha' });
      }
      if (endpoint.includes('/git/refs/heads/') && options?.method === 'PATCH') {
        return Promise.resolve({ object: { sha: 'new-commit-sha' } });
      }
      return Promise.resolve({});
    });

    const summary = await executeHistoricalImport(
      submissions,
      { mode: 'ALL_ACCEPTED', batchSize: 5 },
      adapter,
      client
    );

    // 2 good problems imported, 1 corrupt problem failed, 3 total processed
    expect(summary.importedCount).toBe(2);
    expect(summary.failedCount).toBe(1);
    expect(summary.totalDiscovered).toBe(3);
    expect(summary.success).toBe(true);
  });

  // Scenario 3: Resumes from checkpoint without duplicating already committed work
  it('resumes from existing checkpoint and skips previously confirmed submissions', async () => {
    const submissions: RawHistoricalSubmission[] = [
      { id: '3001', title: 'P1', titleSlug: 'p-1', statusDisplay: 'Accepted', lang: 'cpp', timestamp: 100, code: 'int a;' },
      { id: '3002', title: 'P2', titleSlug: 'p-2', statusDisplay: 'Accepted', lang: 'cpp', timestamp: 200, code: 'int b;' },
      { id: '3003', title: 'P3', titleSlug: 'p-3', statusDisplay: 'Accepted', lang: 'cpp', timestamp: 300, code: 'int c;' },
    ];

    // Seed checkpoint showing 3001 already confirmed
    await storage.saveHistoricalCheckpoint({
      checkpointId: 'chk-1',
      createdAt: Date.now(),
      config: { mode: 'ALL_ACCEPTED' },
      commitDateStrategy: 'IMPORT_DATE',
      completedSubmissionIds: ['3001'],
      totalExpected: 3,
      importedCount: 1,
      skippedCount: 0,
      failedCount: 0,
      isComplete: false,
    });

    const checkpoint = await storage.getHistoricalCheckpoint();
    const adapter = new LeetCodeHistoricalAdapter();
    const client = new GitHubClient({ token: 'fake', owner: 'u', repo: 'r', branch: 'main', defaultPathPrefix: 'solutions' });

    client.getFileContent = vi.fn().mockResolvedValue(null);
    client.rawRequest = vi.fn().mockImplementation((endpoint: string, options?: any) => {
      if (endpoint.includes('/git/ref/heads/')) return Promise.resolve({ object: { sha: 'head' } });
      if (endpoint.includes('/git/commits/') && options?.method !== 'POST') return Promise.resolve({ tree: { sha: 't' } });
      if (endpoint.includes('/git/blobs') || endpoint.includes('/git/trees')) return Promise.resolve({ sha: 'bt' });
      if (endpoint.includes('/git/commits') && options?.method === 'POST') return Promise.resolve({ sha: 'commit-2' });
      if (endpoint.includes('/git/refs/heads/') && options?.method === 'PATCH') return Promise.resolve({ object: { sha: 'commit-2' } });
      return Promise.resolve({});
    });

    const summary = await executeHistoricalImport(
      submissions,
      { mode: 'ALL_ACCEPTED', batchSize: 5 },
      adapter,
      client,
      undefined,
      checkpoint
    );

    // 1 previously completed + 2 newly imported = 3 total
    expect(summary.importedCount).toBe(3);
    expect(summary.totalDiscovered).toBe(3);
  });

  // Scenario 4: Detects provider "User Not Found" SVG and rejects it as invalid
  it('detects JacobLinCool provider "User Not Found" SVG error responses', () => {
    const errorSvg = `<svg width="500" height="200" viewBox="0 0 500 200"><title id="_1">User Not Found | LeetCode Stats Card</title><text id="username-text">User Not Found</text><text id="total-solved-text">810</text></svg>`;
    const validSvg = `<svg width="500" height="200" viewBox="0 0 500 200"><title>tourist | LeetCode Stats Card</title><text id="username-text">tourist</text><text id="total-solved-text">4</text></svg>`;

    expect(isProviderUserNotFoundError(errorSvg)).toBe(true);
    expect(isProviderUserNotFoundError(validSvg)).toBe(false);
  });

  // Scenario 5: verifyLeetCodeUsername checks LeetCode GraphQL and rejects nonexistent users
  it('rejects nonexistent usernames from LeetCode GraphQL verification', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { matchedUser: null },
        errors: [{ message: 'That user does not exist.' }],
      }),
    } as any);

    try {
      const result = await verifyLeetCodeUsername('nonexistent_user_abc');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('does not exist on LeetCode');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // Scenario 6: verifyLeetCodeUsername extracts real account statistics when user exists
  it('extracts real account statistics on verified LeetCode user', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('graphql')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: {
              matchedUser: {
                username: 'verified_user',
                submitStatsGlobal: {
                  acSubmissionNum: [
                    { difficulty: 'All', count: 42 },
                    { difficulty: 'Easy', count: 20 },
                    { difficulty: 'Medium', count: 18 },
                    { difficulty: 'Hard', count: 4 },
                  ],
                },
              },
            },
          }),
        });
      }
      // JacobLinCool card check
      return Promise.resolve({
        ok: true,
        text: async () => `<svg><title>verified_user</title><text id="username-text">verified_user</text></svg>`,
      });
    });

    try {
      const result = await verifyLeetCodeUsername('verified_user');
      expect(result.valid).toBe(true);
      expect(result.username).toBe('verified_user');
      expect(result.stats?.totalSolved).toBe(42);
      expect(result.stats?.easySolved).toBe(20);
      expect(result.stats?.mediumSolved).toBe(18);
      expect(result.stats?.hardSolved).toBe(4);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
