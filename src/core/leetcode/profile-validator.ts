/**
 * LeetCode Profile Validator and URL Generator
 * Handles extraction, validation, and endpoint construction for LeetCode profile cards.
 */

export type LeetCodeValidationState =
  | 'VALID'
  | 'INVALID_USERNAME'
  | 'PROVIDER_UNAVAILABLE'
  | 'UNVERIFIED';

export interface LeetCodeAccountStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

export interface LeetCodeVerificationResult {
  state: LeetCodeValidationState;
  valid: boolean;
  username?: string;
  site?: 'us' | 'cn';
  error?: string;
  stats?: LeetCodeAccountStats;
  cardVerified?: boolean;
  heatmapVerified?: boolean;
}

/**
 * Detects whether the input or profile URL targets LeetCode CN (leetcode.cn) or Global (leetcode.com).
 */
export function detectLeetCodeSite(input: string | undefined | null): 'us' | 'cn' {
  if (!input) return 'us';
  return /leetcode\.cn/i.test(input) ? 'cn' : 'us';
}

/**
 * Detects whether JacobLinCool SVG output indicates "User Not Found" or error.
 * The provider returns HTTP 200 with fallback mock numbers (e.g. 760 solved) even for nonexistent users.
 */
export function isProviderUserNotFoundError(svgContent: string): boolean {
  if (!svgContent) return true;
  return (
    svgContent.includes('User Not Found') ||
    /<title[^>]*>User Not Found/i.test(svgContent) ||
    /<text[^>]*id="username-text"[^>]*>User Not Found<\/text>/i.test(svgContent) ||
    /error/i.test(svgContent) && /User Not Found/i.test(svgContent)
  );
}

/**
 * Determines if external statistics card should be embedded in the README.
 * Strictly requires the state to be 'VALID' (not User Not Found, not mock numbers, not unverified).
 */
export function shouldEmbedLeetCodeStatsCard(
  verification: LeetCodeVerificationResult | undefined | null
): boolean {
  return Boolean(verification && verification.state === 'VALID' && verification.valid);
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
export function getLeetCodeProfileUrl(username: string, site: 'us' | 'cn' = 'us'): string {
  const clean = extractLeetCodeUsername(username) || username.trim();
  const domain = site === 'cn' ? 'leetcode.cn' : 'leetcode.com';
  return `https://${domain}/u/${encodeURIComponent(clean)}/`;
}

/**
 * Returns the LeetCode stats card SVG URL (JacobLinCool provider)
 * Supports dark theme, font, and site parameter as documented at https://github.com/JacobLinCool/LeetCode-Stats-Card
 */
export function getLeetCodeStatsCardUrl(
  username: string,
  siteOrCacheBuster?: 'us' | 'cn' | string | number,
  cacheBusterArg?: string | number
): string {
  const clean = extractLeetCodeUsername(username) || username.trim();
  let site: 'us' | 'cn' = 'us';
  let cacheBuster: string | number | undefined;

  if (siteOrCacheBuster === 'cn' || siteOrCacheBuster === 'us') {
    site = siteOrCacheBuster;
    cacheBuster = cacheBusterArg;
  } else {
    cacheBuster = siteOrCacheBuster;
  }

  const v = cacheBuster ? `&v=${cacheBuster}` : '';
  const siteParam = site === 'cn' ? '&site=cn' : '';
  return `https://leetcard.jacoblin.cool/${encodeURIComponent(clean)}?theme=dark&font=Roboto${siteParam}${v}`;
}

/**
 * Returns the LeetCode submission activity heatmap SVG URL (JacobLinCool provider)
 * Uses documented ext=heatmap and dark theme
 */
export function getLeetCodeHeatmapUrl(
  username: string,
  siteOrCacheBuster?: 'us' | 'cn' | string | number,
  cacheBusterArg?: string | number
): string {
  const clean = extractLeetCodeUsername(username) || username.trim();
  let site: 'us' | 'cn' = 'us';
  let cacheBuster: string | number | undefined;

  if (siteOrCacheBuster === 'cn' || siteOrCacheBuster === 'us') {
    site = siteOrCacheBuster;
    cacheBuster = cacheBusterArg;
  } else {
    cacheBuster = siteOrCacheBuster;
  }

  const v = cacheBuster ? `&v=${cacheBuster}` : '';
  const siteParam = site === 'cn' ? '&site=cn' : '';
  return `https://leetcard.jacoblin.cool/${encodeURIComponent(clean)}?ext=heatmap&theme=dark${siteParam}${v}`;
}

/**
 * Verifies whether a LeetCode username actually exists by querying LeetCode's public GraphQL API
 * and cross-checking the JacobLinCool card and heatmap provider endpoints.
 * Returns explicit validation state: VALID | INVALID_USERNAME | PROVIDER_UNAVAILABLE.
 */
export async function verifyLeetCodeUsername(
  input: string | undefined | null,
  siteOption?: 'us' | 'cn'
): Promise<LeetCodeVerificationResult> {
  const clean = extractLeetCodeUsername(input);
  if (!clean) {
    return {
      state: 'INVALID_USERNAME',
      valid: false,
      error:
        'Invalid LeetCode username format. Usernames must be 3–30 characters and contain only letters, numbers, hyphens, or underscores.',
    };
  }

  const site = siteOption || detectLeetCodeSite(input) || 'us';
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
    const gqlEndpoint = site === 'cn' ? 'https://leetcode.cn/graphql/' : 'https://leetcode.com/graphql';
    const response = await fetch(gqlEndpoint, {
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
          state: 'INVALID_USERNAME',
          valid: false,
          username: clean,
          site,
          error: `User "${clean}" does not exist on LeetCode (${site === 'cn' ? 'leetcode.cn' : 'leetcode.com'}).`,
        };
      }
    }
  } catch {
    // If direct LeetCode GraphQL fetch is blocked by environment, proceed to provider check
  }

  // 2. Secondary: Query JacobLinCool stats card endpoint and inspect for "User Not Found"
  let cardVerified = false;
  let heatmapVerified = false;

  try {
    const cardUrl = getLeetCodeStatsCardUrl(canonicalUsername, site);
    const response = await fetch(cardUrl);
    if (response.ok) {
      const text = await response.text();
      if (isProviderUserNotFoundError(text)) {
        return {
          state: 'INVALID_USERNAME',
          valid: false,
          username: canonicalUsername,
          site,
          error: `JacobLinCool stats provider reports "User Not Found" for "${canonicalUsername}".`,
        };
      }
      cardVerified = true;
    }
  } catch (err: any) {
    // network failure on card provider
  }

  try {
    const heatmapUrl = getLeetCodeHeatmapUrl(canonicalUsername, site);
    const response = await fetch(heatmapUrl);
    if (response.ok) {
      const text = await response.text();
      if (isProviderUserNotFoundError(text)) {
        return {
          state: 'INVALID_USERNAME',
          valid: false,
          username: canonicalUsername,
          site,
          error: `JacobLinCool heatmap provider reports "User Not Found" for "${canonicalUsername}".`,
        };
      }
      heatmapVerified = true;
    }
  } catch {
    // network failure on heatmap provider
  }

  // If at least one check succeeded or username is validated
  if (cardVerified || stats || heatmapVerified) {
    return {
      state: 'VALID',
      valid: true,
      username: canonicalUsername,
      site,
      stats,
      cardVerified,
      heatmapVerified,
    };
  }

  // If neither GraphQL nor provider were reachable due to offline/network environment
  return {
    state: 'PROVIDER_UNAVAILABLE',
    valid: false,
    username: canonicalUsername,
    site,
    error: 'External LeetCode verification service is unreachable.',
  };
}
