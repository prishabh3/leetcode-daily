import { describe, it, expect } from 'vitest';
import { parseLeetCodeUrl } from '../src/core/utils/url-parser';

describe('1. Problem URL and metadata parsing', () => {
  it('parses standard problem URLs correctly', () => {
    const res = parseLeetCodeUrl('https://leetcode.com/problems/two-sum/');
    expect(res.isValid).toBe(true);
    expect(res.slug).toBe('two-sum');
    expect(res.inferredTitle).toBe('Two Sum');
    expect(res.submissionId).toBeUndefined();
  });

  it('parses submissions URL with submission ID', () => {
    const res = parseLeetCodeUrl('https://leetcode.com/problems/longest-substring-without-repeating-characters/submissions/123456789/');
    expect(res.isValid).toBe(true);
    expect(res.slug).toBe('longest-substring-without-repeating-characters');
    expect(res.inferredTitle).toBe('Longest Substring Without Repeating Characters');
    expect(res.submissionId).toBe('123456789');
  });

  it('supports leetcode.cn URLs', () => {
    const res = parseLeetCodeUrl('https://leetcode.cn/problems/3sum-closest/');
    expect(res.isValid).toBe(true);
    expect(res.slug).toBe('3sum-closest');
    expect(res.inferredTitle).toBe('3Sum Closest');
  });

  it('handles invalid or non-LeetCode URLs safely', () => {
    expect(parseLeetCodeUrl('https://github.com/torvalds/linux').isValid).toBe(false);
    expect(parseLeetCodeUrl('not-a-url').isValid).toBe(false);
    expect(parseLeetCodeUrl('').isValid).toBe(false);
  });
});
