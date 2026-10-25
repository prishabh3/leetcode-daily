import {
  extractLeetCodePageData,
  extractCodeFromDom,
  detectSubmissionVerdict,
} from './leetcode-extractor';
import { PlatformSubmission } from '../core/types/submission';
import { parseLeetCodeUrl } from '../core/utils/url-parser';

export type SubmissionLifecycleState =
  | 'IDLE'
  | 'WAITING_FOR_VERDICT'
  | 'ACCEPTED'
  | 'EXTRACTING'
  | 'SYNCING'
  | 'SYNCED'
  | 'FAILED'
  | 'NEEDS_MANUAL_ACTION';

export type SubmissionCallback = (
  submission: PlatformSubmission,
  onResult: (result: SyncFeedback) => void
) => void;

export interface SyncFeedback {
  success: boolean;
  status: 'SYNCED' | 'FAILED' | 'QUEUED_FOR_REVIEW';
  commitSha?: string;
  isDuplicate?: boolean;
  problemTitle?: string;
  repo?: string;
  error?: string;
  actionRequired?: 'OPEN_SETTINGS' | 'RETRY' | 'MANUAL_IMPORT' | 'REFRESH_PAGE';
}

/**
 * Checks if the Chrome extension context is currently alive and valid for messaging.
 * Returns false if the extension was reloaded in chrome://extensions and the page hasn't been refreshed yet.
 */
export function isExtensionContextValid(): boolean {
  try {
    return typeof chrome !== 'undefined' && Boolean(chrome.runtime && chrome.runtime.id && chrome.runtime.sendMessage);
  } catch {
    return false;
  }
}

export class LeetCodeObserver {
  private state: SubmissionLifecycleState = 'IDLE';
  private submitButtonClickedTime: number = 0;
  private submittedCodeSnapshot: string = '';
  private submittedLanguageSnapshot: string = '';
  private observer: MutationObserver | null = null;
  private onAcceptedCallback: SubmissionCallback | null = null;

  private currentSlug: string = '';
  private lastProcessedKey: string = '';
  private hasAttachedClickListener: boolean = false;
  private activeSubmission: PlatformSubmission | null = null;
  private activeTimers: any[] = [];
  private syncTimeoutTimer: any = null;

  private popstateHandler: (() => void) | null = null;
  private clickHandler: ((e: MouseEvent) => void) | null = null;

  constructor(onAccepted: SubmissionCallback) {
    this.onAcceptedCallback = onAccepted;
  }

  start(): void {
    const current = parseLeetCodeUrl(window.location.href);
    this.currentSlug = current.slug;

    this.attachSubmitListener();
    this.attachNavigationListener();
    this.startDomObserver();
    this.renderFloatingBadge();

    // Check if there was a pending submission saved prior to an extension reload / page refresh
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const pendingRaw = sessionStorage.getItem('lc_sync_pending_submission');
        if (pendingRaw) {
          sessionStorage.removeItem('lc_sync_pending_submission');
          const pendingSub: PlatformSubmission = JSON.parse(pendingRaw);
          if (pendingSub && (pendingSub.problemSlug === this.currentSlug || !this.currentSlug)) {
            console.log('[LC-Sync] Resuming pending submission after page reload:', pendingSub.problemTitle);
            this.activeSubmission = pendingSub;
            this.state = 'SYNCING';
            this.updateBadge({
              type: 'syncing',
              text: `Syncing ${pendingSub.problemTitle}...`,
            });
            if (this.onAcceptedCallback) {
              this.onAcceptedCallback(pendingSub, (fb) => this.handleSyncFeedback(fb));
            }
          }
        }
      }
    } catch (e) {
      console.warn('[LC-Sync] Could not inspect pending submission:', e);
    }
  }

  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.clickHandler) {
      document.removeEventListener('click', this.clickHandler, true);
      this.clickHandler = null;
      this.hasAttachedClickListener = false;
    }
    if (this.popstateHandler) {
      window.removeEventListener('popstate', this.popstateHandler);
      this.popstateHandler = null;
    }
    for (const t of this.activeTimers) {
      clearTimeout(t);
    }
    this.activeTimers = [];
    if (this.syncTimeoutTimer) {
      clearTimeout(this.syncTimeoutTimer);
      this.syncTimeoutTimer = null;
    }
  }

  private safeTimeout(fn: () => void, ms: number): any {
    const timer = setTimeout(() => {
      fn();
      this.activeTimers = this.activeTimers.filter((t) => t !== timer);
    }, ms);
    if (typeof timer === 'object' && typeof (timer as any).unref === 'function') {
      (timer as any).unref();
    }
    this.activeTimers.push(timer);
    return timer;
  }

  private attachSubmitListener(): void {
    if (this.hasAttachedClickListener) return;
    this.hasAttachedClickListener = true;

    this.clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const button = target.closest('button');
      if (button) {
        const btnText = (button.innerText || button.textContent || '').trim().toLowerCase();
        const e2e = button.getAttribute('data-e2e-locator');
        const dataCy = button.getAttribute('data-cy');

        if (
          btnText === 'submit' ||
          e2e === 'console-submit-button' ||
          dataCy === 'submit-code-btn' ||
          btnText.includes('submit')
        ) {
          // Snapshot code and language at the exact click moment
          this.submittedCodeSnapshot = extractCodeFromDom();
          const pageData = extractLeetCodePageData();
          this.submittedLanguageSnapshot = pageData.language || 'cpp';
          this.submitButtonClickedTime = Date.now();
          this.state = 'WAITING_FOR_VERDICT';

          this.updateBadge({
            type: 'evaluating',
            text: 'Evaluating submission...',
          });
        }
      }
    };

    document.addEventListener('click', this.clickHandler, true);
  }

  private attachNavigationListener(): void {
    this.popstateHandler = () => {
      this.checkUrlChange();
    };
    window.addEventListener('popstate', this.popstateHandler);

    // Wrap history methods safely without re-wrapping
    const originalPushState = history.pushState;
    if (originalPushState && !(originalPushState as any).__lc_sync_wrapped) {
      const wrapped = (...args: any[]) => {
        originalPushState.apply(history, args as any);
        this.checkUrlChange();
      };
      (wrapped as any).__lc_sync_wrapped = true;
      history.pushState = wrapped;
    }
  }

  private checkUrlChange(): void {
    const parsed = parseLeetCodeUrl(window.location.href);
    if (parsed.slug && parsed.slug !== this.currentSlug) {
      this.resetForNewProblem(parsed.slug);
    }
  }

  private resetForNewProblem(newSlug: string): void {
    this.currentSlug = newSlug;
    this.state = 'IDLE';
    this.submitButtonClickedTime = 0;
    this.submittedCodeSnapshot = '';
    this.lastProcessedKey = '';
    this.activeSubmission = null;
    this.updateBadge({
      type: 'ready',
      text: 'LC-Sync Ready',
    });
  }

  private startDomObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      // Ignore mutations originating solely inside the LC-Sync floating badge
      const onlyBadge = mutations.every((m) => {
        const el = m.target as HTMLElement | null;
        return el && (el.id === 'lc-sync-floating-badge' || el.closest('#lc-sync-floating-badge'));
      });
      if (onlyBadge) return;

      this.checkUrlChange();

      // If currently syncing or synced, ignore DOM mutations
      if (this.state === 'SYNCING' || this.state === 'SYNCED') {
        return;
      }

      // Only check verdicts if we are waiting for a verdict
      // OR on a direct submission URL
      const isDirectSubmissionUrl = window.location.pathname.includes('/submissions/');
      const timeSinceSubmit = Date.now() - this.submitButtonClickedTime;

      if (this.state !== 'WAITING_FOR_VERDICT' && !isDirectSubmissionUrl) {
        return;
      }

      // Timeout after 60 seconds
      if (timeSinceSubmit > 60000 && !isDirectSubmissionUrl) {
        this.state = 'IDLE';
        this.updateBadge({ type: 'ready', text: 'LC-Sync Ready' });
        return;
      }

      const verdictDetails = detectSubmissionVerdict();

      if (verdictDetails.verdict === 'PENDING') {
        this.updateBadge({ type: 'evaluating', text: 'Judging submission...' });
        return;
      }

      if (verdictDetails.isTerminal) {
        if (!verdictDetails.isAccepted) {
          // Verdict is terminal but NOT accepted (e.g. Wrong Answer, TLE, etc.)
          this.state = 'IDLE';
          this.submitButtonClickedTime = 0;
          this.submittedCodeSnapshot = '';

          this.updateBadge({
            type: 'rejected',
            text: `Verdict: ${verdictDetails.rawText || verdictDetails.verdict}`,
          });

          // Revert to ready after 6s
          this.safeTimeout(() => {
            if (this.state === 'IDLE') {
              this.updateBadge({ type: 'ready', text: 'LC-Sync Ready' });
            }
          }, 6000);
          return;
        }

        // VERDICT IS ACCEPTED!
        this.state = 'ACCEPTED';
        this.submitButtonClickedTime = 0; // prevent re-triggering

        // Retrieve and validate code
        this.state = 'EXTRACTING';
        let finalCode = this.submittedCodeSnapshot;
        if (!finalCode || finalCode.length < 5) {
          finalCode = extractCodeFromDom();
        }

        const pageData = extractLeetCodePageData();
        const submissionKey = `${pageData.problemSlug || this.currentSlug}-${verdictDetails.submissionId || finalCode.slice(0, 30)}`;

        // Prevent duplicate processing of the same submission on rapid mutations
        if (this.lastProcessedKey === submissionKey) {
          return;
        }
        this.lastProcessedKey = submissionKey;

        // Code extraction validation guard
        if (!finalCode || finalCode.trim().length === 0) {
          this.state = 'NEEDS_MANUAL_ACTION';
          this.updateBadge({
            type: 'error',
            text: 'Extraction failed: Could not read submitted code.',
            action: {
              label: 'Import Manually',
              onClick: () => this.openManualImport(),
            },
          });
          return;
        }

        const now = Date.now();
        const submission: PlatformSubmission = {
          problemId: pageData.problemId || '0',
          problemTitle: pageData.problemTitle || 'LeetCode Problem',
          problemSlug: pageData.problemSlug || this.currentSlug,
          url: window.location.href,
          difficulty: pageData.difficulty || 'Medium',
          language: pageData.language || (this.submittedLanguageSnapshot as any) || 'cpp',
          code: finalCode,
          submissionId: verdictDetails.submissionId,
          timestamp: now,
          status: 'Accepted',
          runtime: verdictDetails.runtime,
          memory: verdictDetails.memory,
        };

        this.activeSubmission = submission;
        this.state = 'SYNCING';
        this.updateBadge({
          type: 'syncing',
          text: `Syncing ${submission.problemTitle}...`,
        });

        // Clear any previous timeout
        if (this.syncTimeoutTimer) {
          clearTimeout(this.syncTimeoutTimer);
        }

        // Set defensive timeout (25 seconds) to prevent frozen "Syncing..." UI
        this.syncTimeoutTimer = setTimeout(async () => {
          if (this.state === 'SYNCING') {
            console.warn('[LC-Sync] Sync operation timed out waiting for feedback.');

            let resolvedFromStorage = false;
            try {
              if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                const data = await chrome.storage.local.get(['lc_sync_last_sync']);
                const last = data?.lc_sync_last_sync;
                if (last && last.problemTitle === submission.problemTitle) {
                  if (last.status === 'synced' || last.status === 'duplicate') {
                    resolvedFromStorage = true;
                    this.handleSyncFeedback({
                      success: true,
                      status: 'SYNCED',
                      isDuplicate: last.status === 'duplicate',
                      commitSha: last.commitSha,
                      problemTitle: submission.problemTitle,
                    });
                  }
                }
              }
            } catch {
              // fallback
            }

            if (!resolvedFromStorage && this.state === 'SYNCING') {
              this.handleSyncFeedback({
                success: false,
                status: 'FAILED',
                error: 'Sync timed out. Click Retry or check settings.',
                actionRequired: 'RETRY',
              });
            }
          }
        }, 25000);

        // Trigger automatic sync via callback
        if (this.onAcceptedCallback) {
          this.onAcceptedCallback(submission, (feedback) => {
            this.handleSyncFeedback(feedback);
          });
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  public handleSyncFeedback(feedback: SyncFeedback): void {
    if (this.syncTimeoutTimer) {
      clearTimeout(this.syncTimeoutTimer);
      this.syncTimeoutTimer = null;
    }

    if (feedback.status === 'SYNCED') {
      this.state = 'SYNCED';
      if (feedback.isDuplicate) {
        this.updateBadge({
          type: 'synced',
          text: `ℹ️ ${feedback.problemTitle || 'Solution'} is already synced`,
        });
      } else {
        const commitUrl =
          feedback.repo && feedback.commitSha
            ? `https://github.com/${feedback.repo}/commit/${feedback.commitSha}`
            : undefined;

        this.updateBadge({
          type: 'synced',
          text: `✓ Synced: ${feedback.problemTitle || 'Solution'} → GitHub`,
          link: commitUrl ? { label: 'View Commit', url: commitUrl } : undefined,
        });
      }

      // Revert badge to ready after 10 seconds
      this.safeTimeout(() => {
        if (this.state === 'SYNCED') {
          this.state = 'IDLE';
          this.updateBadge({ type: 'ready', text: 'LC-Sync Ready' });
        }
      }, 10000);
    } else if (feedback.status === 'FAILED') {
      this.state = 'FAILED';
      const isMissingConfig = feedback.actionRequired === 'OPEN_SETTINGS';
      const isNeedsRefresh =
        feedback.actionRequired === 'REFRESH_PAGE' ||
        Boolean(
          feedback.error &&
            (feedback.error.toLowerCase().includes('messaging not available') ||
              feedback.error.toLowerCase().includes('context invalidated') ||
              feedback.error.toLowerCase().includes('extension was reloaded') ||
              feedback.error.toLowerCase().includes('refresh this page'))
        );

      this.updateBadge({
        type: 'error',
        text: `✗ ${feedback.error || 'Sync failed'}`,
        action: isMissingConfig
          ? {
              label: 'Open Settings',
              onClick: () => this.openSettings(),
            }
          : isNeedsRefresh
          ? {
              label: 'Refresh Page',
              onClick: () => window.location.reload(),
            }
          : {
              label: 'Retry',
              onClick: () => this.retryActiveSubmission(),
            },
      });
    } else if (feedback.status === 'QUEUED_FOR_REVIEW') {
      this.state = 'IDLE';
      this.updateBadge({
        type: 'ready',
        text: 'Submission Queued for Review',
      });
    }
  }

  private retryActiveSubmission(): void {
    if (!this.activeSubmission) return;

    // Guard against calling runtime APIs from an invalidated context
    if (!isExtensionContextValid()) {
      try {
        sessionStorage.setItem('lc_sync_pending_submission', JSON.stringify(this.activeSubmission));
      } catch {}
      this.handleSyncFeedback({
        success: false,
        status: 'FAILED',
        error: 'Extension was reloaded. Please refresh this page to reconnect.',
        actionRequired: 'REFRESH_PAGE',
      });
      return;
    }

    this.lastProcessedKey = '';
    this.state = 'SYNCING';
    this.updateBadge({
      type: 'syncing',
      text: `Retrying ${this.activeSubmission.problemTitle}...`,
    });

    if (this.syncTimeoutTimer) {
      clearTimeout(this.syncTimeoutTimer);
    }
    this.syncTimeoutTimer = setTimeout(() => {
      if (this.state === 'SYNCING') {
        this.handleSyncFeedback({
          success: false,
          status: 'FAILED',
          error: 'Sync retry timed out. Click Retry again or check dashboard.',
          actionRequired: 'RETRY',
        });
      }
    }, 25000);

    if (this.onAcceptedCallback) {
      this.onAcceptedCallback(this.activeSubmission, (feedback) => {
        this.handleSyncFeedback(feedback);
      });
    }
  }

  private openSettings(): void {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ action: 'OPEN_SETTINGS' });
    }
  }

  private openManualImport(): void {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ action: 'OPEN_DASHBOARD', path: '/manual-import' });
    }
  }

  private renderFloatingBadge(): void {
    if (document.getElementById('lc-sync-floating-badge')) return;

    const badge = document.createElement('div');
    badge.id = 'lc-sync-floating-badge';
    badge.style.position = 'fixed';
    badge.style.bottom = '20px';
    badge.style.right = '20px';
    badge.style.zIndex = '999999';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.gap = '8px';
    badge.style.padding = '8px 14px';
    badge.style.backgroundColor = '#161b22';
    badge.style.color = '#c9d1d9';
    badge.style.border = '1px solid #30363d';
    badge.style.borderRadius = '20px';
    badge.style.boxShadow = '0 4px 12px rgba(0,0,0,0.35)';
    badge.style.fontFamily = '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = '500';
    badge.style.transition = 'all 0.2s ease';

    badge.innerHTML = `
      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#238636;"></span>
      <span>LC-Sync Ready</span>
    `;

    document.body.appendChild(badge);
  }

  private updateBadge(options: {
    type: 'ready' | 'evaluating' | 'syncing' | 'synced' | 'rejected' | 'error';
    text: string;
    link?: { label: string; url: string };
    action?: { label: string; onClick: () => void };
  }): void {
    const badge = document.getElementById('lc-sync-floating-badge');
    if (!badge) return;

    let dotColor = '#238636';
    let borderColor = '#30363d';
    let bgColor = '#161b22';

    if (options.type === 'evaluating') {
      dotColor = '#d29922';
      borderColor = '#d29922';
    } else if (options.type === 'syncing') {
      dotColor = '#58a6ff';
      borderColor = '#58a6ff';
    } else if (options.type === 'synced') {
      dotColor = '#3fb950';
      borderColor = '#238636';
      bgColor = '#0d1117';
    } else if (options.type === 'rejected') {
      dotColor = '#d29922';
      borderColor = 'rgba(210, 153, 34, 0.4)';
    } else if (options.type === 'error') {
      dotColor = '#f85149';
      borderColor = '#da3633';
      bgColor = '#1c1214';
    }

    badge.style.borderColor = borderColor;
    badge.style.backgroundColor = bgColor;

    badge.innerHTML = `
      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${dotColor}; flex-shrink:0;"></span>
      <span style="max-width:320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${options.text}</span>
    `;

    if (options.link) {
      const linkEl = document.createElement('a');
      linkEl.href = options.link.url;
      linkEl.target = '_blank';
      linkEl.rel = 'noreferrer';
      linkEl.textContent = options.link.label;
      linkEl.style.color = '#58a6ff';
      linkEl.style.textDecoration = 'underline';
      linkEl.style.marginLeft = '4px';
      badge.appendChild(linkEl);
    }

    if (options.action) {
      const btn = document.createElement('button');
      btn.textContent = options.action.label;
      btn.style.marginLeft = '8px';
      btn.style.padding = '2px 8px';
      btn.style.fontSize = '11px';
      btn.style.backgroundColor = '#21262d';
      btn.style.border = '1px solid #30363d';
      btn.style.color = '#f0f6fc';
      btn.style.borderRadius = '4px';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        options.action?.onClick();
      });
      badge.appendChild(btn);
    }
  }
}
