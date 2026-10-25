import { describe, it, expect } from 'vitest';
import { computeContentHash, normalizeCode } from '../src/core/utils/crypto';

describe('5. Content-hash generation', () => {
  it('normalizes code with varying line endings and whitespace', () => {
    const codeWithCRLF = 'class Solution {\r\n    public:\r\n    int twoSum() { }\r\n}\r\n';
    const codeWithLF = 'class Solution {\n    public:\n    int twoSum() { }\n}\n';

    expect(normalizeCode(codeWithCRLF)).toBe(normalizeCode(codeWithLF));
  });

  it('generates deterministic SHA-256 hash for identical code', async () => {
    const code1 = 'int main() {\n  return 0;\n}';
    const code2 = 'int main() {\r\n  return 0;\r\n}\n';

    const hash1 = await computeContentHash(code1);
    const hash2 = await computeContentHash(code2);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

  it('generates distinct hashes for different code', async () => {
    const code1 = 'int main() { return 0; }';
    const code2 = 'int main() { return 1; }';

    const hash1 = await computeContentHash(code1);
    const hash2 = await computeContentHash(code2);

    expect(hash1).not.toBe(hash2);
  });
});
