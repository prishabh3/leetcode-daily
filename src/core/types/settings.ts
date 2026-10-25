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

export interface LeetCodeAccountStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking?: number | string;
}

export interface LeetCodeConnectionInfo {
  status: 'CONNECTED' | 'EXPIRED' | 'DISCONNECTED' | 'ERROR';
  username?: string;
  realName?: string;
  site: 'us' | 'cn';
  verifiedAt?: string;
  stats?: LeetCodeAccountStats;
  error?: string;
  authMethod: 'session' | 'manual';
}

export interface AppSettings {
  github: GitHubSettings;
  preferences: SyncPreferences;
  leetcodeProfileUsername?: string;
  leetcodeProfileUrl?: string;
  leetcodeSite?: 'us' | 'cn';
  leetcodeVerified?: boolean;
  leetcodeAccountStats?: LeetCodeAccountStats;
  leetcodeConnection?: LeetCodeConnectionInfo;
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
  leetcodeProfileUsername: 'risxbh',
  leetcodeProfileUrl: 'https://leetcode.com/u/risxbh/',
  leetcodeSite: 'us',
  leetcodeVerified: true,
  leetcodeAccountStats: {
    totalSolved: 62,
    easySolved: 26,
    mediumSolved: 26,
    hardSolved: 10,
    ranking: 2443671,
  },
  leetcodeConnection: {
    status: 'CONNECTED',
    username: 'risxbh',
    realName: 'Priyadarshi Rishabh',
    site: 'us',
    authMethod: 'manual',
    stats: {
      totalSolved: 62,
      easySolved: 26,
      mediumSolved: 26,
      hardSolved: 10,
      ranking: 2443671,
    },
  },
};
