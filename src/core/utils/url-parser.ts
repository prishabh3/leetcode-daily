export interface ParsedProblemUrl {
  isValid: boolean;
  slug: string;
  inferredTitle: string;
  problemId?: string;
  submissionId?: string;
}

/**
 * Extracts problem slug, submission ID, and formatted title from a LeetCode problem URL
 */
export function parseLeetCodeUrl(rawUrl: string): ParsedProblemUrl {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, slug: '', inferredTitle: '' };
  }

  try {
    const url = new URL(rawUrl, 'https://leetcode.com');
    if (!url.hostname.includes('leetcode.com') && !url.hostname.includes('leetcode.cn') && !url.hostname.includes('localhost')) {
      return { isValid: false, slug: '', inferredTitle: '' };
    }

    const pathSegments = url.pathname.split('/').filter(Boolean);
    const problemsIndex = pathSegments.indexOf('problems');

    if (problemsIndex === -1 || problemsIndex + 1 >= pathSegments.length) {
      return { isValid: false, slug: '', inferredTitle: '' };
    }

    const slug = pathSegments[problemsIndex + 1].toLowerCase();

    // Check for submission ID in path, e.g. /problems/two-sum/submissions/1234567/
    let submissionId: string | undefined;
    const submissionsIndex = pathSegments.indexOf('submissions');
    if (submissionsIndex !== -1 && submissionsIndex + 1 < pathSegments.length) {
      const potentialId = pathSegments[submissionsIndex + 1];
      if (/^\d+$/.test(potentialId)) {
        submissionId = potentialId;
      }
    }

    // Infer title from slug (e.g. "two-sum" -> "Two Sum", "3sum-closest" -> "3Sum Closest")
    const inferredTitle = slug
      .split('-')
      .map((word) => {
        if (/^\d+[a-z]+$/i.test(word)) {
          // e.g. 3sum -> 3Sum
          return word.slice(0, -3) + 'Sum';
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');

    return {
      isValid: true,
      slug,
      inferredTitle,
      submissionId,
    };
  } catch {
    return { isValid: false, slug: '', inferredTitle: '' };
  }
}
