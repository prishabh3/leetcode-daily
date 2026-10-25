import { LeetCodeObserver } from './leetcode-observer';
import { PlatformSubmission } from '../core/types/submission';

console.log('[LC-Sync] Content script loaded on LeetCode page.');

const observer = new LeetCodeObserver((submission: PlatformSubmission) => {
  console.log('[LC-Sync] Accepted submission detected:', submission.problemTitle);

  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage({
      action: 'SUBMISSION_DETECTED',
      submission,
    });
  }
});

observer.start();
