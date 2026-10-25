/**
 * LeetCode Profile Validator and URL Generator
 * Handles extraction, validation, and endpoint construction for LeetCode profile cards.
 */

export interface LeetCodeAccountStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

export interface LeetCodeVerificationResult {
  valid: boolean;
  username?: string;
  error?: string;
  stats?: LeetCodeAccountStats;
  cardVerified?: boolean;
  heatmapVerified?: boolean;
}

/**
 * Detects whether JacobLinCool SVG output indicates "User Not Found".
 * The provider returns HTTP 200 with fallback mock numbers even for nonexistent users.
 */
export function isProviderUserNotFoundError(svgContent: string): boolean {
  if (!svgContent) return true;
  return (
    svgContent.includes('User Not Found') ||
    /<title[^>]*>User Not Found/i.test(svgContent) ||
    /<text[^>]*id="username-text"[^>]*>User Not Found<\/text>/i.test(svgContent)
  );
}

/**
 * Extracts a normalized, validated LeetCode username from user input.
 * Accepts:
 *  - "username"
 *  - "@username"
 *  - "https://leetcode.com/u/username/"
 *  - "https://leetcode.com/username"
 *  - "https://leetcode.cn/u/username/"
 *
 * Rejects non-profile URLs and invalid username characters.
 */
export function extractLeetCodeUsername(input: string | undefined | null): string | null {
  if (!input) return null;
  let trimmed = input.trim();
  if (!trimmed) return null;

  // Remove leading @ if user entered @handle
  if (trimmed.startsWith('@')) {
    trimmed = trimmed.slice(1).trim();
  }

  // Check if input is a URL
  if (/^(https?:\/\/)?([a-zA-Z0-9-]+\.)?leetcode\.(com|cn)/i.test(trimmed)) {
    try {
      const urlString = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      const url = new URL(urlString);
      const segments = url.pathname.split('/').filter(Boolean);

      // Block reserved LeetCode system paths
      const nonUserPaths = new Set([
        'problems',
        'problemset',
        'contest',
        'explore',
        'discuss',
        'interview',
        'studyplan',
        'tag',
        'submissions',
        'assessment',
        'company',
      ]);

      if (segments.length >= 2 && segments[0].toLowerCase() === 'u') {
        trimmed = segments[1];
      } else if (segments.length >= 1) {
        if (nonUserPaths.has(segments[0].toLowerCase())) {
          return null;
        }
        trimmed = segments[0];
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }

  // Clean any remaining query strings, hashes, or trailing slashes
  trimmed = trimmed.replace(/[?#].*$/, '').replace(/\/+$/, '').trim();

  // Validate LeetCode username specification: 3-30 chars, alphanumeric + underscore + hyphen
  const validPattern = /^[a-zA-Z0-9_-]{3,30}$/;
  if (validPattern.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Returns the canonical LeetCode profile URL
 */
export function getLeetCodeProfileUrl(username: string): string {
  const clean = extractLeetCodeUsername(username) || username.trim();
  return `https://leetcode.com/u/${encodeURIComponent(clean)}/`;
}

/**
 * Returns the LeetCode stats card SVG URL (JacobLinCool provider)
 */
export function getLeetCodeStatsCardUrl(username: string, cacheBuster?: string | number): string {
  const clean = extractLeetCodeUsername(username) || username.trim();
  const v = cacheBuster ? `&v=${cacheBuster}` : '';
  return `https://leetcard.jacoblin.cool/${encodeURIComponent(clean)}?theme=dark&font=Roboto${v}`;
}

/**
 * Returns the LeetCode submission activity heatmap SVG URL (JacobLinCool provider)
 */
export function getLeetCodeHeatmapUrl(username: string, cacheBuster?: string | number): string {
  const clean = extractLeetCodeUsername(username) || username.trim();
  const v = cacheBuster ? `&v=${cacheBuster}` : '';
  return `https://leetcard.jacoblin.cool/${encodeURIComponent(clean)}?ext=heatmap&theme=dark${v}`;
}

/**
 * Verifies whether a LeetCode username actually exists by querying LeetCode's public GraphQL API
 * and cross-checking the JacobLinCool card and heatmap provider endpoints.
 */
export async function verifyLeetCodeUsername(
  input: string | undefined | null
): Promise<LeetCodeVerificationResult> {
  const clean = extractLeetCodeUsername(input);
  if (!clean) {
    return {
      valid: false,
      error: 'Invalid LeetCode username format. Usernames must be 3–30 characters and contain only letters, numbers, hyphens, or underscores.',
    };
  }

  let canonicalUsername = clean;
  let stats: LeetCodeAccountStats | undefined;

  // 1. Primary: Query LeetCode Public GraphQL API
  try {
    const query = `
      query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables: { username: clean } }),
    });

    if (response.ok) {
      const json = await response.json();
      if (json?.data?.matchedUser?.username) {
        canonicalUsername = json.data.matchedUser.username;
        const acList: Array<{ difficulty: string; count: number }> =
          json.data.matchedUser.submitStatsGlobal?.acSubmissionNum || [];

        let total = 0;
        let easy = 0;
        let medium = 0;
        let hard = 0;

        for (const item of acList) {
          if (item.difficulty === 'All') total = item.count;
          else if (item.difficulty === 'Easy') easy = item.count;
          else if (item.difficulty === 'Medium') medium = item.count;
          else if (item.difficulty === 'Hard') hard = item.count;
        }

        stats = {
          totalSolved: total,
          easySolved: easy,
          mediumSolved: medium,
          hardSolved: hard,
        };
      } else if (
        json?.data?.matchedUser === null ||
        json?.errors?.some((e: any) => /not exist/i.test(e.message))
      ) {
        return {
          valid: false,
          error: `User "${clean}" does not exist on LeetCode.`,
        };
      }
    }
  } catch {
    // If direct LeetCode GraphQL fetch is blocked by environment, proceed to provider check
  }

  // 2. Secondary: Query leetcard provider SVG endpoint and inspect for "User Not Found"
  let cardVerified = false;
  let heatmapVerified = false;

  try {
    const cardUrl = `https://leetcard.jacoblin.cool/${encodeURIComponent(canonicalUsername)}?theme=dark`;
    const response = await fetch(cardUrl);
    if (response.ok) {
      const text = await response.text();
      if (isProviderUserNotFoundError(text)) {
        return {
          valid: false,
          error: `JacobLinCool stats card provider reports "User Not Found" for "${canonicalUsername}".`,
        };
      }
      cardVerified = true;
    }
  } catch (err: any) {
    // If provider network fails but GraphQL succeeded, we still have verified username
  }

  try {
    const heatmapUrl = `https://leetcard.jacoblin.cool/${encodeURIComponent(canonicalUsername)}?ext=heatmap&theme=dark`;
    const response = await fetch(heatmapUrl);
    if (response.ok) {
      const text = await response.text();
      if (isProviderUserNotFoundError(text)) {
        return {
          valid: false,
          error: `JacobLinCool heatmap provider reports "User Not Found" for "${canonicalUsername}".`,
        };
      }
      heatmapVerified = true;
    }
  } catch {
    // pass
  }

  return {
    valid: true,
    username: canonicalUsername,
    stats,
    cardVerified,
    heatmapVerified,
  };
}
