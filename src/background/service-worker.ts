import { storage } from '../core/storage/chrome-storage';
import { syncQueueManager } from '../core/sync/sync-queue-manager';
import { GitHubClient } from '../core/github/client';
import { PlatformSubmission } from '../core/types/submission';

console.log('[LC-Sync] Background service worker initialized.');

// Listen for messages from content scripts, popup, options, and dashboard
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handleAsync = async () => {
    try {
      switch (message.action) {
        case 'SUBMISSION_DETECTED': {
          const submission: PlatformSubmission = message.submission;
          await storage.setActiveDraft({
            ...submission,
            approachName: 'solution',
            confidenceRating: 3,
          });

          // Set badge to indicate submission ready for review
          chrome.action.setBadgeText({ text: '1' });
          chrome.action.setBadgeBackgroundColor({ color: '#238636' });

          const settings = await storage.getSettings();
          if (settings.preferences.autoOpenReview) {
            // Auto open review tab or dashboard
            chrome.tabs.create({
              url: chrome.runtime.getURL('dashboard.html#/review'),
            });
          }

          return { success: true };
        }

        case 'TEST_GITHUB_CONNECTION': {
          const client = new GitHubClient(message.settings);
          const result = await client.testConnection();
          return result;
        }

        case 'ENQUEUE_SUBMISSION': {
          const queueItem = await syncQueueManager.enqueue(message.submission, {
            approachName: message.approachName,
            notes: message.notes,
            confidence: message.confidence,
            tags: message.tags,
            patterns: message.patterns,
            timeComplexity: message.timeComplexity,
            spaceComplexity: message.spaceComplexity,
          });

          // Clear badge & active draft
          chrome.action.setBadgeText({ text: '' });
          await storage.setActiveDraft(null);

          // Trigger processing immediately in background
          const settings = await storage.getSettings();
          if (settings.github.token && settings.github.owner && settings.github.repo) {
            const client = new GitHubClient(settings.github);
            syncQueueManager.processQueue(client).catch(console.error);
          }

          return { success: true, queueItem };
        }

        case 'PROCESS_QUEUE': {
          const settings = await storage.getSettings();
          const client = new GitHubClient(settings.github);
          await syncQueueManager.processQueue(client);
          return { success: true };
        }

        case 'RETRY_QUEUE_ITEM': {
          const settings = await storage.getSettings();
          const client = new GitHubClient(settings.github);
          await syncQueueManager.retryItem(message.id, client);
          return { success: true };
        }

        case 'OPEN_DASHBOARD': {
          chrome.tabs.create({
            url: chrome.runtime.getURL(message.path ? `dashboard.html#${message.path}` : 'dashboard.html'),
          });
          return { success: true };
        }

        default:
          return { error: `Unknown action: ${message.action}` };
      }
    } catch (err: any) {
      console.error('[LC-Sync Worker Error]', err);
      return { success: false, error: err.message || 'Operation failed' };
    }
  };

  handleAsync().then(sendResponse);
  return true; // Keep message channel open for async response
});
