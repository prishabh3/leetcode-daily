import { SupportedLanguage, LanguageConfig } from '../types/submission';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  cpp: {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    directoryName: 'cpp',
    commentPrefix: '//',
  },
  python: {
    id: 'python',
    name: 'Python',
    extension: 'py',
    directoryName: 'python',
    commentPrefix: '#',
  },
  python3: {
    id: 'python3',
    name: 'Python 3',
    extension: 'py',
    directoryName: 'python3',
    commentPrefix: '#',
  },
  java: {
    id: 'java',
    name: 'Java',
    extension: 'java',
    directoryName: 'java',
    commentPrefix: '//',
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    directoryName: 'javascript',
    commentPrefix: '//',
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    extension: 'ts',
    directoryName: 'typescript',
    commentPrefix: '//',
  },
  csharp: {
    id: 'csharp',
    name: 'C#',
    extension: 'cs',
    directoryName: 'csharp',
    commentPrefix: '//',
  },
  sql: {
    id: 'sql',
    name: 'SQL',
    extension: 'sql',
    directoryName: 'sql',
    commentPrefix: '--',
  },
  unknown: {
    id: 'unknown',
    name: 'Unknown',
    extension: 'txt',
    directoryName: 'unknown',
    commentPrefix: '//',
  },
};

const LANGUAGE_ALIASES: Record<string, SupportedLanguage> = {
  cpp: 'cpp',
  'c++': 'cpp',
  cplusplus: 'cpp',
  python: 'python3', // default python alias to python3
  python3: 'python3',
  py: 'python3',
  py3: 'python3',
  java: 'java',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  csharp: 'csharp',
  'c#': 'csharp',
  cs: 'csharp',
  // SQL variants
  sql: 'sql',
  mysql: 'sql',
  postgresql: 'sql',
  postgres: 'sql',
  mssql: 'sql',
  'mssqlserver': 'sql',
  oracle: 'sql',
  sqlite: 'sql',
};

/**
 * Maps raw platform language strings to their SQL dialect label for storage.
 * Returns undefined for non-SQL or unrecognized inputs.
 */
const SQL_DIALECT_MAP: Record<string, string> = {
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  mssql: 'MS SQL Server',
  mssqlserver: 'MS SQL Server',
  'ms sql server': 'MS SQL Server',
  oracle: 'Oracle',
  sqlite: 'SQLite',
  sql: 'SQL',
};

/**
 * Normalizes an arbitrary language string from DOM or user input to a SupportedLanguage.
 * Returns 'unknown' for unrecognized inputs (never silently falls back to 'cpp').
 */
export function normalizeLanguage(input: string): SupportedLanguage {
  if (!input) return 'unknown';
  const clean = input.trim().toLowerCase().replace(/\s+/g, '');
  if (clean in LANGUAGE_ALIASES) {
    return LANGUAGE_ALIASES[clean];
  }
  // Try partial match
  for (const [alias, target] of Object.entries(LANGUAGE_ALIASES)) {
    if (clean.includes(alias) || alias.includes(clean)) {
      return target;
    }
  }
  return 'unknown';
}

/**
 * Returns the SQL dialect for a given raw platform language string (e.g. 'mysql' → 'MySQL').
 * Returns undefined if the language is not a SQL variant or is unrecognized.
 */
export function getLanguageDialect(rawLang: string): string | undefined {
  if (!rawLang) return undefined;
  const clean = rawLang.trim().toLowerCase();
  return SQL_DIALECT_MAP[clean];
}

export function getLanguageConfig(lang: SupportedLanguage): LanguageConfig {
  return SUPPORTED_LANGUAGES[lang] || SUPPORTED_LANGUAGES.unknown;
}

export function getFileExtension(lang: SupportedLanguage): string {
  return getLanguageConfig(lang).extension;
}
