import { extractLeetCodePageData, checkSubmissionAccepted } from './leetcode-extractor';
import { PlatformSubmission } from '../core/types/submission';

export type SubmissionCallback = (submission: PlatformSubmission) => void;

export class LeetCodeObserver {
  private lastSubmissionTimestamp: number = 0;
  private submitButtonClickedTime: number = 0;
  private observer: MutationObserver | null = null;
  private onAcceptedCallback: SubmissionCallback | null = null;

  constructor(onAccepted: SubmissionCallback) {
    this.onAcceptedCallback = onAccepted;
  }

  start(): void {
    this.attachSubmitListener();
    this.startDomObserver();
    this.renderFloatingBadge();
  }

  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private attachSubmitListener(): void {
    // Listen for click events globally on LeetCode page to detect when Submit is clicked
    document.addEventListener(
      'click',
      (e) => {
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
            this.submitButtonClickedTime = Date.now();
          }
        }
      },
      true
    );
  }

  private startDomObserver(): void {
    this.observer = new MutationObserver(() => {
      // Only check for acceptance if submit was clicked within the last 45 seconds
      // OR if we are on a direct submission URL
      const timeSinceSubmit = Date.now() - this.submitButtonClickedTime;
      const isDirectSubmissionUrl = window.location.pathname.includes('/submissions/');

      if (timeSinceSubmit > 45000 && !isDirectSubmissionUrl) {
        return;
      }

      const status = checkSubmissionAccepted();
      if (status.isAccepted) {
        const now = Date.now();
        // Prevent duplicate firing within 10 seconds for the same submission
        if (now - this.lastSubmissionTimestamp < 10000) {
          return;
        }

        this.lastSubmissionTimestamp = now;
        this.submitButtonClickedTime = 0; // reset trigger

        const pageData = extractLeetCodePageData();
        const submission: PlatformSubmission = {
          problemId: pageData.problemId || '0',
          problemTitle: pageData.problemTitle || 'LeetCode Problem',
          problemSlug: pageData.problemSlug || 'problem',
          url: window.location.href,
          difficulty: pageData.difficulty || 'Medium',
          language: pageData.language || 'cpp',
          code: pageData.code || '',
          submissionId: status.submissionId,
          timestamp: now,
          status: 'Accepted',
          runtime: status.runtime,
          memory: status.memory,
        };

        this.updateBadge('ready', 'Accepted! Ready to Sync');
        if (this.onAcceptedCallback) {
          this.onAcceptedCallback(submission);
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
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
    badge.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    badge.style.fontFamily = '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = '500';
    badge.style.cursor = 'pointer';
    badge.style.transition = 'all 0.2s ease';

    badge.innerHTML = `
      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#238636;"></span>
      <span>LC-Sync Ready</span>
    `;

    badge.addEventListener('click', () => {
      // Trigger extension review or options
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ action: 'OPEN_DASHBOARD' });
      }
    });

    document.body.appendChild(badge);
  }

  private updateBadge(type: 'ready' | 'syncing' | 'synced', text: string): void {
    const badge = document.getElementById('lc-sync-floating-badge');
    if (!badge) return;

    let dotColor = '#238636';
    if (type === 'syncing') dotColor = '#d29922';
    if (type === 'synced') dotColor = '#58a6ff';

    badge.innerHTML = `
      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${dotColor};"></span>
      <span>${text}</span>
    `;
  }
}
