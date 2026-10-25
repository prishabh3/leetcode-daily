import { SupportedLanguage, ProblemDifficulty } from './submission';

export interface StructuredNotes {
  intuition: string;
  keyObservation: string;
  approach: string;
  whyItWorks: string;
  complexityAnalysis: string;
  edgeCases: string;
  mistakes: string;
  simplifiedExplanation: string;
}

export interface ReviewRecord {
  date: string; // ISO date string (YYYY-MM-DD)
  rating: number; // 1 to 5
  recalled: boolean;
  intervalDays: number;
}

export interface SolutionRecord {
  language: SupportedLanguage;
  approachName: string;
  filePath: string;
  submissionId?: string;
  contentHash: string;
  syncedAt: string; // ISO string
  runtime?: string;
  memory?: string;
  complexity?: {
    time: string;
    space: string;
  };
  /** The original language string from the LeetCode platform (e.g. 'mysql', 'postgresql') */
  rawPlatformLanguage?: string;
  /** SQL dialect or language variant (e.g. 'MySQL', 'PostgreSQL', 'MS SQL Server') */
  languageDialect?: string;
}

export interface ProblemMetadata {
  schemaVersion: number;
  id: string; // e.g. "0001"
  title: string;
  slug: string;
  url: string;
  difficulty: ProblemDifficulty;
  tags: string[];
  patterns: string[];
  firstTrackedAt: string;
  lastSyncedAt: string;
  solutions: Record<string, SolutionRecord>; // key: `${language}/${sanitizedApproachName}`
  confidenceRating: number; // 1 to 5
  reviewHistory: ReviewRecord[];
  nextReviewDate: string; // YYYY-MM-DD
  reviewsCount: number;
  failedRecallCount: number;
  estimatedTimeComplexity?: string;
  estimatedSpaceComplexity?: string;
  verifiedComplexity: boolean; // false if user estimated / not formally verified
  /** The original language string from the LeetCode platform (e.g. 'mysql', 'postgresql') */
  rawPlatformLanguage?: string;
  /** SQL dialect or language variant (e.g. 'MySQL', 'PostgreSQL', 'MS SQL Server') */
  languageDialect?: string;
}
