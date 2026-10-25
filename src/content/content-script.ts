import { LeetCodeObserver, SyncFeedback } from './leetcode-observer';
import { PlatformSubmission } from '../core/types/submission';

console.log('[LC-Sync] Content script initialized on LeetCode page.');

const observer = new LeetCodeObserver((submission: PlatformSubmission, onFeedback: (res: SyncFeedback) => void) => {
  console.log('[LC-Sync] Accepted submission ready for sync:', submission.problemTitle);

  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    try {
      chrome.runtime.sendMessage(
        {
          action: 'SUBMISSION_ACCEPTED',
          submission,
        },
        (response: SyncFeedback) => {
          if (chrome.runtime.lastError) {
            console.warn('[LC-Sync] chrome.runtime.lastError:', chrome.runtime.lastError.message);
            onFeedback({
              success: false,
              status: 'FAILED',
              error: chrome.runtime.lastError.message || 'Communication error with extension background.',
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
            });
          }
        }
      );
    } catch (err: any) {
      console.error('[LC-Sync] Failed to send SUBMISSION_ACCEPTED message:', err);
      onFeedback({
        success: false,
        status: 'FAILED',
        error: err?.message || 'Failed to dispatch sync message to extension background.',
      });
    }
  } else {
    onFeedback({
      success: false,
      status: 'FAILED',
      error: 'Chrome runtime messaging not available in this context.',
    });
  }
});

observer.start();
