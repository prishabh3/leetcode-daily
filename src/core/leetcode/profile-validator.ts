/**
 * LeetCode Profile Validator and URL Generator
 * Handles extraction, validation, and endpoint construction for LeetCode profile cards.
 */

export interface LeetCodeVerificationResult {
  valid: boolean;
  username?: string;
  error?: string;
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
 * with a fallback to the card provider endpoint.
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

  // 1. Primary: Query LeetCode Public GraphQL API
  try {
    const query = `query userPublicProfile($username: String!) { matchedUser(username: $username) { username } }`;
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
        return {
          valid: true,
          username: json.data.matchedUser.username,
        };
      }
      if (json?.data?.matchedUser === null || json?.errors?.some((e: any) => /not exist/i.test(e.message))) {
        return {
          valid: false,
          error: `User "${clean}" does not exist on LeetCode.`,
        };
      }
    }
  } catch {
    // If network to LeetCode fails, attempt fallback
  }

  // 2. Secondary: Query leetcard provider SVG endpoint
  try {
    const cardUrl = `https://leetcard.jacoblin.cool/${encodeURIComponent(clean)}?theme=dark`;
    const response = await fetch(cardUrl);
    if (response.ok) {
      const text = await response.text();
      if (text.includes('User Not Found')) {
        return {
          valid: false,
          error: `User "${clean}" does not exist on LeetCode.`,
        };
      }
      return {
        valid: true,
        username: clean,
      };
    }
  } catch (err: any) {
    return {
      valid: false,
      error: `Could not verify account with LeetCode: ${err?.message || 'Network error'}`,
    };
  }

  return {
    valid: false,
    error: `Could not verify LeetCode account "${clean}".`,
  };
}
