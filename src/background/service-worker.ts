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
        case 'SUBMISSION_ACCEPTED':
        case 'SUBMISSION_DETECTED': {
          const submission: PlatformSubmission = message.submission;

          // Always persist as active draft for user visibility
          await storage.setActiveDraft({
            ...submission,
            approachName: 'solution',
            confidenceRating: 3,
          });

          const settings = await storage.getSettings();
          const autoSync = settings.preferences.autoSyncOnAccepted ?? true;
          const reviewBeforeSync = settings.preferences.reviewBeforeSync ?? false;

          // Automatic Workflow: Directly synchronize in the background
          if (autoSync && !reviewBeforeSync) {
            if (!settings.github.token || !settings.github.owner || !settings.github.repo) {
              await storage.updateLastSyncInfo({
                status: 'failed',
                timestamp: new Date().toISOString(),
                problemTitle: submission.problemTitle,
                error: 'GitHub repository not configured in LC-Sync Settings.',
              });

              return {
                success: false,
                status: 'FAILED',
                error: 'GitHub repository not configured. Check Settings.',
                actionRequired: 'OPEN_SETTINGS',
              };
            }

            // Enqueue submission
            const queueItem = await syncQueueManager.enqueue(submission, {
              approachName: 'solution',
              confidence: settings.preferences.defaultConfidence ?? 3,
            });

            // Process sync immediately
            const client = new GitHubClient(settings.github);
            await syncQueueManager.processQueue(client);

            // Fetch processed queue item
            const queue = await storage.getSyncQueue();
            const updated = queue.find((q) => q.id === queueItem.id);

            if (updated?.status === 'Synced') {
              const isDuplicate = Boolean(
                updated.error && updated.error.toLowerCase().includes('duplicate')
              );

              // Clear draft on successful sync
              await storage.setActiveDraft(null);

              // Record last sync info
              await storage.updateLastSyncInfo({
                status: isDuplicate ? 'duplicate' : 'synced',
                timestamp: new Date().toISOString(),
                problemTitle: submission.problemTitle,
                commitSha: updated.commitSha,
              });

              chrome.action.setBadgeText({ text: '✓' });
              chrome.action.setBadgeBackgroundColor({ color: '#238636' });
              setTimeout(() => chrome.action.setBadgeText({ text: '' }), 5000);

              return {
                success: true,
                status: 'SYNCED',
                commitSha: updated.commitSha,
                isDuplicate,
                problemTitle: submission.problemTitle,
                repo: `${settings.github.owner}/${settings.github.repo}`,
              };
            } else {
              const errMsg = updated?.error || 'GitHub sync failed';
              await storage.updateLastSyncInfo({
                status: 'failed',
                timestamp: new Date().toISOString(),
                problemTitle: submission.problemTitle,
                error: errMsg,
              });

              chrome.action.setBadgeText({ text: '!' });
              chrome.action.setBadgeBackgroundColor({ color: '#da3633' });

              return {
                success: false,
                status: 'FAILED',
                error: errMsg,
                actionRequired: 'RETRY',
              };
            }
          }

          // Optional Workflow: Review Before Syncing explicitly enabled by user
          chrome.action.setBadgeText({ text: '1' });
          chrome.action.setBadgeBackgroundColor({ color: '#238636' });

          if (reviewBeforeSync) {
            chrome.tabs.create({
              url: chrome.runtime.getURL('dashboard.html#/review'),
            });
          }

          return { success: true, status: 'QUEUED_FOR_REVIEW' };
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

        case 'OPEN_SETTINGS': {
          if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
          } else {
            chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
          }
          return { success: true };
        }

        case 'OPEN_DASHBOARD': {
          chrome.tabs.create({
            url: chrome.runtime.getURL(
              message.path ? `dashboard.html#${message.path}` : 'dashboard.html'
            ),
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
