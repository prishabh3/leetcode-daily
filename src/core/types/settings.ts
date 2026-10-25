export interface GitHubSettings {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  defaultPathPrefix: string; // e.g. "problems"
  authorName?: string;
  authorEmail?: string;
}

export interface LastSyncInfo {
  status: 'synced' | 'failed' | 'duplicate';
  timestamp: string;
  problemTitle?: string;
  commitSha?: string;
  error?: string;
}

export interface SyncPreferences {
  autoSyncOnAccepted: boolean;
  reviewBeforeSync: boolean;
  autoOpenReview?: boolean; // legacy compatibility
  generateReadme: boolean;
  generateProgressSvg: boolean;
  defaultLanguage: string;
  defaultConfidence: number;
}

export interface AppSettings {
  github: GitHubSettings;
  preferences: SyncPreferences;
  leetcodeProfileUsername?: string;
  leetcodeProfileUrl?: string;
  leetcodeSite?: 'us' | 'cn';
  lastSyncInfo?: LastSyncInfo;
}

export const DEFAULT_SETTINGS: AppSettings = {
  github: {
    token: '',
    owner: '',
    repo: 'leetcode-daily',
    branch: 'main',
    defaultPathPrefix: 'solutions',
  },
  preferences: {
    autoSyncOnAccepted: true,
    reviewBeforeSync: false,
    generateReadme: true,
    generateProgressSvg: true,
    defaultLanguage: 'cpp',
    defaultConfidence: 3,
  },
  leetcodeSite: 'us',
};
