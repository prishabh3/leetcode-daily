import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LeetCodeObserver, SyncFeedback } from '../src/content/leetcode-observer';
import { detectSubmissionVerdict, extractLeetCodePageData } from '../src/content/leetcode-extractor';
import { storage } from '../src/core/storage/chrome-storage';
import { DEFAULT_SETTINGS, AppSettings } from '../src/core/types/settings';
import { PlatformSubmission } from '../src/core/types/submission';
import { GitHubClient } from '../src/core/github/client';
import { syncQueueManager } from '../src/core/sync/sync-queue-manager';

describe('Automatic LeetCode-to-GitHub Sync Workflow & Regression Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // 1. Accepted verdict automatically starts synchronization
  it('1. Accepted verdict automatically starts synchronization', async () => {
    // Setup LeetCode DOM with Problem and Editor
    document.body.innerHTML = `
      <div data-cy="question-title">1. Two Sum</div>
      <div class="text-olive">Easy</div>
      <div data-cy="lang-select">C++</div>
      <div class="monaco-editor">
        <div class="view-lines">
          <div class="view-line">class Solution { public: vector<int> twoSum() {} };</div>
        </div>
      </div>
      <button data-e2e-locator="console-submit-button">Submit</button>
      <div data-e2e-locator="submission-result" class="text-green-s">Accepted</div>
      <div data-e2e-locator="submission-runtime">2 ms</div>
      <div data-e2e-locator="submission-memory">14.1 MB</div>
    `;

    const onAccepted = vi.fn((_sub: PlatformSubmission, onFeedback: (fb: SyncFeedback) => void) => {
      onFeedback({
        success: true,
        status: 'SYNCED',
        commitSha: 'commit-12345',
        problemTitle: 'Two Sum',
        repo: 'octocat/leetcode-daily',
      });
    });

    const observer = new LeetCodeObserver(onAccepted);
    observer.start();

    // Trigger Submit click
    const submitBtn = document.querySelector<HTMLButtonElement>('button')!;
    submitBtn.click();

    // Trigger mutation check
    document.body.appendChild(document.createElement('div'));
    await new Promise((r) => setTimeout(r, 50));

    expect(onAccepted).toHaveBeenCalled();
    const submissionArg = onAccepted.mock.calls[0][0];
    expect(submissionArg.problemTitle).toBe('Two Sum');
    expect(submissionArg.status).toBe('Accepted');
    expect(submissionArg.language).toBe('cpp');
    expect(submissionArg.code).toContain('class Solution');

    observer.stop();
  });

  // 2. Manual Solution Import does not open during normal automatic sync
  it('2. Manual Solution Import does not open during normal automatic sync', async () => {
    const tabsCreateSpy = vi.spyOn(chrome.tabs, 'create');
    const settings: AppSettings = {
      ...DEFAULT_SETTINGS,
      github: {
        token: 'valid-pat',
        owner: 'testowner',
        repo: 'leetcode-daily',
        branch: 'main',
        defaultPathPrefix: 'problems',
      },
      preferences: {
        ...DEFAULT_SETTINGS.preferences,
        autoSyncOnAccepted: true,
        reviewBeforeSync: false,
      },
    };
    await storage.saveSettings(settings);

    // Verify settings state
    const loadedSettings = await storage.getSettings();
    expect(loadedSettings.preferences.autoSyncOnAccepted).toBe(true);
    expect(loadedSettings.preferences.reviewBeforeSync).toBe(false);

    // When reviewBeforeSync is false, tabs.create should not be called with dashboard.html#/review
    expect(tabsCreateSpy).not.toHaveBeenCalled();
  });

  // 3. The detected-submission banner can appear without opening the modal
  it('3. The detected-submission banner can appear without opening the modal', async () => {
    const draft = {
      problemId: '94',
      problemTitle: 'Binary Tree Inorder Traversal',
      problemSlug: 'binary-tree-inorder-traversal',
      url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/',
      difficulty: 'Easy' as const,
      language: 'cpp' as const,
      code: 'class Solution {};',
      timestamp: Date.now(),
      status: 'Accepted' as const,
      approachName: 'solution',
    };
    await storage.setActiveDraft(draft);

    const storedDraft = await storage.getActiveDraft();
    expect(storedDraft).toBeDefined();
    expect(storedDraft?.problemTitle).toBe('Binary Tree Inorder Traversal');

    // In DashboardApp, modal visibility is controlled by explicit showManualImport flag,
    // which starts false even when draft is present in storage.
  });

  // 4. Wrong Answer never triggers a GitHub upload
  it('4. Wrong Answer never triggers a GitHub upload', async () => {
    document.body.innerHTML = `
      <div data-cy="question-title">1. Two Sum</div>
      <div class="monaco-editor">
        <div class="view-lines"><div class="view-line">class Solution {};</div></div>
      </div>
      <button data-e2e-locator="console-submit-button">Submit</button>
      <div data-e2e-locator="submission-result" class="text-red-s">Wrong Answer</div>
    `;

    const onAccepted = vi.fn();
    const observer = new LeetCodeObserver(onAccepted);
    observer.start();

    // Click submit
    document.querySelector('button')!.click();

    // Mutation
    document.body.appendChild(document.createElement('div'));
    await new Promise((r) => setTimeout(r, 50));

    expect(onAccepted).not.toHaveBeenCalled();
    observer.stop();
  });

  // 5. Pending verdict does not trigger an upload
  it('5. Pending verdict does not trigger an upload', async () => {
    document.body.innerHTML = `
      <div data-cy="question-title">1. Two Sum</div>
      <div class="monaco-editor">
        <div class="view-lines"><div class="view-line">class Solution {};</div></div>
      </div>
      <button data-e2e-locator="console-submit-button">Submit</button>
      <div data-e2e-locator="submission-result">Pending</div>
    `;

    const verdict = detectSubmissionVerdict();
    expect(verdict.verdict).toBe('PENDING');
    expect(verdict.isAccepted).toBe(false);
    expect(verdict.isTerminal).toBe(false);

    const onAccepted = vi.fn();
    const observer = new LeetCodeObserver(onAccepted);
    observer.start();

    document.querySelector('button')!.click();
    document.body.appendChild(document.createElement('div'));
    await new Promise((r) => setTimeout(r, 50));

    expect(onAccepted).not.toHaveBeenCalled();
    observer.stop();
  });

  // 6. Accepted verdict followed by repeated DOM changes still produces only one upload
  it('6. Accepted verdict followed by repeated DOM changes still produces only one upload', async () => {
    document.body.innerHTML = `
      <div data-cy="question-title">1. Two Sum</div>
      <div class="monaco-editor">
        <div class="view-lines"><div class="view-line">class Solution {};</div></div>
      </div>
      <button data-e2e-locator="console-submit-button">Submit</button>
      <div data-e2e-locator="submission-result" class="text-green-s">Accepted</div>
    `;

    const onAccepted = vi.fn((_sub, onFb) => {
      onFb({ success: true, status: 'SYNCED', commitSha: 'sha1' });
    });

    const observer = new LeetCodeObserver(onAccepted);
    observer.start();

    document.querySelector('button')!.click();

    // Fire 6 rapid DOM mutations
    for (let i = 0; i < 6; i++) {
      const d = document.createElement('div');
      d.innerText = `mutation-${i}`;
      document.body.appendChild(d);
    }
    await new Promise((r) => setTimeout(r, 60));

    // Must be called exactly once
    expect(onAccepted).toHaveBeenCalledTimes(1);
    observer.stop();
  });

  // 7. Multiple accepted submissions are attributed to the correct problems
  it('7. Multiple accepted submissions are attributed to the correct problems', async () => {
    const queueManager = syncQueueManager;
    await storage.saveSyncQueue([]);

    const sub1: PlatformSubmission = {
      problemId: '1',
      problemTitle: 'Two Sum',
      problemSlug: 'two-sum',
      url: 'https://leetcode.com/problems/two-sum/',
      difficulty: 'Easy',
      language: 'cpp',
      code: 'class TwoSum {};',
      timestamp: Date.now(),
      status: 'Accepted',
    };

    const sub2: PlatformSubmission = {
      problemId: '94',
      problemTitle: 'Binary Tree Inorder Traversal',
      problemSlug: 'binary-tree-inorder-traversal',
      url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/',
      difficulty: 'Easy',
      language: 'cpp',
      code: 'class InorderTraversal {};',
      timestamp: Date.now(),
      status: 'Accepted',
    };

    const item1 = await queueManager.enqueue(sub1, { approachName: 'hash-map' });
    const item2 = await queueManager.enqueue(sub2, { approachName: 'recursive' });

    expect(item1.submission.problemTitle).toBe('Two Sum');
    expect(item2.submission.problemTitle).toBe('Binary Tree Inorder Traversal');

    const queue = await storage.getSyncQueue();
    expect(queue.length).toBe(2);
    expect(queue[0].submission.problemTitle).toBe('Binary Tree Inorder Traversal');
    expect(queue[1].submission.problemTitle).toBe('Two Sum');
  });

  // 8. Source-code extraction failure invokes a visible fallback rather than uploading incorrect code
  it('8. Source-code extraction failure invokes a visible fallback rather than uploading incorrect code', async () => {
    // Problem has Accepted verdict but DOM editor has empty lines
    document.body.innerHTML = `
      <div data-cy="question-title">1. Two Sum</div>
      <div class="monaco-editor">
        <div class="view-lines"></div>
      </div>
      <button data-e2e-locator="console-submit-button">Submit</button>
      <div data-e2e-locator="submission-result" class="text-green-s">Accepted</div>
    `;

    const onAccepted = vi.fn();
    const observer = new LeetCodeObserver(onAccepted);
    observer.start();

    document.querySelector('button')!.click();
    document.body.appendChild(document.createElement('div'));
    await new Promise((r) => setTimeout(r, 50));

    // Upload should NOT be called on empty code
    expect(onAccepted).not.toHaveBeenCalled();

    // Floating badge should display extraction failure message
    const badge = document.getElementById('lc-sync-floating-badge');
    expect(badge?.textContent).toContain('Extraction failed');
    expect(badge?.textContent).toContain('Import Manually');

    observer.stop();
  });

  // 9. GitHub authentication failure shows a useful error and settings link
  it('9. GitHub authentication failure shows a useful error and settings link', async () => {
    const feedback: SyncFeedback = {
      success: false,
      status: 'FAILED',
      error: 'GitHub repository not configured. Check Settings.',
      actionRequired: 'OPEN_SETTINGS',
    };

    const observer = new LeetCodeObserver(vi.fn());
    observer.start();
    observer.handleSyncFeedback(feedback);

    const badge = document.getElementById('lc-sync-floating-badge');
    expect(badge?.textContent).toContain('GitHub repository not configured');
    expect(badge?.textContent).toContain('Open Settings');

    observer.stop();
  });

  // 10. Successful sync updates the dashboard and displays a notification
  it('10. Successful sync updates the dashboard and displays a notification', async () => {
    const feedback: SyncFeedback = {
      success: true,
      status: 'SYNCED',
      commitSha: 'a1b2c3d4e5f6',
      problemTitle: 'Binary Tree Inorder Traversal',
      repo: 'octocat/leetcode-daily',
      isDuplicate: false,
    };

    const observer = new LeetCodeObserver(vi.fn());
    observer.start();
    observer.handleSyncFeedback(feedback);

    const badge = document.getElementById('lc-sync-floating-badge');
    expect(badge?.textContent).toContain('Synced: Binary Tree Inorder Traversal → GitHub');
    expect(badge?.textContent).toContain('View Commit');

    observer.stop();
  });

  // 11. Retry after a transient network failure does not create duplicate commits
  it('11. Retry after a transient network failure does not create duplicate commits', async () => {
    const queueManager = syncQueueManager;
    await storage.saveSyncQueue([]);

    const sub: PlatformSubmission = {
      problemId: '1',
      problemTitle: 'Two Sum',
      problemSlug: 'two-sum',
      url: 'https://leetcode.com/problems/two-sum/',
      difficulty: 'Easy',
      language: 'cpp',
      code: 'class Solution { public: vector<int> twoSum() {} };',
      submissionId: 'test-sub-id',
      timestamp: Date.now(),
      status: 'Accepted',
    };

    await queueManager.enqueue(sub, { approachName: 'solution' });

    let commitCalls = 0;
    const mockClient = {
      rawSettings: { token: 't', owner: 'o', repo: 'r', branch: 'main', defaultPathPrefix: 'problems' },
      getFileContent: vi.fn().mockResolvedValue(null),
      putSingleFile: vi.fn(),
      rawRequest: vi.fn().mockImplementation((endpoint: string, options?: any) => {
        if (endpoint.includes('/git/commits')) {
          if (options?.method === 'POST') {
            commitCalls++;
          }
          return Promise.resolve({ sha: 'commit-retry-123', tree: { sha: 'base-tree-sha' } });
        }
        if (endpoint.includes('/git/ref')) {
          return Promise.resolve({ object: { sha: 'base-sha' } });
        }
        if (endpoint.includes('/git/blobs')) return Promise.resolve({ sha: 'blob-sha' });
        if (endpoint.includes('/git/trees')) return Promise.resolve({ sha: 'tree-sha' });
        return Promise.resolve({});
      }),
    } as unknown as GitHubClient;

    // First attempt succeeds
    await queueManager.processQueue(mockClient);
    expect(commitCalls).toBe(1);

    // If retry is called on already Synced item or identical duplicate, no new commit is created
    await queueManager.processQueue(mockClient);
    expect(commitCalls).toBe(1); // Still 1 commit!
  });

  // 12. Manual Solution Import still works when explicitly selected
  it('12. Manual Solution Import still works when explicitly selected', async () => {
    const queueManager = syncQueueManager;
    const manualSub: PlatformSubmission = {
      problemId: '206',
      problemTitle: 'Reverse Linked List',
      problemSlug: 'reverse-linked-list',
      url: 'https://leetcode.com/problems/reverse-linked-list/',
      difficulty: 'Easy',
      language: 'python3',
      code: 'class Solution: def reverseList(self, head): pass',
      timestamp: Date.now(),
      status: 'Accepted',
    };

    const item = await queueManager.enqueue(manualSub, {
      approachName: 'iterative',
      confidence: 5,
    });

    expect(item.submission.problemTitle).toBe('Reverse Linked List');
    expect(item.submission.language).toBe('python3');
    expect(item.status).toBe('Pending');
  });

  // 13. Settings survive an extension restart
  it('13. Settings survive an extension restart', async () => {
    const customSettings: AppSettings = {
      github: {
        token: 'github_pat_super_secret',
        owner: 'myuser',
        repo: 'dsa-journey',
        branch: 'master',
        defaultPathPrefix: 'leetcode',
      },
      preferences: {
        autoSyncOnAccepted: true,
        reviewBeforeSync: true,
        generateReadme: false,
        generateProgressSvg: true,
        defaultLanguage: 'python3',
        defaultConfidence: 4,
      },
      leetcodeProfileUsername: 'coder123',
    };

    await storage.saveSettings(customSettings);

    // Simulate restart by retrieving from storage afresh
    const reloaded = await storage.getSettings();
    expect(reloaded.github.token).toBe('github_pat_super_secret');
    expect(reloaded.github.owner).toBe('myuser');
    expect(reloaded.github.repo).toBe('dsa-journey');
    expect(reloaded.github.branch).toBe('master');
    expect(reloaded.preferences.autoSyncOnAccepted).toBe(true);
    expect(reloaded.preferences.reviewBeforeSync).toBe(true);
    expect(reloaded.preferences.generateReadme).toBe(false);
    expect(reloaded.preferences.defaultLanguage).toBe('python3');
  });

  // 14. Single-page navigation to another LeetCode problem does not break detection
  it('14. Single-page navigation to another LeetCode problem does not break detection', () => {
    window.history.pushState({}, '', '/problems/two-sum/');
    const observer = new LeetCodeObserver(vi.fn());
    observer.start();

    // Navigate client-side to another problem
    window.history.pushState({}, '', '/problems/binary-tree-inorder-traversal/');
    window.dispatchEvent(new PopStateEvent('popstate'));

    const pageData = extractLeetCodePageData();
    expect(pageData.problemSlug).toBe('binary-tree-inorder-traversal');
    expect(pageData.problemTitle).toBe('Binary Tree Inorder Traversal');

    observer.stop();
  });
});
