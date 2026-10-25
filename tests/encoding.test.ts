import { describe, it, expect } from 'vitest';
import { base64ToUtf8, utf8ToBase64 } from '../src/core/utils/encoding';

describe('UTF-8 Safe Base64 Encoding & Mojibake Prevention', () => {
  it('correctly round-trips emojis and multi-byte UTF-8 sequences without corruption', () => {
    const originalText = `
# ⚡ LC-Sync: Personal DSA Learning & GitHub Automation Platform 🚀
🌟 Problem: Roman to Integer → Solution
🟢 Easy | 🟡 Medium | 🔴 Hard
Bullets: • Depth-First Search • Dynamic Programming
Em-dash: Notes — Intuition and Observation
Math: O(N) time and O(1) space
Unicode characters: 你好世界, こんにちは, 안녕하세요, café, naïve, résumé
Code symbols: vector<int>& nums, std::unordered_map<char, int>
`;

    const encoded = utf8ToBase64(originalText);
    const decoded = base64ToUtf8(encoded);

    expect(decoded).toBe(originalText);
    expect(decoded).not.toContain('â');
    expect(decoded).not.toContain('ðŸ');
    expect(decoded).not.toContain('\uFFFD'); // Unicode replacement char
  });

  it('demonstrates that native atob/btoa corrupts multi-byte UTF-8 into mojibake', () => {
    const textWithEmojisAndDashes = '⚡ — 🌟 → •';

    // The safe encoder/decoder preserves it
    const safeBase64 = utf8ToBase64(textWithEmojisAndDashes);
    const safeDecoded = base64ToUtf8(safeBase64);
    expect(safeDecoded).toBe(textWithEmojisAndDashes);

    // If native atob was used directly on the base64 string, it produces Latin-1 mojibake:
    const brokenLatin1 = atob(safeBase64);
    expect(brokenLatin1).not.toBe(textWithEmojisAndDashes);
    expect(brokenLatin1).toContain('â'); // contains typical mojibake sequence
  });

  it('handles empty strings and whitespace safely', () => {
    expect(utf8ToBase64('')).toBe('');
    expect(base64ToUtf8('')).toBe('');
    expect(base64ToUtf8('   \n  ')).toBe('');
  });
});
