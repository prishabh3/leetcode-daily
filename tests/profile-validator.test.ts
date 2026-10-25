import { describe, it, expect, vi } from 'vitest';
import {
  extractLeetCodeUsername,
  detectLeetCodeSite,
  getLeetCodeProfileUrl,
  getLeetCodeStatsCardUrl,
  getLeetCodeHeatmapUrl,
  isProviderUserNotFoundError,
  shouldEmbedLeetCodeStatsCard,
  verifyLeetCodeUsername,
} from '../src/core/leetcode/profile-validator';

describe('LeetCode Profile Validator', () => {
  describe('extractLeetCodeUsername', () => {
    it('handles clean plain usernames', () => {
      expect(extractLeetCodeUsername('tourist')).toBe('tourist');
      expect(extractLeetCodeUsername('john_doe')).toBe('john_doe');
      expect(extractLeetCodeUsername('alice-123')).toBe('alice-123');
      expect(extractLeetCodeUsername('prishabh3')).toBe('prishabh3');
    });

    it('handles usernames with leading @ or whitespace', () => {
      expect(extractLeetCodeUsername('@tourist')).toBe('tourist');
      expect(extractLeetCodeUsername('  tourist  ')).toBe('tourist');
      expect(extractLeetCodeUsername('  @tourist  ')).toBe('tourist');
    });

    it('extracts username from standard LeetCode profile URLs', () => {
      expect(extractLeetCodeUsername('https://leetcode.com/u/tourist/')).toBe('tourist');
      expect(extractLeetCodeUsername('https://leetcode.com/u/tourist')).toBe('tourist');
      expect(extractLeetCodeUsername('http://leetcode.com/u/tourist/')).toBe('tourist');
      expect(extractLeetCodeUsername('leetcode.com/u/tourist/')).toBe('tourist');
      expect(extractLeetCodeUsername('https://leetcode.com/tourist/')).toBe('tourist');
      expect(extractLeetCodeUsername('https://leetcode.com/tourist')).toBe('tourist');
    });

    it('extracts username from LeetCode CN profile URLs', () => {
      expect(extractLeetCodeUsername('https://leetcode.cn/u/tourist/')).toBe('tourist');
      expect(extractLeetCodeUsername('https://leetcode.cn/tourist')).toBe('tourist');
    });

    it('extracts username and ignores query parameters and hash fragments', () => {
      expect(extractLeetCodeUsername('https://leetcode.com/u/tourist?theme=dark#overview')).toBe('tourist');
    });

    it('rejects LeetCode problem URLs and system paths', () => {
      expect(extractLeetCodeUsername('https://leetcode.com/problems/two-sum/')).toBeNull();
      expect(extractLeetCodeUsername('https://leetcode.com/problemset/all/')).toBeNull();
      expect(extractLeetCodeUsername('https://leetcode.com/contest/')).toBeNull();
      expect(extractLeetCodeUsername('https://leetcode.com/explore/')).toBeNull();
      expect(extractLeetCodeUsername('https://leetcode.com/discuss/')).toBeNull();
    });

    it('rejects invalid username formats or lengths', () => {
      expect(extractLeetCodeUsername(null)).toBeNull();
      expect(extractLeetCodeUsername(undefined)).toBeNull();
      expect(extractLeetCodeUsername('')).toBeNull();
      expect(extractLeetCodeUsername('   ')).toBeNull();
      expect(extractLeetCodeUsername('ab')).toBeNull(); // < 3 characters
      expect(extractLeetCodeUsername('a'.repeat(31))).toBeNull(); // > 30 characters
      expect(extractLeetCodeUsername('user name')).toBeNull(); // spaces
      expect(extractLeetCodeUsername('user$name')).toBeNull(); // special chars
    });
  });

  describe('URL Generators', () => {
    it('generates canonical LeetCode profile URLs', () => {
      expect(getLeetCodeProfileUrl('tourist')).toBe('https://leetcode.com/u/tourist/');
      expect(getLeetCodeProfileUrl('https://leetcode.com/u/tourist/')).toBe('https://leetcode.com/u/tourist/');
    });

    it('generates stats card URLs with optional cache buster and site parameter', () => {
      expect(getLeetCodeStatsCardUrl('tourist')).toBe(
        'https://leetcard.jacoblin.cool/tourist?theme=dark&font=Roboto'
      );
      expect(getLeetCodeStatsCardUrl('tourist', 1700000000)).toBe(
        'https://leetcard.jacoblin.cool/tourist?theme=dark&font=Roboto&v=1700000000'
      );
      expect(getLeetCodeStatsCardUrl('tourist', 'cn')).toBe(
        'https://leetcard.jacoblin.cool/tourist?theme=dark&font=Roboto&site=cn'
      );
      expect(getLeetCodeStatsCardUrl('tourist', 'cn', 1700000000)).toBe(
        'https://leetcard.jacoblin.cool/tourist?theme=dark&font=Roboto&site=cn&v=1700000000'
      );
      expect(getLeetCodeStatsCardUrl('https://leetcode.com/u/tourist/', 'bust')).toBe(
        'https://leetcard.jacoblin.cool/tourist?theme=dark&font=Roboto&v=bust'
      );
    });

    it('generates heatmap URLs with optional cache buster and site parameter', () => {
      expect(getLeetCodeHeatmapUrl('tourist')).toBe(
        'https://leetcard.jacoblin.cool/tourist?ext=heatmap&theme=dark'
      );
      expect(getLeetCodeHeatmapUrl('tourist', 1700000000)).toBe(
        'https://leetcard.jacoblin.cool/tourist?ext=heatmap&theme=dark&v=1700000000'
      );
      expect(getLeetCodeHeatmapUrl('tourist', 'cn')).toBe(
        'https://leetcard.jacoblin.cool/tourist?ext=heatmap&theme=dark&site=cn'
      );
      expect(getLeetCodeHeatmapUrl('tourist', 'cn', 1700000000)).toBe(
        'https://leetcard.jacoblin.cool/tourist?ext=heatmap&theme=dark&site=cn&v=1700000000'
      );
    });
  });

  describe('verifyLeetCodeUsername', () => {
    it('returns error immediately for invalid input without network call', async () => {
      const res = await verifyLeetCodeUsername('ab');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Invalid LeetCode username format');
    });

    it('verifies existing user via mocked LeetCode GraphQL response', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            matchedUser: { username: 'testuser' },
          },
        }),
      } as any);

      try {
        const res = await verifyLeetCodeUsername('testuser');
        expect(res.valid).toBe(true);
        expect(res.username).toBe('testuser');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('returns invalid if user is not found on LeetCode', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            matchedUser: null,
          },
        }),
      } as any);

      try {
        const res = await verifyLeetCodeUsername('nonexistentuser999');
        expect(res.valid).toBe(false);
        expect(res.error).toContain('does not exist on LeetCode');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('detects JacobLinCool User Not Found SVG output and flags as invalid', async () => {
      const originalFetch = globalThis.fetch;
      // GraphQL fails/offline, but JacobLinCool returns 200 with User Not Found SVG
      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('graphql')) {
          return Promise.reject(new Error('GraphQL unavailable'));
        }
        return Promise.resolve({
          ok: true,
          text: async () => '<svg><title>User Not Found | LeetCode Stats Card</title><text id="username-text">User Not Found</text></svg>',
        } as any);
      });

      try {
        const res = await verifyLeetCodeUsername('prishabh3');
        expect(res.valid).toBe(false);
        expect(res.state).toBe('INVALID_USERNAME');
        expect(res.error).toContain('User Not Found');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe('Site Detection & Embed Guard', () => {
    it('detects site correctly between Global (leetcode.com) and CN (leetcode.cn)', () => {
      expect(detectLeetCodeSite('https://leetcode.cn/u/someone/')).toBe('cn');
      expect(detectLeetCodeSite('https://leetcode.com/u/someone/')).toBe('us');
      expect(detectLeetCodeSite('someone')).toBe('us');
      expect(detectLeetCodeSite(undefined)).toBe('us');
    });

    it('detects provider User Not Found SVG patterns correctly', () => {
      expect(isProviderUserNotFoundError('<title>User Not Found | LeetCode Stats Card</title>')).toBe(true);
      expect(isProviderUserNotFoundError('<text id="username-text">User Not Found</text>')).toBe(true);
      expect(isProviderUserNotFoundError('<text id="username-text">tourist</text>')).toBe(false);
      expect(isProviderUserNotFoundError('')).toBe(true);
    });

    it('shouldEmbedLeetCodeStatsCard only returns true for VALID state', () => {
      expect(shouldEmbedLeetCodeStatsCard({ state: 'VALID', valid: true })).toBe(true);
      expect(shouldEmbedLeetCodeStatsCard({ state: 'INVALID_USERNAME', valid: false })).toBe(false);
      expect(shouldEmbedLeetCodeStatsCard({ state: 'UNVERIFIED', valid: false })).toBe(false);
      expect(shouldEmbedLeetCodeStatsCard({ state: 'PROVIDER_UNAVAILABLE', valid: false })).toBe(false);
      expect(shouldEmbedLeetCodeStatsCard(null)).toBe(false);
      expect(shouldEmbedLeetCodeStatsCard(undefined)).toBe(false);
    });
  });
});
