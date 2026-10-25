// Supported languages & file extensions
export type SupportedLanguage =
  | 'cpp'
  | 'python'
  | 'python3'
  | 'java'
  | 'javascript'
  | 'typescript'
  | 'csharp'
  | 'sql'
  | 'unknown';

export interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  extension: string;
  directoryName: string;
  commentPrefix: string;
}

export type SubmissionStatus =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded'
  | 'Runtime Error'
  | 'Compile Error'
  | 'Unknown';

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Unknown';

export interface PlatformSubmission {
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  url: string;
  difficulty: ProblemDifficulty;
  language: SupportedLanguage;
  code: string;
  submissionId?: string;
  timestamp: number;
  status: SubmissionStatus;
  runtime?: string;
  memory?: string;
}

export interface SubmissionDraft extends PlatformSubmission {
  approachName: string;
  notes?: string;
  tags?: string[];
  patterns?: string[];
  confidenceRating?: number;
  timeComplexity?: string;
  spaceComplexity?: string;
}
