import { SyncIndex } from '../types/sync-index';
import { ProblemMetadata } from '../types/problem';

export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Validates and migrates a SyncIndex to the latest schema version
 */
export function migrateSyncIndex(raw: any): SyncIndex {
  const defaultIndex: SyncIndex = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastUpdated: new Date().toISOString(),
    totalProblems: 0,
    totalSubmissions: 0,
    submissions: {},
    problems: {},
  };

  if (!raw || typeof raw !== 'object') {
    return defaultIndex;
  }

  const version = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 1;

  let migrated: SyncIndex = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastUpdated: raw.lastUpdated || new Date().toISOString(),
    totalProblems: typeof raw.totalProblems === 'number' ? raw.totalProblems : 0,
    totalSubmissions: typeof raw.totalSubmissions === 'number' ? raw.totalSubmissions : 0,
    submissions: raw.submissions && typeof raw.submissions === 'object' ? raw.submissions : {},
    problems: raw.problems && typeof raw.problems === 'object' ? raw.problems : {},
  };

  if (version === 1) {
    // Migration from v1 to v2: ensure each problem entry has confidenceRating and nextReviewDate
    for (const problem of Object.values(migrated.problems)) {
      if (typeof problem.confidenceRating !== 'number') {
        problem.confidenceRating = 3;
      }
      if (!problem.nextReviewDate) {
        problem.nextReviewDate = new Date().toISOString().split('T')[0];
      }
      if (!Array.isArray(problem.tags)) {
        problem.tags = [];
      }
      if (!Array.isArray(problem.patterns)) {
        problem.patterns = [];
      }
    }
  }

  // Recalculate counts to ensure integrity
  migrated.totalProblems = Object.keys(migrated.problems).length;
  migrated.totalSubmissions = Object.keys(migrated.submissions).length;

  return migrated;
}

/**
 * Validates and migrates ProblemMetadata
 */
export function migrateProblemMetadata(raw: any, fallbackId: string, fallbackSlug: string): ProblemMetadata {
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  const defaultMeta: ProblemMetadata = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: fallbackId || '0000',
    title: fallbackSlug || 'Untitled Problem',
    slug: fallbackSlug || 'untitled',
    url: '',
    difficulty: 'Unknown',
    tags: [],
    patterns: [],
    firstTrackedAt: now,
    lastSyncedAt: now,
    solutions: {},
    confidenceRating: 3,
    reviewHistory: [],
    nextReviewDate: today,
    reviewsCount: 0,
    failedRecallCount: 0,
    verifiedComplexity: false,
  };

  if (!raw || typeof raw !== 'object') {
    return defaultMeta;
  }

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: raw.id || defaultMeta.id,
    title: raw.title || defaultMeta.title,
    slug: raw.slug || defaultMeta.slug,
    url: raw.url || defaultMeta.url,
    difficulty: ['Easy', 'Medium', 'Hard'].includes(raw.difficulty) ? raw.difficulty : 'Unknown',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    patterns: Array.isArray(raw.patterns) ? raw.patterns : [],
    firstTrackedAt: raw.firstTrackedAt || defaultMeta.firstTrackedAt,
    lastSyncedAt: raw.lastSyncedAt || defaultMeta.lastSyncedAt,
    solutions: raw.solutions && typeof raw.solutions === 'object' ? raw.solutions : {},
    confidenceRating: typeof raw.confidenceRating === 'number' ? Math.max(1, Math.min(5, raw.confidenceRating)) : 3,
    reviewHistory: Array.isArray(raw.reviewHistory) ? raw.reviewHistory : [],
    nextReviewDate: raw.nextReviewDate || today,
    reviewsCount: typeof raw.reviewsCount === 'number' ? raw.reviewsCount : 0,
    failedRecallCount: typeof raw.failedRecallCount === 'number' ? raw.failedRecallCount : 0,
    estimatedTimeComplexity: raw.estimatedTimeComplexity,
    estimatedSpaceComplexity: raw.estimatedSpaceComplexity,
    verifiedComplexity: Boolean(raw.verifiedComplexity),
  };
}
