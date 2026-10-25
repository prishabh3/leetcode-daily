import { describe, it, expect } from 'vitest';
import { normalizeLanguage, getFileExtension, getLanguageConfig, getLanguageDialect } from '../src/core/utils/languages';

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

  it('returns unknown for unsupported languages (never cpp)', () => {
    expect(normalizeLanguage('brainfuck')).toBe('unknown');
    expect(normalizeLanguage('')).toBe('unknown');
    expect(normalizeLanguage('COBOL')).toBe('unknown');
  });

  it('normalizes MySQL to sql', () => {
    expect(normalizeLanguage('mysql')).toBe('sql');
    expect(normalizeLanguage('MySQL')).toBe('sql');
  });

  it('normalizes PostgreSQL to sql', () => {
    expect(normalizeLanguage('postgresql')).toBe('sql');
    expect(normalizeLanguage('PostgreSQL')).toBe('sql');
    expect(normalizeLanguage('postgres')).toBe('sql');
  });

  it('normalizes MS SQL Server to sql', () => {
    expect(normalizeLanguage('mssql')).toBe('sql');
    expect(normalizeLanguage('ms sql server')).toBe('sql');
  });

  it('normalizes Oracle to sql', () => {
    expect(normalizeLanguage('oracle')).toBe('sql');
  });

  it('maps sql file extension to .sql', () => {
    expect(getFileExtension('sql')).toBe('sql');
    expect(getLanguageConfig('sql').name).toBe('SQL');
    expect(getLanguageConfig('sql').commentPrefix).toBe('--');
  });

  it('getLanguageDialect returns correct SQL dialect', () => {
    expect(getLanguageDialect('mysql')).toBe('MySQL');
    expect(getLanguageDialect('postgresql')).toBe('PostgreSQL');
    expect(getLanguageDialect('postgres')).toBe('PostgreSQL');
    expect(getLanguageDialect('mssql')).toBe('MS SQL Server');
    expect(getLanguageDialect('oracle')).toBe('Oracle');
    expect(getLanguageDialect('cpp')).toBeUndefined();
    expect(getLanguageDialect('')).toBeUndefined();
  });

  it('getLanguageConfig for unknown language returns unknown config (not cpp)', () => {
    expect(getLanguageConfig('unknown').id).toBe('unknown');
    expect(getLanguageConfig('unknown').name).toBe('Unknown');
  });
});
