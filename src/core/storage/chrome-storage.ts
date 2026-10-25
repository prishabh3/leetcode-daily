import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';
import { SyncIndex } from '../types/sync-index';
import { SyncQueueItem } from '../types/sync-queue';
import { SubmissionDraft } from '../types/submission';
import { ProblemMetadata } from '../types/problem';
import { HistoricalImportCheckpoint } from '../types/historical-import';
import { migrateSyncIndex } from './schema-migration';

export interface StorageSchema {
  settings: AppSettings;
  sync_index: SyncIndex;
  sync_queue: SyncQueueItem[];
  active_draft: SubmissionDraft | null;
  problems_cache: Record<string, ProblemMetadata>;
  historical_checkpoint: HistoricalImportCheckpoint | null;
}

class StorageManager {
  private fallbackMemory = new Map<string, any>();

  private isChromeStorageAvailable(): boolean {
    return (
      typeof chrome !== 'undefined' &&
      typeof chrome.storage !== 'undefined' &&
      typeof chrome.storage.local !== 'undefined'
    );
  }

  async get<K extends keyof StorageSchema>(key: K): Promise<StorageSchema[K] | null> {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          resolve((result[key] as StorageSchema[K]) ?? null);
        });
      });
    }
    return (this.fallbackMemory.get(key) as StorageSchema[K]) ?? null;
  }

  async set<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]): Promise<void> {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => resolve());
      });
    }
    this.fallbackMemory.set(key, JSON.parse(JSON.stringify(value)));
  }

  async remove<K extends keyof StorageSchema>(key: K): Promise<void> {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.remove([key], () => resolve());
      });
    }
    this.fallbackMemory.delete(key);
  }

  async clear(): Promise<void> {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.clear(() => resolve());
      });
    }
    this.fallbackMemory.clear();
  }

  // --- Convenience Getters & Setters ---

  async getSettings(): Promise<AppSettings> {
    const s = await this.get('settings');
    if (!s) return { ...DEFAULT_SETTINGS };

    // Migrate or map preferences cleanly
    const savedPrefs = s.preferences || {};
    const autoSyncOnAccepted =
      savedPrefs.autoSyncOnAccepted !== undefined
        ? savedPrefs.autoSyncOnAccepted
        : true; // Enabled by default for automatic workflow

    const reviewBeforeSync =
      savedPrefs.reviewBeforeSync !== undefined
        ? savedPrefs.reviewBeforeSync
        : false; // Disabled by default for automatic workflow

    return {
      ...DEFAULT_SETTINGS,
      ...s,
      github: { ...DEFAULT_SETTINGS.github, ...s.github },
      preferences: {
        ...DEFAULT_SETTINGS.preferences,
        ...savedPrefs,
        autoSyncOnAccepted,
        reviewBeforeSync,
      },
      lastSyncInfo: s.lastSyncInfo,
    };
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.set('settings', settings);
  }

  async updateLastSyncInfo(info: AppSettings['lastSyncInfo']): Promise<void> {
    const settings = await this.getSettings();
    settings.lastSyncInfo = info;
    await this.saveSettings(settings);
  }

  async getSyncIndex(): Promise<SyncIndex> {
    const raw = await this.get('sync_index');
    return migrateSyncIndex(raw);
  }

  async saveSyncIndex(index: SyncIndex): Promise<void> {
    await this.set('sync_index', index);
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const queue = await this.get('sync_queue');
    return Array.isArray(queue) ? queue : [];
  }

  async saveSyncQueue(queue: SyncQueueItem[]): Promise<void> {
    await this.set('sync_queue', queue);
  }

  async getActiveDraft(): Promise<SubmissionDraft | null> {
    return this.get('active_draft');
  }

  async setActiveDraft(draft: SubmissionDraft | null): Promise<void> {
    await this.set('active_draft', draft);
  }

  async getProblemMetadata(problemIdOrSlug: string): Promise<ProblemMetadata | null> {
    const cache = (await this.get('problems_cache')) || {};
    return cache[problemIdOrSlug] || null;
  }

  async saveProblemMetadata(meta: ProblemMetadata): Promise<void> {
    const cache = (await this.get('problems_cache')) || {};
    cache[meta.id] = meta;
    cache[meta.slug] = meta;
    await this.set('problems_cache', cache);
  }

  async getHistoricalCheckpoint(): Promise<HistoricalImportCheckpoint | null> {
    return this.get('historical_checkpoint');
  }

  async saveHistoricalCheckpoint(checkpoint: HistoricalImportCheckpoint | null): Promise<void> {
    if (checkpoint === null) {
      await this.remove('historical_checkpoint');
    } else {
      await this.set('historical_checkpoint', checkpoint);
    }
  }

  async clearHistoricalCheckpoint(): Promise<void> {
    await this.remove('historical_checkpoint');
  }
}

export const storage = new StorageManager();
