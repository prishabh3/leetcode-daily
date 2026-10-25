import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeetCodeHistoricalAdapter } from '../src/core/leetcode/historical-adapter';
import { generateLeetCodeStatsSvg } from '../src/core/generator/svg-generator';
import { LeetCodeAccountStats } from '../src/core/types/settings';

describe('LeetCode Authenticated Session Connection & Verification Suite', () => {
  let adapter: LeetCodeHistoricalAdapter;

  beforeEach(() => {
    adapter = new LeetCodeHistoricalAdapter('https://leetcode.com', 0);
  });

  it('1. Successfully verifies active session and fetches account-wide stats', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockImplementation((url: string, init: any) => {
      const body = JSON.parse(init.body);
      if (body.query.includes('userStatus')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              userStatus: {
                isSignedIn: true,
                username: 'prishabh',
                realName: 'prishabh',
                userSlug: 'prishabh',
              },
            },
          }),
        } as any);
      }
      if (body.query.includes('userPublicProfile')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              matchedUser: {
                username: 'prishabh',
                profile: {
                  ranking: 4525348,
                },
                submitStatsGlobal: {
                  acSubmissionNum: [
                    { difficulty: 'All', count: 20 },
                    { difficulty: 'Easy', count: 15 },
                    { difficulty: 'Medium', count: 4 },
                    { difficulty: 'Hard', count: 1 },
                  ],
                },
              },
            },
          }),
        } as any);
      }
      return Promise.reject(new Error('Unknown query'));
    });

    try {
      const identity = await adapter.checkAuthenticatedIdentity();
      expect(identity.status).toBe('CONNECTED');
      expect(identity.username).toBe('prishabh');
      expect(identity.authMethod).toBe('session');
      expect(identity.stats).toBeDefined();
      expect(identity.stats?.totalSolved).toBe(20);
      expect(identity.stats?.easySolved).toBe(15);
      expect(identity.stats?.mediumSolved).toBe(4);
      expect(identity.stats?.hardSolved).toBe(1);
      expect(identity.stats?.ranking).toBe(4525348);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('2. Detects expired session gracefully and prompts reconnection', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          userStatus: {
            isSignedIn: false,
          },
        },
      }),
    } as any);

    try {
      const identity = await adapter.checkAuthenticatedIdentity();
      expect(identity.status).toBe('EXPIRED');
      expect(identity.username).toBeUndefined();
      expect(identity.error).toContain('Not logged in');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('3. Handles API rate limit (HTTP 429) with status ERROR and retry notification', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    } as any);

    try {
      const identity = await adapter.checkAuthenticatedIdentity();
      expect(identity.status).toBe('ERROR');
      expect(identity.error).toContain('HTTP 429');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('4. Handles reconnection flow from expired to connected', async () => {
    const originalFetch = globalThis.fetch;
    let loggedIn = false;

    globalThis.fetch = vi.fn().mockImplementation((url: string, init: any) => {
      const body = JSON.parse(init.body);
      if (body.query.includes('userStatus')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              userStatus: loggedIn
                ? { isSignedIn: true, username: 'prishabh', userSlug: 'prishabh' }
                : { isSignedIn: false },
            },
          }),
        } as any);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            matchedUser: {
              username: 'prishabh',
              submitStatsGlobal: {
                acSubmissionNum: [{ difficulty: 'All', count: 20 }],
              },
            },
          },
        }),
      } as any);
    });

    try {
      // First attempt: expired
      const attempt1 = await adapter.checkAuthenticatedIdentity();
      expect(attempt1.status).toBe('EXPIRED');

      // User signs in on LeetCode website...
      loggedIn = true;

      // Second attempt: now connected
      const attempt2 = await adapter.checkAuthenticatedIdentity();
      expect(attempt2.status).toBe('CONNECTED');
      expect(attempt2.username).toBe('prishabh');
      expect(attempt2.stats?.totalSolved).toBe(20);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('5. Generates local SVG card with verified account stats', () => {
    const stats: LeetCodeAccountStats = {
      totalSolved: 20,
      easySolved: 15,
      mediumSolved: 4,
      hardSolved: 1,
      ranking: 4525348,
    };

    const svg = generateLeetCodeStatsSvg('prishabh', stats, 'us');
    expect(svg).toContain('<svg');
    expect(svg).toContain('LeetCode Account Stats');
    expect(svg).toContain('@prishabh');
    expect(svg).toContain('Rank #4525348');
    expect(svg).toContain('15'); // Easy
    expect(svg).toContain('4');  // Medium
    expect(svg).toContain('1');  // Hard
    expect(svg).toContain('20'); // Total
    expect(svg).toContain('leetcode.com');
  });
});
