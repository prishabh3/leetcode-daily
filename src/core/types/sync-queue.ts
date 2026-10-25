import { PlatformSubmission } from './submission';
import { StructuredNotes } from './problem';

export type SyncStatus = 'Pending' | 'Syncing' | 'Synced' | 'Failed' | 'Needs Attention';

export interface SyncQueueItem {
  id: string; // unique item id
  submission: PlatformSubmission;
  approachName: string;
  notes?: Partial<StructuredNotes>;
  rawNotesText?: string;
  confidence: number;
  tags: string[];
  patterns: string[];
  timeComplexity?: string;
  spaceComplexity?: string;
  status: SyncStatus;
  attemptCount: number;
  maxAttempts: number;
  lastAttempt?: string;
  error?: string;
  commitSha?: string;
  createdAt: string;
}
