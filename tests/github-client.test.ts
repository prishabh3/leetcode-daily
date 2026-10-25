import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubClient } from '../src/core/github/client';
import { createAtomicCommit } from '../src/core/github/git-database';
import { sanitizeErrorSecret, GitHubError } from '../src/core/github/rate-limiter';

describe('10, 11, 12. GitHub client authentication, rate limits, and branch concurrency conflicts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('10. Masks secrets in error messages and identifies auth failures', async () => {
    const rawError = 'Bad credentials for token github_pat_11AAAAABBBBB22222333334444455555';
    const sanitized = sanitizeErrorSecret(rawError);
    expect(sanitized).not.toContain('github_pat_11AAAAABBBBB22222333334444455555');
    expect(sanitized).toContain('[REDACTED_FINE_GRAINED_TOKEN]');

    // Mock 401 response from GitHub
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
      json: () => Promise.resolve({ message: 'Bad credentials' }),
    });

    const client = new GitHubClient({
      token: 'github_pat_invalid_token',
      owner: 'test',
      repo: 'test-repo',
      branch: 'main',
      defaultPathPrefix: 'problems',
    });

    const testRes = await client.testConnection();
    expect(testRes.success).toBe(false);
    expect(testRes.message).toContain('Authentication failed');
  });

  it('11. Detects rate limit exceeded from response headers and status 403', async () => {
    const headers = new Headers();
    headers.set('x-ratelimit-remaining', '0');
    headers.set('x-ratelimit-reset', '1700000000');

    const error = new GitHubError('API rate limit exceeded for user', 403, headers);
    expect(error.isRateLimit).toBe(true);
    expect(error.rateLimitRemaining).toBe(0);
    expect(error.rateLimitResetTime).toBeDefined();
  });

  it('12. Retries on conflicting updates to the target branch (409 non-fast-forward)', async () => {
    const mockClient = {
      rawSettings: {
        token: 'valid-token',
        owner: 'test-owner',
        repo: 'test-repo',
        branch: 'main',
      },
      putSingleFile: vi.fn(),
      rawRequest: vi.fn(),
    } as unknown as GitHubClient;

    let updateAttempts = 0;

    (mockClient.rawRequest as any).mockImplementation((endpoint: string, options?: any) => {
      // 1. Branch ref endpoints (GET /git/ref/heads/ or PATCH /git/refs/heads/)
      if (endpoint.includes('/git/ref/heads/') || endpoint.includes('/git/refs/heads/')) {
        if (options && options.method === 'PATCH') {
          updateAttempts++;
          if (updateAttempts === 1) {
            // First attempt: simulate 409 conflict from another commit pushing first
            const err = new GitHubError('Reference update failed: not a fast forward', 409);
            return Promise.reject(err);
          }
          // Second attempt: succeeds
          return Promise.resolve({ object: { sha: 'new-commit-sha-2' } });
        }
        return Promise.resolve({ object: { sha: 'base-commit-sha' } });
      }

      // 2. Commits endpoint
      if (endpoint.includes('/git/commits')) {
        if (options && options.method === 'POST') {
          return Promise.resolve({ sha: 'new-commit-sha-2' });
        }
        return Promise.resolve({ sha: 'base-commit-sha', tree: { sha: 'base-tree-sha' } });
      }

      // 3. Blob creation
      if (endpoint.includes('/git/blobs')) {
        return Promise.resolve({ sha: 'blob-sha' });
      }

      // 4. Tree creation
      if (endpoint.includes('/git/trees')) {
        return Promise.resolve({ sha: 'new-tree-sha' });
      }

      return Promise.resolve({});
    });

    const commitSha = await createAtomicCommit(mockClient, {
      message: 'feat: add solution',
      files: [{ path: 'problems/0001-two-sum/cpp/solution.cpp', content: '// code' }],
      maxRetries: 3,
    });

    expect(commitSha).toBe('new-commit-sha-2');
    expect(updateAttempts).toBe(2); // Verified bounded retry on 409 conflict!
  });
});
