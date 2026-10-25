import { describe, it, expect } from 'vitest';
import { generateReadme, LC_SYNC_START_MARKER, LC_SYNC_END_MARKER } from '../src/core/generator/readme-generator';
import { SyncIndex } from '../src/core/types/sync-index';

describe('7 & 14. README generation & Preservation of manual sections', () => {
  const mockIndex: SyncIndex = {
    schemaVersion: 2,
    lastUpdated: '2026-10-24T12:00:00.000Z',
    totalProblems: 2,
    totalSubmissions: 3,
    submissions: {},
    problems: {
      '0001': {
        id: '1',
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'Easy',
        languages: ['cpp', 'python3'],
        approachesCount: 2,
        lastSyncedAt: '2026-10-24T10:00:00.000Z',
        confidenceRating: 4,
        nextReviewDate: '2026-10-27',
        tags: ['Array', 'Hash Table'],
        patterns: ['Hash Map'],
      },
      '0003': {
        id: '3',
        title: 'Longest Substring Without Repeating Characters',
        slug: 'longest-substring-without-repeating-characters',
        difficulty: 'Medium',
        languages: ['cpp'],
        approachesCount: 1,
        lastSyncedAt: '2026-10-24T11:00:00.000Z',
        confidenceRating: 3,
        nextReviewDate: '2026-10-26',
        tags: ['Sliding Window', 'String'],
        patterns: ['Sliding Window'],
      },
    },
  };

  it('generates a fresh deterministic README when no existing README exists', () => {
    const readme = generateReadme(null, mockIndex, {
      repoName: 'leetcode-daily',
      leetcodeUsername: 'octocat',
    });

    expect(readme).toContain('# leetcode-daily');
    expect(readme).toContain(LC_SYNC_START_MARKER);
    expect(readme).toContain(LC_SYNC_END_MARKER);
    expect(readme).toContain('Two Sum');
    expect(readme).toContain('Longest Substring Without Repeating Characters');
    expect(readme).toContain('Total Problems Tracked**: **2**');
  });

  it('14. Strictly preserves custom user content before and after markers', () => {
    const customHeader = `# Custom Header
My personal thoughts on DSA and interview prep roadmap.
Do not overwrite this.

`;

    const customFooter = `
## My Custom Study Notes
- Study dynamic programming every Saturday.
- Review graph algorithms before next month.
`;

    const existingReadme = `${customHeader}${LC_SYNC_START_MARKER}
old auto generated content
${LC_SYNC_END_MARKER}${customFooter}`;

    const updatedReadme = generateReadme(existingReadme, mockIndex, {
      repoName: 'leetcode-daily',
    });

    // Verify custom content is 100% intact
    expect(updatedReadme).toContain('# Custom Header');
    expect(updatedReadme).toContain('My personal thoughts on DSA and interview prep roadmap.');
    expect(updatedReadme).toContain('## My Custom Study Notes');
    expect(updatedReadme).toContain('Study dynamic programming every Saturday.');

    // Verify dynamic section updated
    expect(updatedReadme).not.toContain('old auto generated content');
    expect(updatedReadme).toContain('Two Sum');
  });
});
