import React, { useState, useEffect } from 'react';
import { storage } from '../../core/storage/chrome-storage';
import { AppSettings, DEFAULT_SETTINGS } from '../../core/types/settings';
import { GitHubClient, RepoTestResult } from '../../core/github/client';
import { getSolutionFilePath } from '../../core/sync/path-sanitizer';

export const OptionsApp: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showToken, setShowToken] = useState(false);
  const [testResult, setTestResult] = useState<RepoTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    storage.getSettings().then(setSettings);
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await storage.saveSettings(settings);
    setSaveStatus('Settings saved successfully.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const client = new GitHubClient(settings.github);
      const res = await client.testConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = async () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    await storage.clear();
    setSettings(DEFAULT_SETTINGS);
    setResetConfirm(false);
    setSaveStatus('All local settings and cache have been reset.');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const samplePath = getSolutionFilePath(
    '1',
    'two-sum',
    'cpp',
    'solution',
    settings.github.defaultPathPrefix
  );

  return (
    <div style={{ maxWidth: '780px', margin: '40px auto', padding: '0 20px' }}>
      {/* Title */}
      <div style={{ marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          ⚡ LC-Sync Settings & GitHub Integration
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
          Configure your personal GitHub repository for automated DSA solution synchronization and progress tracking.
        </p>
      </div>

      {saveStatus && (
        <div
          style={{
            padding: '10px 14px',
            marginBottom: '20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(35, 134, 54, 0.15)',
            border: '1px solid var(--accent-green)',
            color: '#3fb950',
          }}
        >
          ✓ {saveStatus}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* GitHub Authentication Card */}
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            1. GitHub Authentication
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            LC-Sync connects directly to GitHub from your browser. We recommend using a{' '}
            <strong style={{ color: 'var(--text-primary)' }}>Fine-Grained Personal Access Token (PAT)</strong> scoped
            exclusively to your solutions repository with <code style={{ color: 'var(--accent-blue)' }}>Contents: Read and write</code> permissions.
            Your token is stored safely only in your browser’s local storage and is never transmitted to any third party.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500 }}>GitHub Personal Access Token (PAT)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type={showToken ? 'text' : 'password'}
                placeholder="github_pat_... or ghp_..."
                value={settings.github.token}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    github: { ...settings.github, token: e.target.value },
                  })
                }
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                style={{ width: '80px', flexShrink: 0 }}
              >
                {showToken ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>

        {/* Repository Configuration Card */}
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            2. Destination Repository
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Specify the repository where your LeetCode solutions, notes, and dashboards will be stored.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                GitHub Username / Owner
              </label>
              <input
                type="text"
                placeholder="e.g. octocat"
                value={settings.github.owner}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    github: { ...settings.github, owner: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                Repository Name
              </label>
              <input
                type="text"
                placeholder="e.g. leetcode-daily"
                value={settings.github.repo}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    github: { ...settings.github, repo: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                Branch Name
              </label>
              <input
                type="text"
                placeholder="main"
                value={settings.github.branch}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    github: { ...settings.github, branch: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                Directory Prefix
              </label>
              <input
                type="text"
                placeholder="problems"
                value={settings.github.defaultPathPrefix}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    github: { ...settings.github, defaultPathPrefix: e.target.value },
                  })
                }
              />
            </div>
          </div>

          {/* Path Preview */}
          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            Target solution file path preview:{' '}
            <code style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
              {samplePath}
            </code>
          </div>

          {/* Last Synchronization Status */}
          {settings.lastSyncInfo && (
            <div
              style={{
                marginTop: '16px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor:
                  settings.lastSyncInfo.status === 'synced'
                    ? 'rgba(35, 134, 54, 0.1)'
                    : settings.lastSyncInfo.status === 'duplicate'
                    ? 'rgba(88, 166, 255, 0.1)'
                    : 'rgba(218, 54, 51, 0.1)',
                border: '1px solid',
                borderColor:
                  settings.lastSyncInfo.status === 'synced'
                    ? 'var(--accent-green)'
                    : settings.lastSyncInfo.status === 'duplicate'
                    ? 'var(--accent-blue)'
                    : 'var(--accent-red)',
                fontSize: '12px',
              }}
            >
              <strong>Last Synchronization:</strong>{' '}
              {settings.lastSyncInfo.status === 'synced' && (
                <span style={{ color: 'var(--accent-green)' }}>
                  ✓ Successfully synced {settings.lastSyncInfo.problemTitle || 'solution'} (commit:{' '}
                  <code>{settings.lastSyncInfo.commitSha?.slice(0, 7) || 'latest'}</code>) at{' '}
                  {new Date(settings.lastSyncInfo.timestamp).toLocaleString()}
                </span>
              )}
              {settings.lastSyncInfo.status === 'duplicate' && (
                <span style={{ color: 'var(--accent-blue)' }}>
                  ℹ️ Duplicate detected: {settings.lastSyncInfo.problemTitle || 'solution'} was already
                  up to date at {new Date(settings.lastSyncInfo.timestamp).toLocaleString()}
                </span>
              )}
              {settings.lastSyncInfo.status === 'failed' && (
                <span style={{ color: 'var(--accent-red)' }}>
                  ✗ Failed: {settings.lastSyncInfo.error || 'Unknown error'} at{' '}
                  {new Date(settings.lastSyncInfo.timestamp).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Test Connection Button & Result */}
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !settings.github.token || !settings.github.owner || !settings.github.repo}
            >
              {isTesting ? 'Testing Connectivity...' : '🔌 Test Connection & Access'}
            </button>

            {testResult && (
              <span
                style={{
                  fontSize: '13px',
                  color: testResult.success ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontWeight: 500,
                }}
              >
                {testResult.success ? '✓' : '✗'} {testResult.message}
              </span>
            )}
          </div>
        </div>

        {/* Git Author & Sync Preferences */}
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            3. Git Commit Details & Automation Preferences
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                Git Author Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={settings.github.authorName || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    github: { ...settings.github, authorName: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                Git Author Email (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. john@example.com"
                value={settings.github.authorEmail || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    github: { ...settings.github, authorEmail: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              LeetCode Username (For README Profile Link)
            </label>
            <input
              type="text"
              placeholder="e.g. tourist"
              value={settings.leetcodeProfileUsername || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  leetcodeProfileUsername: e.target.value,
                })
              }
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.preferences.generateReadme}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, generateReadme: e.target.checked },
                  })
                }
                style={{ width: 'auto' }}
              />
              Automatically generate and update destination README.md with problem table
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.preferences.generateProgressSvg}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, generateProgressSvg: e.target.checked },
                  })
                }
                style={{ width: 'auto' }}
              />
              Automatically render deterministic progress.svg graphic in repository
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.preferences.autoSyncOnAccepted}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, autoSyncOnAccepted: e.target.checked },
                  })
                }
                style={{ width: 'auto' }}
              />
              <span>
                <strong>Automatic sync on Accepted</strong> (Upload directly to GitHub in the background without prompts)
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.preferences.reviewBeforeSync}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, reviewBeforeSync: e.target.checked },
                  })
                }
                style={{ width: 'auto' }}
              />
              Review before syncing (Require manual review and confirmation before each commit)
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '12px' }}>
          <button type="submit" className="primary" style={{ padding: '8px 24px', fontSize: '14px' }}>
            Save Settings
          </button>
        </div>

        {/* Historical Submissions Import */}
        <div className="card" style={{ marginTop: '20px', borderColor: 'var(--accent-blue)', backgroundColor: 'rgba(88, 166, 255, 0.05)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📥 Import Historical LeetCode Submissions
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Backfill your previous solutions and attempts from your LeetCode account into your GitHub repository with atomic batch commits.
          </p>
          <button
            type="button"
            className="primary"
            onClick={() => {
              const url = typeof chrome !== 'undefined' && chrome.runtime?.getURL
                ? chrome.runtime.getURL('dashboard.html#/historical-import')
                : 'dashboard.html#/historical-import';
              window.open(url, '_blank');
            }}
            style={{ padding: '7px 18px', fontSize: '13px' }}
          >
            Launch Historical Import Wizard →
          </button>
        </div>

        {/* Danger Zone */}
        <div
          className="card"
          style={{
            borderColor: 'rgba(218, 54, 51, 0.4)',
            backgroundColor: 'rgba(218, 54, 51, 0.05)',
            marginTop: '20px',
          }}
        >
          <h3 style={{ fontSize: '15px', color: '#f85149', fontWeight: 600, marginBottom: '6px' }}>
            Danger Zone
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Reset local settings, stored token, queue, and cached index. This does not delete any files from your GitHub repository.
          </p>

          <button
            type="button"
            className="danger"
            onClick={handleReset}
          >
            {resetConfirm ? '⚠️ Are you sure? Click to permanently reset' : 'Reset All Local Data'}
          </button>
        </div>
      </form>
    </div>
  );
};
