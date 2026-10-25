import { describe, it, expect, vi } from 'vitest';
import {
  extractLeetCodeUsername,
  getLeetCodeProfileUrl,
  getLeetCodeStatsCardUrl,
  getLeetCodeHeatmapUrl,
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

    it('generates stats card URLs with optional cache buster', () => {
      expect(getLeetCodeStatsCardUrl('tourist')).toBe(
        'https://leetcard.jacoblin.cool/tourist?theme=dark&font=Roboto'
      );
      expect(getLeetCodeStatsCardUrl('tourist', 1700000000)).toBe(
        'https://leetcard.jacoblin.cool/tourist?theme=dark&font=Roboto&v=1700000000'
      );
      expect(getLeetCodeStatsCardUrl('https://leetcode.com/u/tourist/', 'bust')).toBe(
        'https://leetcard.jacoblin.cool/tourist?theme=dark&font=Roboto&v=bust'
      );
    });

    it('generates heatmap URLs with optional cache buster', () => {
      expect(getLeetCodeHeatmapUrl('tourist')).toBe(
        'https://leetcard.jacoblin.cool/tourist?ext=heatmap&theme=dark'
      );
      expect(getLeetCodeHeatmapUrl('tourist', 1700000000)).toBe(
        'https://leetcard.jacoblin.cool/tourist?ext=heatmap&theme=dark&v=1700000000'
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
  });
});
