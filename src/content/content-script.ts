import { LeetCodeObserver, SyncFeedback } from './leetcode-observer';
import { PlatformSubmission } from '../core/types/submission';

console.log('[LC-Sync] Content script initialized on LeetCode page.');

const observer = new LeetCodeObserver((submission: PlatformSubmission, onFeedback: (res: SyncFeedback) => void) => {
  console.log('[LC-Sync] Accepted submission ready for sync:', submission.problemTitle);

  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage(
      {
        action: 'SUBMISSION_ACCEPTED',
        submission,
      },
      (response: SyncFeedback) => {
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
  }
});

observer.start();
