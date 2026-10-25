import { SupportedLanguage, ProblemDifficulty } from './submission';

export type HistoricalImportMode =
  | 'ALL_ACCEPTED' // Mode A: All historical Accepted submissions (including multiple versions/languages)
  | 'LATEST_ACCEPTED' // Mode B: Latest Accepted submission per problem-language combination
  | 'ALL_ATTEMPTS'; // Mode C: All attempts (Accepted + Wrong Answer / TLE / etc., kept separate)

export type CommitDateStrategy = 'IMPORT_DATE' | 'ORIGINAL_DATE';

export interface HistoricalImportConfig {
  mode: HistoricalImportMode;
  commitDateStrategy?: CommitDateStrategy; // Option A (IMPORT_DATE) or Option B (ORIGINAL_DATE)
  dateRange?: {
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
  };
  languages?: SupportedLanguage[];
  destinationBranch?: string;
  batchSize?: number; // Bounded batch commit size (default 5-10)
}

export interface RawHistoricalSubmission {
  id: string; // Stable submission ID
  title: string;
  titleSlug: string;
  problemId?: string;
  statusDisplay: string; // e.g. "Accepted", "Wrong Answer"
  lang: string; // e.g. "cpp", "python3"
  normalizedLanguage?: SupportedLanguage;
  runtime?: string;
  memory?: string;
  timestamp: number; // Unix epoch timestamp (seconds)
  url?: string;
  code?: string;
  difficulty?: ProblemDifficulty;
  topicTags?: string[];
}

export interface HistoricalImportPreview {
  totalDiscovered: number;
  acceptedCount: number;
  unsuccessfulCount: number;
  distinctProblems: number;
  languageDistribution: Record<string, number>;
  alreadySyncedCount: number;
  newToImportCount: number;
  duplicatesSkippedCount: number;
  codeMissingCount: number;
  recordsWithOriginalTimestamp: number;
  recordsWithoutTimestamp: number;
  selectedDateStrategy: CommitDateStrategy;
  submissions: RawHistoricalSubmission[];
}

export interface HistoricalImportProgress {
  status: 'idle' | 'checking_auth' | 'discovering' | 'ready_to_import' | 'importing' | 'completed' | 'cancelled' | 'failed';
  processedCount: number;
  totalCount: number;
  currentProblemTitle?: string;
  importedCount: number;
  skippedDuplicatesCount: number;
  failedCount: number;
  awaitingRetryCount: number;
  currentBatch: number;
  totalBatches: number;
  message: string;
  latestCommitSha?: string;
}

export interface HistoricalImportSummary {
  success: boolean;
  mode: HistoricalImportMode;
  commitDateStrategy: CommitDateStrategy;
  totalDiscovered: number;
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  distinctProblemsImported: number;
  commitsCreated: string[];
  fallbackTimestampsCount: number;
  durationMs: number;
  error?: string;
}

export interface HistoricalImportCheckpoint {
  checkpointId: string;
  createdAt: number;
  config: HistoricalImportConfig;
  commitDateStrategy: CommitDateStrategy;
  completedSubmissionIds: string[];
  totalExpected: number;
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  fallbackTimestampsCount?: number;
  isComplete: boolean;
}
