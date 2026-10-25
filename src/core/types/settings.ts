export interface GitHubSettings {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  defaultPathPrefix: string; // e.g. "problems"
  authorName?: string;
  authorEmail?: string;
}

export interface SyncPreferences {
  autoOpenReview: boolean;
  generateReadme: boolean;
  generateProgressSvg: boolean;
  defaultLanguage: string;
  defaultConfidence: number;
}

export interface AppSettings {
  github: GitHubSettings;
  preferences: SyncPreferences;
  leetcodeProfileUsername?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  github: {
    token: '',
    owner: '',
    repo: 'leetcode-daily',
    branch: 'main',
    defaultPathPrefix: 'problems',
  },
  preferences: {
    autoOpenReview: true,
    generateReadme: true,
    generateProgressSvg: true,
    defaultLanguage: 'cpp',
    defaultConfidence: 3,
  },
};
