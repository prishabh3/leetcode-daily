import { GitHubSettings } from '../types/settings';
import { GitHubError, sanitizeErrorSecret } from './rate-limiter';

export interface RepoTestResult {
  success: boolean;
  message: string;
  repoDetails?: {
    fullName: string;
    isPrivate: boolean;
    defaultBranch: string;
    hasPushPermission: boolean;
  };
}

export interface FileChange {
  path: string;
  content: string;
}

export class GitHubClient {
  private settings: GitHubSettings;

  constructor(settings: GitHubSettings) {
    this.settings = settings;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.settings.token?.trim();
    if (!token) {
      throw new GitHubError('GitHub access token is missing or empty. Please configure in settings.', 401);
    }

    const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;

    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/vnd.github+json');
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('X-GitHub-Api-Version', '2022-11-28');

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err: any) {
      throw new GitHubError(
        `Network error connecting to GitHub: ${sanitizeErrorSecret(err?.message || 'Check network')}`,
        0
      );
    }

    if (!response.ok) {
      let errorBody = '';
      try {
        const json = await response.json();
        errorBody = json.message || JSON.stringify(json);
      } catch {
        errorBody = await response.text();
      }

      throw new GitHubError(errorBody, response.status, response.headers);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Tests connectivity, repo existence, and push permissions
   */
  async testConnection(): Promise<RepoTestResult> {
    try {
      const { owner, repo, branch } = this.settings;
      if (!owner || !repo) {
        return {
          success: false,
          message: 'Repository owner and name must be specified.',
        };
      }

      // 1. Check user token
      await this.request('/user');

      // 2. Check repo access
      const repoData = await this.request(`/repos/${owner}/${repo}`);

      const canPush = repoData.permissions?.push ?? true;
      if (!canPush) {
        return {
          success: false,
          message: `You have read access to ${owner}/${repo}, but not push (write) access. Check token permissions.`,
          repoDetails: {
            fullName: repoData.full_name,
            isPrivate: repoData.private,
            defaultBranch: repoData.default_branch,
            hasPushPermission: false,
          },
        };
      }

      // 3. Check branch if specified
      const targetBranch = branch || repoData.default_branch || 'main';
      try {
        await this.request(`/repos/${owner}/${repo}/branches/${encodeURIComponent(targetBranch)}`);
      } catch (branchErr: any) {
        if (branchErr.status === 404) {
          return {
            success: true,
            message: `Connected! Note: Branch '${targetBranch}' does not exist yet; it will be created on first sync.`,
            repoDetails: {
              fullName: repoData.full_name,
              isPrivate: repoData.private,
              defaultBranch: repoData.default_branch,
              hasPushPermission: true,
            },
          };
        }
      }

      return {
        success: true,
        message: `Successfully connected to ${repoData.full_name} with write access.`,
        repoDetails: {
          fullName: repoData.full_name,
          isPrivate: repoData.private,
          defaultBranch: repoData.default_branch,
          hasPushPermission: true,
        },
      };
    } catch (err: any) {
      if (err.isAuthError) {
        return {
          success: false,
          message: 'Authentication failed. Please verify your GitHub Personal Access Token.',
        };
      }
      if (err.status === 404) {
        return {
          success: false,
          message: `Repository '${this.settings.owner}/${this.settings.repo}' not found or token lacks access.`,
        };
      }
      return {
        success: false,
        message: err.message || 'Connection test failed.',
      };
    }
  }

  /**
   * Fetches raw content of a file from repository branch if it exists, or returns null
   */
  async getFileContent(filePath: string): Promise<{ content: string; sha: string } | null> {
    const { owner, repo, branch } = this.settings;
    try {
      const res = await this.request(
        `/repos/${owner}/${repo}/contents/${filePath}?ref=${encodeURIComponent(branch || 'main')}`
      );
      if (res && res.content) {
        const decoded = atob(res.content.replace(/\s/g, ''));
        return {
          content: decoded,
          sha: res.sha,
        };
      }
      return null;
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  }

  /**
   * Direct Contents API commit fallback for a single file or initializing empty repos
   */
  async putSingleFile(filePath: string, content: string, commitMessage: string, existingSha?: string): Promise<string> {
    const { owner, repo, branch } = this.settings;
    const body: Record<string, any> = {
      message: commitMessage,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: branch || 'main',
    };
    if (existingSha) {
      body.sha = existingSha;
    }

    const res = await this.request(`/repos/${owner}/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return res.commit?.sha || '';
  }

  get rawSettings(): GitHubSettings {
    return this.settings;
  }

  async rawRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, options);
  }
}
