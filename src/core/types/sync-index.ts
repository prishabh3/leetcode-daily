import { ProblemDifficulty, SupportedLanguage } from './submission';

export interface SyncIndexEntry {
  problemId: string;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  language: SupportedLanguage;
  approachName: string;
  submissionId?: string;
  contentHash: string;
  syncedAt: string;
  filePath: string;
}

export interface ProblemSummaryEntry {
  id: string;
  title: string;
  slug: string;
  difficulty: ProblemDifficulty;
  languages: SupportedLanguage[];
  approachesCount: number;
  lastSyncedAt: string;
  confidenceRating: number;
  nextReviewDate: string;
  tags: string[];
  patterns: string[];
}

export interface SyncIndex {
  schemaVersion: number;
  lastUpdated: string;
  totalProblems: number;
  totalSubmissions: number;
  // Keyed by submissionId if available, else by `${slug}-${contentHash.slice(0, 12)}`
  submissions: Record<string, SyncIndexEntry>;
  // Keyed by problemId (or slug if id not numeric)
  problems: Record<string, ProblemSummaryEntry>;
}
