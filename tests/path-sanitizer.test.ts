import { describe, it, expect } from 'vitest';
import {
  formatProblemId,
  sanitizeSlug,
  sanitizeApproachName,
  getProblemDirectory,
  getSolutionFilePath,
  getMetadataFilePath,
  getNotesFilePath,
} from '../src/core/sync/path-sanitizer';

describe('3. File path sanitization', () => {
  it('pads numeric problem IDs to 4 digits', () => {
    expect(formatProblemId(1)).toBe('0001');
    expect(formatProblemId('15')).toBe('0015');
    expect(formatProblemId('234')).toBe('0234');
    expect(formatProblemId('1542')).toBe('1542');
  });

  it('sanitizes slugs and prevents directory traversal attacks', () => {
    expect(sanitizeSlug('../../etc/passwd')).toBe('etc-passwd');
    expect(sanitizeSlug('two sum / special ? * & characters')).toBe('two-sum-special-characters');
    expect(sanitizeSlug('valid-slug_123')).toBe('valid-slug_123');
    expect(sanitizeApproachName('default')).toBe('solution');
    expect(sanitizeApproachName('Hash Map (Optimal)')).toBe('hash-map-optimal');
  });

  it('generates consistent problem directories', () => {
    expect(getProblemDirectory(1, 'two-sum')).toBe('0001-two-sum');
    expect(getProblemDirectory('3', 'Longest Substring Without Repeating Characters')).toBe(
      '0003-longest-substring-without-repeating-characters'
    );
  });

  it('generates correct solution file paths with approach names', () => {
    // Default basePrefix should now be 'solutions'
    const defaultPath = getSolutionFilePath('1', 'two-sum', 'cpp', 'solution');
    expect(defaultPath).toBe('solutions/0001-two-sum/cpp/solution.cpp');

    const path1 = getSolutionFilePath('1', 'two-sum', 'cpp', 'solution', 'problems');
    expect(path1).toBe('problems/0001-two-sum/cpp/solution.cpp');

    const path2 = getSolutionFilePath('1', 'two-sum', 'cpp', 'Hash Map (Optimal)', 'problems');
    expect(path2).toBe('problems/0001-two-sum/cpp/hash-map-optimal.cpp');

    const path3 = getSolutionFilePath('20', 'valid-parentheses', 'python3', 'stack', 'leetcode-daily');
    expect(path3).toBe('leetcode-daily/0020-valid-parentheses/python3/stack.py');
  });

  it('generates correct metadata and notes paths', () => {
    // Default basePrefix is 'solutions'
    expect(getMetadataFilePath('1', 'two-sum')).toBe('solutions/0001-two-sum/metadata.json');
    expect(getNotesFilePath('1', 'two-sum')).toBe('solutions/0001-two-sum/notes.md');

    // Explicit basePrefix
    expect(getMetadataFilePath('1', 'two-sum', 'problems')).toBe('problems/0001-two-sum/metadata.json');
    expect(getNotesFilePath('1', 'two-sum', 'problems')).toBe('problems/0001-two-sum/notes.md');
  });
});
