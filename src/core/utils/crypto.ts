/**
 * Normalizes code content by removing carriage returns and trailing whitespace
 */
export function normalizeCode(code: string): string {
  if (!code) return '';
  return code
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Computes deterministic SHA-256 hash string for code or string content.
 * Works natively in Chrome Extension (MV3 service workers, content scripts, pages)
 * and in Node 19+ / modern test environments.
 */
export async function computeContentHash(content: string): Promise<string> {
  const normalized = normalizeCode(content);

  const subtleCrypto =
    typeof globalThis !== 'undefined' && globalThis.crypto?.subtle
      ? globalThis.crypto.subtle
      : typeof crypto !== 'undefined' && crypto.subtle
      ? crypto.subtle
      : null;

  if (subtleCrypto && typeof subtleCrypto.digest === 'function') {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await subtleCrypto.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Pure deterministic fallback hash if subtle is not available in environment
  return simpleDeterministicHash(normalized);
}

function simpleDeterministicHash(str: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c64e6d ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return (part1 + part2).repeat(4).slice(0, 64);
}
