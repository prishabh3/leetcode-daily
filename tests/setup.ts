// Vitest setup file: Chrome Extension API mocks & polyfills
import { vi, beforeEach } from 'vitest';

const memoryStorage = new Map<string, any>();

export const mockChromeStorageLocal = {
  get: vi.fn((keys: string | string[] | Record<string, any> | null, callback?: (items: { [key: string]: any }) => void) => {
    let result: Record<string, any> = {};
    if (typeof keys === 'string') {
      result[keys] = memoryStorage.get(keys);
    } else if (Array.isArray(keys)) {
      keys.forEach((k) => {
        result[k] = memoryStorage.get(k);
      });
    } else if (keys === null || keys === undefined) {
      memoryStorage.forEach((v, k) => {
        result[k] = v;
      });
    } else if (typeof keys === 'object') {
      for (const k of Object.keys(keys)) {
        result[k] = memoryStorage.has(k) ? memoryStorage.get(k) : keys[k];
      }
    }

    if (callback) {
      callback(result);
    }
    return Promise.resolve(result);
  }),

  set: vi.fn((items: Record<string, any>, callback?: () => void) => {
    for (const [key, value] of Object.entries(items)) {
      memoryStorage.set(key, JSON.parse(JSON.stringify(value)));
    }
    if (callback) callback();
    return Promise.resolve();
  }),

  remove: vi.fn((keys: string | string[], callback?: () => void) => {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    keyArray.forEach((k) => memoryStorage.delete(k));
    if (callback) callback();
    return Promise.resolve();
  }),

  clear: vi.fn((callback?: () => void) => {
    memoryStorage.clear();
    if (callback) callback();
    return Promise.resolve();
  }),
};

// Global chrome object mock
(globalThis as any).chrome = {
  storage: {
    local: mockChromeStorageLocal,
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
    create: vi.fn(),
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
  },
};

beforeEach(() => {
  memoryStorage.clear();
  vi.clearAllMocks();
});
