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

    expect(readme).toContain('# ⚡ LeetCode Daily');
    expect(readme).toContain('> My LeetCode problem-solving journey — automatically synchronized to GitHub using LC-Sync.');
    expect(readme).toContain(LC_SYNC_START_MARKER);
    expect(readme).toContain(LC_SYNC_END_MARKER);
    expect(readme).toContain('Two Sum');
    expect(readme).toContain('Longest Substring Without Repeating Characters');
    expect(readme).toContain('Distinct Problems Tracked**: **2**');
    expect(readme).toContain('Browse All Solutions → solutions/');
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

  it('generates deterministic output for identical input records', () => {
    const run1 = generateReadme(null, mockIndex, { repoName: 'leetcode-daily' });
    const run2 = generateReadme(null, mockIndex, { repoName: 'leetcode-daily' });
    expect(run1).toBe(run2);
  });

  it('keeps software README and solutions README strictly separate', () => {
    const solutionsReadme = generateReadme(null, mockIndex, { repoName: 'my-solutions' });
    expect(solutionsReadme).toContain('# ⚡ LeetCode Daily');
    expect(solutionsReadme).toContain('Browse All Solutions → solutions/');
    // Solutions README does not include internal extension source tree
    expect(solutionsReadme).not.toContain('src/background');
    expect(solutionsReadme).not.toContain('npm run build');
  });

  it('preserves Unicode arrows, emojis, and em-dashes across upload preparation', () => {
    const originalWithUnicode = `# My Solutions — Road to Senior Engineer 🚀
• Dynamic Programming → Hard
• Graph Algorithms → Medium
🟢 Easy | 🟡 Medium | 🔴 Hard

${LC_SYNC_START_MARKER}
old
${LC_SYNC_END_MARKER}
`;
    const readme = generateReadme(originalWithUnicode, mockIndex, { repoName: 'my-solutions' });
    expect(readme).toContain('Road to Senior Engineer 🚀');
    expect(readme).toContain('• Dynamic Programming → Hard');
    expect(readme).not.toContain('â');
    expect(readme).not.toContain('ðŸ');
    expect(readme).not.toContain('\uFFFD');
  });

  it('correctly reports SQL in language distribution', () => {
    const indexWithSql: SyncIndex = {
      schemaVersion: 2,
      lastUpdated: '2026-10-25T12:00:00.000Z',
      totalProblems: 1,
      totalSubmissions: 1,
      submissions: {},
      problems: {
        '0178': {
          id: '178',
          title: 'Rank Scores',
          slug: 'rank-scores',
          difficulty: 'Medium',
          languages: ['sql'],
          approachesCount: 1,
          lastSyncedAt: '2026-10-25T12:00:00.000Z',
          confidenceRating: 3,
          nextReviewDate: '2026-10-27',
          tags: [],
          patterns: [],
        },
      },
    };

    const readme = generateReadme(null, indexWithSql, {
      repoName: 'leetcode-daily',
      leetcodeUsername: 'octocat',
    });

    expect(readme).toContain('| SQL | `1` |');
    expect(readme).not.toContain('| C++ |');
  });

  it('renders stats card and heatmap when valid leetcodeUsername is provided', () => {
    const readme = generateReadme(null, mockIndex, {
      repoName: 'leetcode-daily',
      leetcodeUsername: 'octocat',
      cacheBuster: 12345,
    });

    expect(readme).toContain('## 🔗 LeetCode Profile');
    expect(readme).toContain('[octocat](https://leetcode.com/u/octocat/)');
    expect(readme).toContain('## LeetCode Stats');
    expect(readme).toContain(
      '[![LeetCode Stats](https://leetcard.jacoblin.cool/octocat?theme=dark&font=Roboto&v=12345)](https://leetcode.com/u/octocat/)'
    );
    expect(readme).toContain('## Submission Activity');
    expect(readme).toContain(
      '[![LeetCode Heatmap](https://leetcard.jacoblin.cool/octocat?ext=heatmap&theme=dark&v=12345)](https://leetcode.com/u/octocat/)'
    );
  });

  it('extracts clean username from full LeetCode profile URL in readme options', () => {
    const readme = generateReadme(null, mockIndex, {
      repoName: 'leetcode-daily',
      leetcodeUsername: 'https://leetcode.com/u/octocat/',
      cacheBuster: 99999,
    });

    expect(readme).toContain('## 🔗 LeetCode Profile');
    expect(readme).toContain('[octocat](https://leetcode.com/u/octocat/)');
    expect(readme).toContain('https://leetcard.jacoblin.cool/octocat?theme=dark&font=Roboto&v=99999');
  });

  it('cleanly omits stats cards and heatmaps when leetcodeUsername is missing or invalid', () => {
    const readmeNoUser = generateReadme(null, mockIndex, {
      repoName: 'leetcode-daily',
    });

    expect(readmeNoUser).toContain('## 🔗 LeetCode Profile');
    expect(readmeNoUser).toContain('[LeetCode](https://leetcode.com)');
    expect(readmeNoUser).not.toContain('## LeetCode Stats');
    expect(readmeNoUser).not.toContain('## Submission Activity');
    expect(readmeNoUser).not.toContain('leetcard.jacoblin.cool');

    const readmeInvalidUser = generateReadme(null, mockIndex, {
      repoName: 'leetcode-daily',
      leetcodeUsername: 'ab', // too short
    });
    expect(readmeInvalidUser).not.toContain('## LeetCode Stats');
    expect(readmeInvalidUser).not.toContain('leetcard.jacoblin.cool');
  });

  it('cleanly omits stats cards and renders unverified notice when leetcodeVerified is false', () => {
    const readmeUnverified = generateReadme(null, mockIndex, {
      repoName: 'leetcode-daily',
      leetcodeUsername: 'octocat',
      leetcodeVerified: false,
    });

    expect(readmeUnverified).toContain('## 🔗 LeetCode Profile');
    expect(readmeUnverified).toContain('[octocat](https://leetcode.com/u/octocat/)');
    expect(readmeUnverified).toContain('External LeetCode statistics cards are unverified');
    expect(readmeUnverified).not.toContain('## LeetCode Stats');
    expect(readmeUnverified).not.toContain('## Submission Activity');
    expect(readmeUnverified).not.toContain('leetcard.jacoblin.cool');
  });

  it('supports LeetCode CN site and passes site=cn parameter', () => {
    const readmeCn = generateReadme(null, mockIndex, {
      repoName: 'leetcode-daily',
      leetcodeUsername: 'octocat',
      leetcodeSite: 'cn',
      cacheBuster: 77777,
    });

    expect(readmeCn).toContain('https://leetcode.cn/u/octocat/');
    expect(readmeCn).toContain('https://leetcard.jacoblin.cool/octocat?theme=dark&font=Roboto&site=cn&v=77777');
    expect(readmeCn).toContain('https://leetcard.jacoblin.cool/octocat?ext=heatmap&theme=dark&site=cn&v=77777');
  });

  it('strips legacy stats cards placed before lc-sync markers in existing README', () => {
    const existingWithLegacy = `# ⚡ LeetCode Daily

> My LeetCode problem-solving journey — automatically synchronized to GitHub using LC-Sync.

## 📈 LeetCode Stats

[![LeetCode Stats](https://leetcard.jacoblin.cool/prishabh3?theme=dark&font=Roboto)](https://leetcode.com/u/prishabh3/)

<!-- lc-sync:start -->
old
<!-- lc-sync:end -->
`;
    const regenerated = generateReadme(existingWithLegacy, mockIndex, {
      repoName: 'leetcode-daily',
      githubUsername: 'prishabh3',
    });

    expect(regenerated).not.toContain('https://leetcard.jacoblin.cool/prishabh3');
    expect(regenerated).not.toContain('## 📈 LeetCode Stats');
  });
});
