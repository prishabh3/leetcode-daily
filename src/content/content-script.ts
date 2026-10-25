import { LeetCodeObserver, SyncFeedback, isExtensionContextValid } from './leetcode-observer';
import { PlatformSubmission } from '../core/types/submission';

console.log('[LC-Sync] Content script initialized on LeetCode page.');

const observer = new LeetCodeObserver((submission: PlatformSubmission, onFeedback: (res: SyncFeedback) => void) => {
  console.log('[LC-Sync] Accepted submission ready for sync:', submission.problemTitle);

  // Check if extension context is valid
  if (!isExtensionContextValid()) {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('lc_sync_pending_submission', JSON.stringify(submission));
      }
    } catch {}

    onFeedback({
      success: false,
      status: 'FAILED',
      error: 'Extension was reloaded. Please refresh this page to reconnect.',
      actionRequired: 'REFRESH_PAGE',
    });
    return;
  }

  try {
    chrome.runtime.sendMessage(
      {
        action: 'SUBMISSION_ACCEPTED',
        submission,
      },
      (response: SyncFeedback) => {
        if (chrome.runtime.lastError) {
          console.warn('[LC-Sync] chrome.runtime.lastError:', chrome.runtime.lastError.message);
          const errorMsg = chrome.runtime.lastError.message || '';
          const isContextInvalid =
            errorMsg.toLowerCase().includes('context invalidated') ||
            errorMsg.toLowerCase().includes('receiving end does not exist');

          if (isContextInvalid) {
            try {
              sessionStorage.setItem('lc_sync_pending_submission', JSON.stringify(submission));
            } catch {}
          }

          onFeedback({
            success: false,
            status: 'FAILED',
            error: isContextInvalid
              ? 'Extension was reloaded. Please refresh this page to reconnect.'
              : errorMsg || 'Communication error with extension background.',
            actionRequired: isContextInvalid ? 'REFRESH_PAGE' : 'RETRY',
          });
          return;
        }

        if (response) {
          onFeedback(response);
        } else {
          onFeedback({
            success: false,
            status: 'FAILED',
            error: 'No response received from background service worker.',
            actionRequired: 'RETRY',
          });
        }
      }
    );
  } catch (err: any) {
    console.error('[LC-Sync] Failed to send SUBMISSION_ACCEPTED message:', err);
    const errText = err?.message || '';
    const isContextInvalid =
      errText.toLowerCase().includes('context invalidated') ||
      errText.toLowerCase().includes('script context');

    if (isContextInvalid) {
      try {
        sessionStorage.setItem('lc_sync_pending_submission', JSON.stringify(submission));
      } catch {}
    }

    onFeedback({
      success: false,
      status: 'FAILED',
      error: isContextInvalid
        ? 'Extension was reloaded. Please refresh this page to reconnect.'
        : errText || 'Failed to dispatch sync message to extension background.',
      actionRequired: isContextInvalid ? 'REFRESH_PAGE' : 'RETRY',
    });
  }
});

observer.start();
