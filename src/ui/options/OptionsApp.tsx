import React, { useState, useEffect } from 'react';
import { storage } from '../../core/storage/chrome-storage';
import { AppSettings, DEFAULT_SETTINGS } from '../../core/types/settings';
import { GitHubClient, RepoTestResult } from '../../core/github/client';
import { getSolutionFilePath } from '../../core/sync/path-sanitizer';
import { extractLeetCodeUsername, verifyLeetCodeUsername } from '../../core/leetcode/profile-validator';
import { LeetCodeHistoricalAdapter } from '../../core/leetcode/historical-adapter';

export const OptionsApp: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showToken, setShowToken] = useState(false);
  const [testResult, setTestResult] = useState<RepoTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [lcVerification, setLcVerification] = useState<{
    checking: boolean;
    result?: string;
    isError?: boolean;
    stats?: any;
  }>({ checking: false });
  const [isDetectingSession, setIsDetectingSession] = useState(false);
  const [waitingForLogin, setWaitingForLogin] = useState(false);

  const loadSettingsAndCheckSession = async (silent: boolean = false) => {
    const s = await storage.getSettings();
    setSettings(s);
    if (!silent && !s.leetcodeProfileUsername) {
      checkLeetCodeSession(true);
    }
  };

  useEffect(() => {
    loadSettingsAndCheckSession();

    const onFocus = () => {
      // Auto-detect session when returning from LeetCode login tab
      checkLeetCodeSession(true);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const checkLeetCodeSession = async (silent: boolean = false) => {
    if (!silent) setIsDetectingSession(true);
    try {
      const site = settings.leetcodeSite || 'us';
      const baseUrl = site === 'cn' ? 'https://leetcode.cn' : 'https://leetcode.com';
      const adapter = new LeetCodeHistoricalAdapter(baseUrl);
      const identity = await adapter.checkAuthenticatedIdentity();

      if (identity.status === 'CONNECTED' && identity.username) {
        const clean = extractLeetCodeUsername(identity.username) || identity.username;
        const profileUrl = `https://${site === 'cn' ? 'leetcode.cn' : 'leetcode.com'}/u/${clean}/`;
        const updated: AppSettings = {
          ...settings,
          leetcodeProfileUsername: clean,
          leetcodeProfileUrl: profileUrl,
          leetcodeVerified: true,
          leetcodeSite: site,
          leetcodeAccountStats: identity.stats,
          leetcodeConnection: identity,
        };
        setSettings(updated);
        await storage.saveSettings(updated);
        setWaitingForLogin(false);
        if (!silent) {
          setLcVerification({
            checking: false,
            isError: false,
            result: `✓ Connected as @${clean}! ${identity.stats ? `(${identity.stats.totalSolved} solved)` : ''}`,
            stats: identity.stats,
          });
        }
      } else if (identity.status === 'EXPIRED') {
        if (!silent) {
          setLcVerification({
            checking: false,
            isError: true,
            result: 'Session expired or not logged in. Click "Connect LeetCode" to log in.',
          });
        }
      } else if (identity.status === 'ERROR') {
        if (!silent) {
          setLcVerification({
            checking: false,
            isError: true,
            result: `Connection error: ${identity.error}`,
          });
        }
      }
    } catch (err: any) {
      if (!silent) {
        setLcVerification({
          checking: false,
          isError: true,
          result: `Failed to detect session: ${err.message}`,
        });
      }
    } finally {
      if (!silent) setIsDetectingSession(false);
    }
  };

  const handleConnectLeetCode = () => {
    const site = settings.leetcodeSite || 'us';
    const loginUrl = site === 'cn' ? 'https://leetcode.cn/accounts/login/' : 'https://leetcode.com/accounts/login/';
    setWaitingForLogin(true);
    setLcVerification({
      checking: false,
      isError: false,
      result: 'Opening LeetCode in a new tab. Please sign in, then return here to complete connection.',
    });

    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: loginUrl });
    } else {
      window.open(loginUrl, '_blank');
    }
  };

  const handleDisconnectLeetCode = async () => {
    const updated: AppSettings = {
      ...settings,
      leetcodeVerified: false,
      leetcodeConnection: undefined,
      leetcodeAccountStats: undefined,
    };
    setSettings(updated);
    await storage.saveSettings(updated);
    setLcVerification({
      checking: false,
      isError: false,
      result: 'Disconnected LeetCode session.',
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanLcUsername = extractLeetCodeUsername(settings.leetcodeProfileUsername) || '';
    const site = settings.leetcodeSite || 'us';
    const profileUrl = cleanLcUsername ? `https://${site === 'cn' ? 'leetcode.cn' : 'leetcode.com'}/u/${cleanLcUsername}/` : '';
    const updatedSettings: AppSettings = {
      ...settings,
      leetcodeProfileUsername: cleanLcUsername,
      leetcodeProfileUrl: profileUrl,
      leetcodeSite: site,
      leetcodeVerified: cleanLcUsername ? settings.leetcodeVerified : false,
    };
    setSettings(updatedSettings);
    await storage.saveSettings(updatedSettings);
    setSaveStatus('Settings saved successfully.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleVerifyLeetCodeProfile = async () => {
    const raw = settings.leetcodeProfileUsername?.trim();
    if (!raw) {
      setLcVerification({
        checking: false,
        isError: true,
        result: 'Please enter a LeetCode username or profile URL first.',
      });
      return;
    }
    const clean = extractLeetCodeUsername(raw);
    if (!clean) {
      setLcVerification({
        checking: false,
        isError: true,
        result: 'Invalid username format. Must be 3–30 letters/numbers/hyphens/underscores.',
      });
      return;
    }

    setLcVerification({ checking: true });
    try {
      const site = settings.leetcodeSite || 'us';
      const res = await verifyLeetCodeUsername(clean, site);
      if (res.valid && res.username) {
        setLcVerification({
          checking: false,
          isError: false,
          result: `✓ Account verified: "${res.username}" exists on LeetCode! ${res.stats ? `(${res.stats.totalSolved} solved)` : ''}`,
          stats: res.stats,
        });
        const updated: AppSettings = {
          ...settings,
          leetcodeProfileUsername: res.username,
          leetcodeVerified: true,
          leetcodeAccountStats: res.stats,
          leetcodeProfileUrl: `https://${site === 'cn' ? 'leetcode.cn' : 'leetcode.com'}/u/${res.username}/`,
        };
        setSettings(updated);
        await storage.saveSettings(updated);
      } else {
        setLcVerification({
          checking: false,
          isError: true,
          result: `✗ ${res.error || 'User not found on LeetCode.'}`,
        });
        setSettings((prev) => ({ ...prev, leetcodeVerified: false }));
      }
    } catch (err: any) {
      setLcVerification({
        checking: false,
        isError: true,
        result: `✗ Verification error: ${err.message}`,
      });
    }
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
          <img src="icons/icon48.png" alt="LC-Sync" width="30" height="30" style={{ borderRadius: '6px' }} />
          <span>LC-Sync Settings & GitHub Integration</span>
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
        {/* 1. LeetCode Account Verification Card (Start) */}
        <div className="card" style={{ borderLeft: '4px solid #ffa116' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>1. LeetCode Account Verification</span>
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={settings.leetcodeSite || 'us'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    leetcodeSite: e.target.value as 'us' | 'cn',
                  })
                }
                style={{ fontSize: '12px', padding: '4px 8px' }}
              >
                <option value="us">LeetCode Global (leetcode.com)</option>
                <option value="cn">LeetCode CN (leetcode.cn)</option>
              </select>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Verify your LeetCode account at the start to link live statistics, submission heatmaps, and automatic problem synchronization.
          </p>

          {/* Active Connection Status Badge */}
          {settings.leetcodeVerified && settings.leetcodeProfileUsername ? (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(35, 134, 54, 0.1)',
                border: '1px solid var(--accent-green)',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '13px' }}>
                    ✓ Connected & Verified
                  </span>
                  <strong style={{ color: 'var(--accent-blue)', fontSize: '13px' }}>
                    @{settings.leetcodeProfileUsername}
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    ({settings.leetcodeSite === 'cn' ? 'leetcode.cn' : 'leetcode.com'})
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => checkLeetCodeSession(false)}
                    disabled={isDetectingSession}
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    {isDetectingSession ? 'Refreshing...' : '🔄 Refresh Stats'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectLeetCode}
                    style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: 'transparent', borderColor: 'var(--border-color)' }}
                  >
                    🔌 Disconnect
                  </button>
                </div>
              </div>

              {settings.leetcodeAccountStats ? (
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '4px' }}>
                  <strong>{settings.leetcodeAccountStats.totalSolved}</strong> total solved:
                  <span style={{ color: '#238636', marginLeft: '6px' }}>🟢 {settings.leetcodeAccountStats.easySolved} Easy</span>
                  <span style={{ color: '#d29922', marginLeft: '6px' }}>🟡 {settings.leetcodeAccountStats.mediumSolved} Medium</span>
                  <span style={{ color: '#da3633', marginLeft: '6px' }}>🔴 {settings.leetcodeAccountStats.hardSolved} Hard</span>
                  {settings.leetcodeAccountStats.ranking && (
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>
                      • Ranking: #{settings.leetcodeAccountStats.ranking}
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Session verified. Solved count will be refreshed on next sync.
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    Not Connected to LeetCode
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Sign in to your account to link live statistics without entering passwords.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleConnectLeetCode}
                    style={{ backgroundColor: 'var(--accent-blue)', color: '#fff', border: 'none', fontWeight: 600 }}
                  >
                    🔗 Connect LeetCode
                  </button>
                  <button
                    type="button"
                    onClick={() => checkLeetCodeSession(false)}
                    disabled={isDetectingSession}
                  >
                    {isDetectingSession ? 'Detecting...' : '⚡ Check Session'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Mismatch Warning */}
          {settings.leetcodeConnection?.username &&
            settings.leetcodeProfileUsername &&
            settings.leetcodeConnection.username.toLowerCase() !== settings.leetcodeProfileUsername.toLowerCase() && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(210, 153, 34, 0.1)',
                  border: '1px solid var(--accent-yellow)',
                  fontSize: '12px',
                  color: 'var(--accent-yellow)',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>
                  ⚠️ <strong>Account Mismatch:</strong> Manual profile "@
                  {settings.leetcodeProfileUsername}" differs from active browser session "@
                  {settings.leetcodeConnection.username}".
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSettings((prev) => ({
                      ...prev,
                      leetcodeProfileUsername: settings.leetcodeConnection!.username,
                      leetcodeVerified: true,
                      leetcodeAccountStats: settings.leetcodeConnection!.stats,
                    }));
                  }}
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                >
                  Use Signed-in Account
                </button>
              </div>
            )}

          {/* Fallback Manual Profile URL Input */}
          <div style={{ marginTop: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
              LeetCode Profile URL or Username
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <input
                type="text"
                placeholder="e.g. tourist or https://leetcode.com/u/tourist/"
                value={settings.leetcodeProfileUsername || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    leetcodeProfileUsername: e.target.value,
                  })
                }
                style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              />
              <button
                type="button"
                onClick={handleVerifyLeetCodeProfile}
                disabled={lcVerification.checking || !settings.leetcodeProfileUsername?.trim()}
                style={{ flexShrink: 0, fontSize: '12px' }}
              >
                {lcVerification.checking ? 'Verifying...' : '🔍 Verify Account'}
              </button>
            </div>

            {settings.leetcodeProfileUsername &&
              extractLeetCodeUsername(settings.leetcodeProfileUsername) &&
              extractLeetCodeUsername(settings.leetcodeProfileUsername) !== settings.leetcodeProfileUsername.trim() && (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Parsed handle: <strong style={{ color: 'var(--accent-blue)' }}>{extractLeetCodeUsername(settings.leetcodeProfileUsername)}</strong>
                </div>
              )}
          </div>

          {lcVerification.result && (
            <div
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: lcVerification.isError ? 'var(--accent-red)' : 'var(--accent-green)',
                marginTop: '6px',
              }}
            >
              {lcVerification.result}
            </div>
          )}

          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: '1.4' }}>
            🔒 <strong>Security & Permissions:</strong> LC-Sync never asks for your password or stores session cookies. It relies on standard browser credentials to query your public problem-solving progress directly from LeetCode.
          </div>
        </div>

        {/* GitHub Authentication Card */}
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
            2. GitHub Authentication
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
            3. Destination Repository
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
            4. Git Commit Details & Automation Preferences
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
