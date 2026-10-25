import { RawHistoricalSubmission } from '../types/historical-import';
import { normalizeLanguage } from '../utils/languages';
import { ProblemDifficulty, SupportedLanguage } from '../types/submission';

export interface LeetCodeSessionStatus {
  isSignedIn: boolean;
  username?: string;
  error?: string;
}

export interface SubmissionsPageResult {
  submissions: RawHistoricalSubmission[];
  hasNext: boolean;
  lastKey?: string;
}

export interface SubmissionDetailsResult {
  code: string;
  runtime?: string;
  memory?: string;
  problemId?: string;
  difficulty?: ProblemDifficulty;
  topicTags?: string[];
  statusCode?: number;
}

export class LeetCodeHistoricalAdapter {
  private baseUrl: string;
  private minIntervalMs: number;
  private lastRequestTime: number = 0;

  constructor(baseUrl: string = 'https://leetcode.com', minIntervalMs: number = 200) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.minIntervalMs = minIntervalMs;
  }

  private async rateLimitDelay(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minIntervalMs) {
      await new Promise((resolve) => setTimeout(resolve, this.minIntervalMs - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Executes fetch with credentials and exponential backoff retry on 429 rate limit
   */
  private async fetchWithRetry(url: string, init: RequestInit = {}, maxRetries: number = 3): Promise<Response> {
    await this.rateLimitDelay();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...init,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
            ...init.headers,
          },
        });

        if (response.status === 429) {
          if (attempt < maxRetries) {
            const delay = this.minIntervalMs === 0 ? 5 : Math.pow(2, attempt) * 600;
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
          throw new Error('LeetCode rate limit reached (HTTP 429). Please wait a moment before continuing.');
        }

        return response;
      } catch (err: any) {
        if (attempt >= maxRetries) {
          throw err;
        }
        await new Promise((r) => setTimeout(r, this.minIntervalMs === 0 ? 5 : 500 * attempt));
      }
    }

    throw new Error('Failed to reach LeetCode after multiple attempts.');
  }

  /**
   * Verifies whether user is logged into LeetCode
   */
  async checkSession(): Promise<LeetCodeSessionStatus> {
    const query = `
      query userStatus {
        userStatus {
          isSignedIn
          username
          realName
          userSlug
        }
      }
    `;

    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/graphql`, {
        method: 'POST',
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        return {
          isSignedIn: false,
          error: `LeetCode responded with HTTP ${response.status}. Please check your internet connection.`,
        };
      }

      const data = await response.json();
      const userStatus = data?.data?.userStatus;

      if (userStatus && userStatus.isSignedIn) {
        return {
          isSignedIn: true,
          username: userStatus.username || userStatus.userSlug,
        };
      }

      return {
        isSignedIn: false,
        error: 'Not logged in. Please sign in to LeetCode in your browser to import your historical submissions.',
      };
    } catch (err: any) {
      return {
        isSignedIn: false,
        error: err?.message || 'Could not connect to LeetCode.',
      };
    }
  }

  /**
   * Fetches a paginated page of historical submissions
   */
  async fetchSubmissionsPage(
    offset: number = 0,
    limit: number = 20,
    lastKey?: string
  ): Promise<SubmissionsPageResult> {
    // 1. Try GraphQL submissionList query
    const graphqlQuery = `
      query submissionList($offset: Int!, $limit: Int!, $lastKey: String) {
        submissionList(offset: $offset, limit: $limit, lastKey: $lastKey) {
          lastKey
          hasNext
          submissions {
            id
            statusDisplay
            lang
            runtime
            timestamp
            url
            isPending
            title
            memory
            titleSlug
          }
        }
      }
    `;

    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/graphql`, {
        method: 'POST',
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { offset, limit, lastKey: lastKey || null },
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const data = json?.data?.submissionList;
        if (data && Array.isArray(data.submissions)) {
          const rawSubmissions: RawHistoricalSubmission[] = data.submissions.map((s: any) => {
            const rawLang = String(s.lang || '').toLowerCase();
            const normalized = normalizeLanguage(rawLang) as SupportedLanguage;
            return {
              id: String(s.id),
              title: s.title || '',
              titleSlug: s.titleSlug || '',
              statusDisplay: s.statusDisplay || (s.isPending ? 'Pending' : 'Unknown'),
              lang: rawLang,
              normalizedLanguage: normalized,
              runtime: s.runtime || undefined,
              memory: s.memory || undefined,
              timestamp: Number(s.timestamp) || Math.floor(Date.now() / 1000),
              url: s.url ? (s.url.startsWith('http') ? s.url : `${this.baseUrl}${s.url}`) : undefined,
            };
          });

          return {
            submissions: rawSubmissions,
            hasNext: Boolean(data.hasNext),
            lastKey: data.lastKey || undefined,
          };
        }
      }
    } catch {
      // Fallback to REST API if GraphQL fails
    }

    // 2. Fallback to REST submissions endpoint
    try {
      const restUrl = `${this.baseUrl}/api/submissions/?offset=${offset}&limit=${limit}`;
      const response = await this.fetchWithRetry(restUrl, { method: 'GET' });

      if (response.ok) {
        const json = await response.json();
        const dumps = json.submissions_dump;
        if (Array.isArray(dumps)) {
          const rawSubmissions: RawHistoricalSubmission[] = dumps.map((s: any) => {
            const rawLang = String(s.lang || '').toLowerCase();
            const normalized = normalizeLanguage(rawLang) as SupportedLanguage;
            return {
              id: String(s.id),
              title: s.title || '',
              titleSlug: s.title_slug || '',
              statusDisplay: s.status_display || 'Unknown',
              lang: rawLang,
              normalizedLanguage: normalized,
              runtime: s.runtime || undefined,
              memory: s.memory || undefined,
              timestamp: Number(s.timestamp) || Math.floor(Date.now() / 1000),
              url: s.url ? (s.url.startsWith('http') ? s.url : `${this.baseUrl}${s.url}`) : undefined,
              code: s.code || undefined,
            };
          });

          return {
            submissions: rawSubmissions,
            hasNext: Boolean(json.has_next),
          };
        }
      }
    } catch (err: any) {
      throw new Error(`Failed to fetch LeetCode submissions page at offset ${offset}: ${err?.message || 'Network error'}`);
    }

    return {
      submissions: [],
      hasNext: false,
    };
  }

  /**
   * Retrieves individual source code and additional metadata for a submission
   */
  async fetchSubmissionDetails(submissionId: string | number): Promise<SubmissionDetailsResult> {
    const idNum = parseInt(String(submissionId), 10);

    // 1. Try GraphQL submissionDetails query
    if (!isNaN(idNum)) {
      const query = `
        query submissionDetails($submissionId: Int!) {
          submissionDetails(submissionId: $submissionId) {
            runtime
            runtimeDisplay
            memory
            memoryDisplay
            code
            timestamp
            statusCode
            lang {
              name
              verboseName
            }
            question {
              questionId
              titleSlug
              title
            }
            topicTags {
              name
              slug
            }
          }
        }
      `;

      try {
        const response = await this.fetchWithRetry(`${this.baseUrl}/graphql`, {
          method: 'POST',
          body: JSON.stringify({
            query,
            variables: { submissionId: idNum },
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const details = json?.data?.submissionDetails;
          if (details && details.code) {
            const tags = Array.isArray(details.topicTags)
              ? details.topicTags.map((t: any) => t.name || t.slug).filter(Boolean)
              : [];

            return {
              code: details.code,
              runtime: details.runtimeDisplay || (details.runtime ? `${details.runtime} ms` : undefined),
              memory: details.memoryDisplay || (details.memory ? `${details.memory} MB` : undefined),
              problemId: details.question?.questionId || undefined,
              topicTags: tags,
              statusCode: details.statusCode,
            };
          }
        }
      } catch {
        // Fall through to HTML scraping
      }
    }

    // 2. Fallback to scraping the detail HTML page
    try {
      const detailUrl = `${this.baseUrl}/submissions/detail/${submissionId}/`;
      const response = await this.fetchWithRetry(detailUrl, { method: 'GET' });

      if (response.ok) {
        const html = await response.text();

        // Regex patterns for submission code in script tag
        let extractedCode = '';
        const codeMatch = html.match(/submissionCode:\s*['"]([\s\S]*?)['"],/);
        if (codeMatch && codeMatch[1]) {
          try {
            extractedCode = JSON.parse(`"${codeMatch[1]}"`);
          } catch {
            extractedCode = codeMatch[1].replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"');
          }
        }

        // Alternative regex for pre/code
        if (!extractedCode) {
          const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
          if (preMatch && preMatch[1]) {
            extractedCode = preMatch[1]
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"');
          }
        }

        // Extract runtime / memory / question ID if present
        let problemId: string | undefined;
        const qIdMatch = html.match(/questionId:\s*['"]?(\d+)['"]?/);
        if (qIdMatch) problemId = qIdMatch[1];

        return {
          code: extractedCode,
          problemId,
        };
      }
    } catch (err: any) {
      throw new Error(`Failed to retrieve code for submission ${submissionId}: ${err?.message || 'Network error'}`);
    }

    return { code: '' };
  }
}
