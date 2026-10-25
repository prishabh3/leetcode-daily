export class GitHubError extends Error {
  public status: number;
  public rateLimitRemaining?: number;
  public rateLimitResetTime?: Date;
  public isConflict: boolean;
  public isAuthError: boolean;
  public isRateLimit: boolean;

  constructor(message: string, status: number, headers?: Headers) {
    // Mask any accidental token exposure in message
    const sanitizedMessage = sanitizeErrorSecret(message);
    super(sanitizedMessage);
    this.name = 'GitHubError';
    this.status = status;

    this.isAuthError = status === 401 || status === 403 && message.toLowerCase().includes('bad credentials');
    this.isConflict = status === 409 || message.toLowerCase().includes('fast-forward');
    this.isRateLimit = status === 403 && (
      message.toLowerCase().includes('rate limit') ||
      headers?.get('x-ratelimit-remaining') === '0'
    );

    if (headers) {
      const remaining = headers.get('x-ratelimit-remaining');
      if (remaining) this.rateLimitRemaining = parseInt(remaining, 10);

      const reset = headers.get('x-ratelimit-reset');
      if (reset) this.rateLimitResetTime = new Date(parseInt(reset, 10) * 1000);
    }
  }
}

/**
 * Strips tokens, authorization headers, and secrets from error strings
 */
export function sanitizeErrorSecret(str: string): string {
  if (!str) return '';
  return str
    .replace(/(gh[pousr]_[A-Za-z0-9_]{20,255})/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/(github_pat_[A-Za-z0-9_]{20,255})/g, '[REDACTED_FINE_GRAINED_TOKEN]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
    .replace(/token\s+[A-Za-z0-9._-]+/gi, 'token [REDACTED]');
}
