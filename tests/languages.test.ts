import { describe, it, expect } from 'vitest';
import { normalizeLanguage, getFileExtension, getLanguageConfig } from '../src/core/utils/languages';

describe('2. Supported language detection', () => {
  it('normalizes common language names and aliases', () => {
    expect(normalizeLanguage('C++')).toBe('cpp');
    expect(normalizeLanguage('c++')).toBe('cpp');
    expect(normalizeLanguage('Python3')).toBe('python3');
    expect(normalizeLanguage('py')).toBe('python3');
    expect(normalizeLanguage('Java')).toBe('java');
    expect(normalizeLanguage('JavaScript')).toBe('javascript');
    expect(normalizeLanguage('TypeScript')).toBe('typescript');
    expect(normalizeLanguage('C#')).toBe('csharp');
  });

  it('maps languages to correct file extensions', () => {
    expect(getFileExtension('cpp')).toBe('cpp');
    expect(getFileExtension('python3')).toBe('py');
    expect(getFileExtension('java')).toBe('java');
    expect(getFileExtension('javascript')).toBe('js');
    expect(getFileExtension('typescript')).toBe('ts');
    expect(getFileExtension('csharp')).toBe('cs');
    expect(getLanguageConfig('cpp').name).toBe('C++');
  });

  it('returns null for unsupported languages', () => {
    expect(normalizeLanguage('brainfuck')).toBeNull();
    expect(normalizeLanguage('')).toBeNull();
  });
});
