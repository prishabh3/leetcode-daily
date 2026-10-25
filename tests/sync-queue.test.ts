import { describe, it, expect, vi } from 'vitest';
import { SyncQueueManager } from '../src/core/sync/sync-queue-manager';
import { PlatformSubmission } from '../src/core/types/submission';
import { storage } from '../src/core/storage/chrome-storage';
import { GitHubClient } from '../src/core/github/client';

describe('8 & 9. Sync queue state transitions & Retry behavior', () => {
  const sampleSubmission: PlatformSubmission = {
    problemId: '20',
    problemTitle: 'Valid Parentheses',
    problemSlug: 'valid-parentheses',
    url: 'https://leetcode.com/problems/valid-parentheses/',
    difficulty: 'Easy',
    language: 'cpp',
    code: 'class Solution { public: bool isValid(string s) { return true; } };',
    submissionId: '555666777',
    timestamp: Date.now(),
    status: 'Accepted',
  };

  it('enqueues submission in Pending state', async () => {
    const queueManager = new SyncQueueManager();
    const item = await queueManager.enqueue(sampleSubmission, {
      approachName: 'stack-solution',
      confidence: 4,
    });

    expect(item.status).toBe('Pending');
    expect(item.attemptCount).toBe(0);

    const storedQueue = await storage.getSyncQueue();
    expect(storedQueue.length).toBeGreaterThan(0);
    expect(storedQueue[0].id).toBe(item.id);
  });

  it('transitions state to Synced on successful execution', async () => {
    const queueManager = new SyncQueueManager();
    await storage.saveSyncQueue([]); // clear queue

    await queueManager.enqueue(sampleSubmission, { approachName: 'stack' });

    // Mock GitHubClient with successful response
    const mockClient = {
      rawSettings: {
        token: 'mock-token',
        owner: 'testowner',
        repo: 'leetcode-daily',
        branch: 'main',
        defaultPathPrefix: 'problems',
      },
      getFileContent: vi.fn().mockResolvedValue(null),
      putSingleFile: vi.fn().mockResolvedValue('commit-sha-12345'),
      rawRequest: vi.fn().mockImplementation((endpoint: string) => {
        if (endpoint.includes('/git/ref/heads/')) {
          return Promise.resolve({ object: { sha: 'base-commit-sha' } });
        }
        if (endpoint.includes('/git/commits/')) {
          return Promise.resolve({ sha: 'commit-sha', tree: { sha: 'base-tree-sha' } });
        }
        if (endpoint.includes('/git/blobs')) {
          return Promise.resolve({ sha: 'blob-sha' });
        }
        if (endpoint.includes('/git/trees')) {
          return Promise.resolve({ sha: 'new-tree-sha' });
        }
        if (endpoint.includes('/git/refs/heads/')) {
          return Promise.resolve({});
        }
        return Promise.resolve({});
      }),
    } as unknown as GitHubClient;

    await queueManager.processQueue(mockClient);

    const updatedQueue = await storage.getSyncQueue();
    expect(updatedQueue[0].status).toBe('Synced');
    expect(updatedQueue[0].attemptCount).toBe(1);
  });

  it('9. Increments attempt count and transitions to Needs Attention after max retries fail', async () => {
    const queueManager = new SyncQueueManager();
    await storage.saveSyncQueue([]);

    const item = await queueManager.enqueue(sampleSubmission, { approachName: 'failing-test' });

    // Mock failing GitHub client
    const failingClient = {
      rawSettings: {
        token: 'bad-token',
        owner: 'testowner',
        repo: 'testrepo',
        branch: 'main',
        defaultPathPrefix: 'problems',
      },
      getFileContent: vi.fn().mockRejectedValue(new Error('Network error')),
      rawRequest: vi.fn().mockRejectedValue(new Error('Permanent failure')),
    } as unknown as GitHubClient;

    // Run 3 attempts
    await queueManager.processQueue(failingClient);
    let q = await storage.getSyncQueue();
    expect(q[0].status).toBe('Failed');
    expect(q[0].attemptCount).toBe(1);

    // Reset status to retry
    await queueManager.retryItem(item.id, failingClient);
    q = await storage.getSyncQueue();
    expect(q[0].attemptCount).toBe(2);

    await queueManager.retryItem(item.id, failingClient);
    q = await storage.getSyncQueue();
    expect(q[0].attemptCount).toBe(3);
    expect(q[0].status).toBe('Needs Attention');
  });
});
