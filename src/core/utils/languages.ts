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
};

/**
 * Normalizes an arbitrary language string from DOM or user input to a SupportedLanguage
 */
export function normalizeLanguage(input: string): SupportedLanguage | null {
  if (!input) return null;
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
  return null;
}

export function getLanguageConfig(lang: SupportedLanguage): LanguageConfig {
  return SUPPORTED_LANGUAGES[lang] || SUPPORTED_LANGUAGES.cpp;
}

export function getFileExtension(lang: SupportedLanguage): string {
  return getLanguageConfig(lang).extension;
}
