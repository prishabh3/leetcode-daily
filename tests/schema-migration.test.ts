import { describe, it, expect } from 'vitest';
import { migrateSyncIndex, migrateProblemMetadata, CURRENT_SCHEMA_VERSION } from '../src/core/storage/schema-migration';

describe('13. Schema validation and migration', () => {
  it('migrates legacy v1 sync index with missing fields to current schema version', () => {
    const legacyV1Index = {
      schemaVersion: 1,
      totalProblems: 1,
      totalSubmissions: 1,
      problems: {
        '1': {
          id: '0001',
          title: 'Two Sum',
          slug: 'two-sum',
          difficulty: 'Easy',
          languages: ['cpp'],
          approachesCount: 1,
          lastSyncedAt: '2026-01-01T00:00:00Z',
          // missing confidenceRating, nextReviewDate, tags
        },
      },
      submissions: {
        sub1: {
          problemId: '0001',
          slug: 'two-sum',
          title: 'Two Sum',
          difficulty: 'Easy',
          language: 'cpp',
          approachName: 'solution',
          contentHash: 'abc12345',
          syncedAt: '2026-01-01T00:00:00Z',
          filePath: 'problems/0001-two-sum/cpp/solution.cpp',
        },
      },
    };

    const migrated = migrateSyncIndex(legacyV1Index);
    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.problems['1'].confidenceRating).toBe(3); // backfilled
    expect(migrated.problems['1'].nextReviewDate).toBeDefined(); // backfilled
    expect(Array.isArray(migrated.problems['1'].tags)).toBe(true);
  });

  it('safely handles null, undefined, or corrupt raw input', () => {
    const corrupt = migrateSyncIndex(null);
    expect(corrupt.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(corrupt.totalProblems).toBe(0);
    expect(corrupt.submissions).toBeDefined();
    expect(corrupt.problems).toBeDefined();
  });

  it('validates and backfills ProblemMetadata correctly', () => {
    const rawPartial = {
      id: '0001',
      title: 'Two Sum',
      slug: 'two-sum',
      confidenceRating: 10, // out of bounds, should clamp to 5
    };

    const meta = migrateProblemMetadata(rawPartial, '0001', 'two-sum');
    expect(meta.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(meta.confidenceRating).toBe(5); // clamped
    expect(meta.difficulty).toBe('Unknown');
    expect(Array.isArray(meta.reviewHistory)).toBe(true);
    expect(meta.verifiedComplexity).toBe(false);
  });
});
