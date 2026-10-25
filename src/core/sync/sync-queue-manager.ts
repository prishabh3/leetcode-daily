import { SyncQueueItem, SyncStatus } from '../types/sync-queue';
import { PlatformSubmission } from '../types/submission';
import { StructuredNotes } from '../types/problem';
import { storage } from '../storage/chrome-storage';
import { GitHubClient } from '../github/client';
import { executeSyncItem } from './sync-engine';
import { checkSubmissionDuplicate } from './deduplication';

export class SyncQueueManager {
  private isProcessing = false;

  /**
   * Enqueues a new submission for synchronization
   */
  async enqueue(
    submission: PlatformSubmission,
    options: {
      approachName?: string;
      notes?: Partial<StructuredNotes>;
      confidence?: number;
      tags?: string[];
      patterns?: string[];
      timeComplexity?: string;
      spaceComplexity?: string;
    } = {}
  ): Promise<SyncQueueItem> {
    const queue = await storage.getSyncQueue();
    const syncIndex = await storage.getSyncIndex();

    const approachName = options.approachName || 'solution';

    // Check duplicate ahead of time
    const dupCheck = await checkSubmissionDuplicate(submission, approachName, syncIndex);
    let initialStatus: SyncStatus = 'Pending';
    let error: string | undefined;

    if (dupCheck.isDuplicate) {
      initialStatus = 'Synced';
      error = `Duplicate detected: already synced at ${dupCheck.existingFilePath}`;
    }

    const newItem: SyncQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      submission,
      approachName,
      notes: options.notes,
      confidence: options.confidence ?? 3,
      tags: options.tags || [],
      patterns: options.patterns || [],
      timeComplexity: options.timeComplexity,
      spaceComplexity: options.spaceComplexity,
      status: initialStatus,
      attemptCount: 0,
      maxAttempts: 3,
      error,
      createdAt: new Date().toISOString(),
    };

    queue.unshift(newItem);
    // Keep max 50 recent items in queue
    if (queue.length > 50) queue.length = 50;

    await storage.saveSyncQueue(queue);
    return newItem;
  }

  /**
   * Processes all pending items in the queue
   */
  async processQueue(client?: GitHubClient): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const activeClient = client || new GitHubClient((await storage.getSettings()).github);
      const settings = activeClient.rawSettings;
      if (!settings.token || !settings.owner || !settings.repo) {
        // Can't process without credentials
        return;
      }

      const queue = await storage.getSyncQueue();

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        if (item.status !== 'Pending' && item.status !== 'Failed') {
          continue;
        }

        // Mark as Syncing
        item.status = 'Syncing';
        item.lastAttempt = new Date().toISOString();
        item.attemptCount += 1;
        await storage.saveSyncQueue(queue);

        try {
          const result = await executeSyncItem(item, activeClient);

          if (result.success) {
            item.status = 'Synced';
            item.commitSha = result.commitSha;
            item.error = result.isDuplicate ? result.error : undefined;
          } else {
            item.status = item.attemptCount >= item.maxAttempts ? 'Needs Attention' : 'Failed';
            item.error = result.error || 'Unknown sync error';
          }
        } catch (err: any) {
          item.error = err.message || 'Execution error';
          item.status = item.attemptCount >= item.maxAttempts ? 'Needs Attention' : 'Failed';
        }

        await storage.saveSyncQueue(queue);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Retries an item in the queue by id
   */
  async retryItem(id: string, client?: GitHubClient): Promise<void> {
    const queue = await storage.getSyncQueue();
    const item = queue.find((q) => q.id === id);
    if (item) {
      item.status = 'Pending';
      item.error = undefined;
      await storage.saveSyncQueue(queue);
      await this.processQueue(client);
    }
  }

  /**
   * Removes an item from the queue
   */
  async removeItem(id: string): Promise<void> {
    const queue = await storage.getSyncQueue();
    const filtered = queue.filter((q) => q.id !== id);
    await storage.saveSyncQueue(filtered);
  }
}

export const syncQueueManager = new SyncQueueManager();
