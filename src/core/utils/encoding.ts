/**
 * Robust UTF-8 safe Base64 encoding and decoding utilities.
 *
 * Prevents Latin-1 truncation and mojibake corruption (e.g. â, ðŸ, )
 * that occurs when calling native atob()/btoa() on multi-byte UTF-8 sequences
 * (emojis, arrows, em-dashes, non-ASCII characters).
 *
 * Compatible with Chrome Extension environments (browser/MV3) and Node.js (Vitest).
 */

/**
 * Converts a base64 encoded string to a UTF-8 string without character corruption.
 */
export function base64ToUtf8(base64Str: string): string {
  if (!base64Str) return '';
  const cleanBase64 = base64Str.replace(/\s/g, '');

  // Node.js environment
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(cleanBase64, 'base64').toString('utf-8');
  }

  // Browser / Web Worker environment
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

/**
 * Converts a UTF-8 string to a base64 string without character corruption.
 */
export function utf8ToBase64(str: string): string {
  if (!str) return '';

  // Node.js environment
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }

  // Browser / Web Worker environment
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
