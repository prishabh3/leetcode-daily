import React, { useState, useEffect } from 'react';
import { AppSettings } from '../../../core/types/settings';
import { SyncIndex } from '../../../core/types/sync-index';
import {
  HistoricalImportConfig,
  HistoricalImportMode,
  HistoricalImportPreview,
  HistoricalImportProgress,
  HistoricalImportSummary,
  HistoricalImportCheckpoint,
} from '../../../core/types/historical-import';
import { SupportedLanguage } from '../../../core/types/submission';
import { LeetCodeHistoricalAdapter, LeetCodeSessionStatus } from '../../../core/leetcode/historical-adapter';
import { GitHubClient, RepoTestResult } from '../../../core/github/client';
import {
  previewHistoricalImport,
  executeHistoricalImport,
  CancelToken,
} from '../../../core/sync/historical-importer';
import { storage } from '../../../core/storage/chrome-storage';

interface HistoricalImportWizardProps {
  settings: AppSettings;
  syncIndex: SyncIndex;
  onClose: () => void;
  onImportComplete: () => void;
}

type WizardStep = 'check' | 'configure' | 'preview' | 'importing' | 'completed';

export const HistoricalImportWizard: React.FC<HistoricalImportWizardProps> = ({
  settings,
  syncIndex,
  onClose,
  onImportComplete,
}) => {
  const [step, setStep] = useState<WizardStep>('check');

  // Step 1: Connection States
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [leetcodeStatus, setLeetcodeStatus] = useState<LeetCodeSessionStatus | null>(null);
  const [githubStatus, setGithubStatus] = useState<RepoTestResult | null>(null);

  // Step 2: Configuration
  const [mode, setMode] = useState<HistoricalImportMode>('ALL_ACCEPTED');
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLangs, setSelectedLangs] = useState<SupportedLanguage[]>([
    'cpp',
    'python',
    'python3',
    'java',
    'javascript',
    'typescript',
    'csharp',
  ]);

  // Step 3: Preview State
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewProgressMsg, setPreviewProgressMsg] = useState('');
  const [previewData, setPreviewData] = useState<HistoricalImportPreview | null>(null);
  const [previewError, setPreviewError] = useState('');

  // Step 4: Import Execution & Progress
  const [progress, setProgress] = useState<HistoricalImportProgress | null>(null);
  const [cancelToken, setCancelToken] = useState<CancelToken | null>(null);
  const [importSummary, setImportSummary] = useState<HistoricalImportSummary | null>(null);

  // Resumption Checkpoint
  const [checkpoint, setCheckpoint] = useState<HistoricalImportCheckpoint | null>(null);

  const adapter = new LeetCodeHistoricalAdapter();
  const githubClient = new GitHubClient(settings.github);

  // Check connections & checkpoints on mount
  useEffect(() => {
    runConnectionCheck();
    storage.getHistoricalCheckpoint().then((cp) => {
      if (cp && !cp.isComplete) {
        setCheckpoint(cp);
      }
    });
  }, []);

  const runConnectionCheck = async () => {
    setCheckingAuth(true);

    const [lcRes, ghRes] = await Promise.all([
      adapter.checkSession(),
      githubClient.testConnection(),
    ]);

    setLeetcodeStatus(lcRes);
    setGithubStatus(ghRes);
    setCheckingAuth(false);
  };

  const handleStartDiscovery = async () => {
    setStep('preview');
    setLoadingPreview(true);
    setPreviewError('');

    const config: HistoricalImportConfig = {
      mode,
      dateRange: useDateRange ? { startDate, endDate } : undefined,
      languages: selectedLangs,
      destinationBranch: settings.github.branch || 'main',
    };

    try {
      const p = await previewHistoricalImport(
        config,
        adapter,
        syncIndex,
        (msg) => setPreviewProgressMsg(msg)
      );
      setPreviewData(p);
    } catch (err: any) {
      setPreviewError(err?.message || 'Failed to retrieve historical submissions preview.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleStartImport = async (resumeCheckpoint?: HistoricalImportCheckpoint | null) => {
    if (!previewData && !resumeCheckpoint) return;

    setStep('importing');
    const token: CancelToken = { isCancelled: false };
    setCancelToken(token);

    const config: HistoricalImportConfig = resumeCheckpoint?.config || {
      mode,
      dateRange: useDateRange ? { startDate, endDate } : undefined,
      languages: selectedLangs,
      destinationBranch: settings.github.branch || 'main',
    };

    try {
      const summary = await executeHistoricalImport(
        previewData?.submissions || [],
        config,
        adapter,
        githubClient,
        (p) => setProgress(p),
        resumeCheckpoint,
        token
      );

      setImportSummary(summary);
      setStep('completed');
      onImportComplete();
    } catch (err: any) {
      setProgress((prev) => ({
        status: 'failed',
        processedCount: prev?.processedCount || 0,
        totalCount: prev?.totalCount || 0,
        importedCount: prev?.importedCount || 0,
        skippedDuplicatesCount: prev?.skippedDuplicatesCount || 0,
        failedCount: (prev?.failedCount || 0) + 1,
        awaitingRetryCount: 0,
        currentBatch: prev?.currentBatch || 0,
        totalBatches: prev?.totalBatches || 0,
        message: `Import failed: ${err?.message || 'Unknown error'}`,
      }));
    }
  };

  const handleCancel = () => {
    if (cancelToken) {
      cancelToken.isCancelled = true;
    }
  };

  const handleResumeCheckpoint = async () => {
    if (!checkpoint) return;
    setMode(checkpoint.config.mode);
    await handleStartImport(checkpoint);
  };

  const handleDiscardCheckpoint = async () => {
    await storage.clearHistoricalCheckpoint();
    setCheckpoint(null);
  };

  const toggleLanguage = (lang: SupportedLanguage) => {
    if (selectedLangs.includes(lang)) {
      if (selectedLangs.length > 1) {
        setSelectedLangs(selectedLangs.filter((l) => l !== lang));
      }
    } else {
      setSelectedLangs([...selectedLangs, lang]);
    }
  };

  const isConnected = Boolean(leetcodeStatus?.isSignedIn && githubStatus?.success);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Wizard Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              📥 Historical LeetCode Submissions Import
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Backfill your complete past solutions into your GitHub repository with atomic batch commits
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={step === 'importing'}
            style={{ fontSize: '14px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Resumption Banner */}
        {checkpoint && step === 'check' && (
          <div
            style={{
              padding: '10px 24px',
              backgroundColor: 'rgba(210, 153, 34, 0.15)',
              borderBottom: '1px solid var(--accent-yellow)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px',
            }}
          >
            <div>
              ⚠️ <strong>Interrupted import detected</strong>: {checkpoint.completedSubmissionIds.length} of {checkpoint.totalExpected} submissions previously processed.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="primary"
                style={{ fontSize: '12px', padding: '4px 10px' }}
                onClick={handleResumeCheckpoint}
              >
                Resume Import
              </button>
              <button
                style={{ fontSize: '12px', padding: '4px 10px' }}
                onClick={handleDiscardCheckpoint}
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Wizard Steps Navigation Bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '12px',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          <div style={{ flex: 1, padding: '10px', textAlign: 'center', color: step === 'check' ? 'var(--accent-blue)' : 'var(--text-muted)', fontWeight: step === 'check' ? 600 : 400 }}>
            1. Connection Check
          </div>
          <div style={{ flex: 1, padding: '10px', textAlign: 'center', color: step === 'configure' ? 'var(--accent-blue)' : 'var(--text-muted)', fontWeight: step === 'configure' ? 600 : 400 }}>
            2. Configuration
          </div>
          <div style={{ flex: 1, padding: '10px', textAlign: 'center', color: step === 'preview' ? 'var(--accent-blue)' : 'var(--text-muted)', fontWeight: step === 'preview' ? 600 : 400 }}>
            3. Preview & Analyze
          </div>
          <div style={{ flex: 1, padding: '10px', textAlign: 'center', color: step === 'importing' ? 'var(--accent-blue)' : 'var(--text-muted)', fontWeight: step === 'importing' ? 600 : 400 }}>
            4. Import Progress
          </div>
          <div style={{ flex: 1, padding: '10px', textAlign: 'center', color: step === 'completed' ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: step === 'completed' ? 600 : 400 }}>
            5. Report
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* STEP 1: CONNECTION CHECK */}
          {step === 'check' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3 style={{ fontSize: '15px' }}>Verify Authenticated Connections</h3>

              {checkingAuth ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  Testing LeetCode browser session and GitHub repository connection...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* LeetCode Status Card */}
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${leetcodeStatus?.isSignedIn ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                      backgroundColor: 'var(--bg-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>
                        {leetcodeStatus?.isSignedIn ? '✓ LeetCode Browser Session Active' : '✕ LeetCode Session Not Detected'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {leetcodeStatus?.isSignedIn
                          ? `Authenticated as user: ${leetcodeStatus.username}`
                          : leetcodeStatus?.error || 'Please log in to leetcode.com in your browser.'}
                      </div>
                    </div>
                    <button onClick={runConnectionCheck} style={{ fontSize: '12px', padding: '4px 10px' }}>
                      Re-test
                    </button>
                  </div>

                  {/* GitHub Status Card */}
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${githubStatus?.success ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                      backgroundColor: 'var(--bg-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>
                        {githubStatus?.success ? '✓ GitHub Repository Connected' : '✕ GitHub Connection Error'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {githubStatus?.success
                          ? `Destination: ${settings.github.owner}/${settings.github.repo} (Branch: ${settings.github.branch || 'main'})`
                          : githubStatus?.message || 'Please configure your GitHub token and repository in Settings.'}
                      </div>
                    </div>
                    <button onClick={runConnectionCheck} style={{ fontSize: '12px', padding: '4px 10px' }}>
                      Re-test
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  className="primary"
                  disabled={!isConnected || checkingAuth}
                  onClick={() => setStep('configure')}
                  style={{ padding: '8px 20px' }}
                >
                  Continue to Configuration →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONFIGURE IMPORT */}
          {step === 'configure' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '15px' }}>Configure Import Settings</h3>

              {/* Mode Selection */}
              <div>
                <label style={{ fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                  Select Import Mode:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${mode === 'ALL_ACCEPTED' ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                      backgroundColor: mode === 'ALL_ACCEPTED' ? 'rgba(88, 166, 255, 0.08)' : 'var(--bg-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={mode === 'ALL_ACCEPTED'}
                      onChange={() => setMode('ALL_ACCEPTED')}
                    />
                    <div>
                      <strong>Mode A — All Historical Accepted Submissions (Recommended Default)</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Imports every accepted solution. The latest version sits in the canonical path, and earlier accepted versions or alternate approaches are stored cleanly under <code>history/&lt;submission-id&gt;/</code>.
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${mode === 'LATEST_ACCEPTED' ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                      backgroundColor: mode === 'LATEST_ACCEPTED' ? 'rgba(88, 166, 255, 0.08)' : 'var(--bg-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={mode === 'LATEST_ACCEPTED'}
                      onChange={() => setMode('LATEST_ACCEPTED')}
                    />
                    <div>
                      <strong>Mode B — Latest Accepted Submission per Problem & Language</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Imports only the most recent accepted version for each problem-language pair for a compact repository.
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${mode === 'ALL_ATTEMPTS' ? 'var(--accent-yellow)' : 'var(--border-color)'}`,
                      backgroundColor: mode === 'ALL_ATTEMPTS' ? 'rgba(210, 153, 34, 0.08)' : 'var(--bg-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={mode === 'ALL_ATTEMPTS'}
                      onChange={() => setMode('ALL_ATTEMPTS')}
                    />
                    <div>
                      <strong>Mode C — All Submission Attempts (Opt-in)</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Includes unsuccessful attempts (Wrong Answer, Time Limit Exceeded, Runtime Error). Unsuccessful code is stored separately under <code>attempts/&lt;submission-id&gt;/</code> and never overwrites canonical solutions.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Language Filters */}
              <div>
                <label style={{ fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                  Filter by Languages:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(['cpp', 'python', 'python3', 'java', 'javascript', 'typescript', 'csharp'] as SupportedLanguage[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      style={{
                        fontSize: '12px',
                        padding: '4px 10px',
                        backgroundColor: selectedLangs.includes(lang) ? 'var(--accent-blue)' : 'var(--bg-primary)',
                        color: selectedLangs.includes(lang) ? '#fff' : 'var(--text-secondary)',
                        borderColor: selectedLangs.includes(lang) ? 'var(--accent-blue)' : 'var(--border-color)',
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range Selection */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={useDateRange}
                    onChange={(e) => setUseDateRange(e.target.checked)}
                  />
                  Specify Date Range (Optional)
                </label>
                {useDateRange && (
                  <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>From:</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ display: 'block', marginTop: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>To:</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ display: 'block', marginTop: '4px' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                <button onClick={() => setStep('check')}>← Back</button>
                <button className="primary" onClick={handleStartDiscovery} style={{ padding: '8px 20px' }}>
                  Preview Discovered History →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW */}
          {step === 'preview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3 style={{ fontSize: '15px' }}>Preview Discovered History</h3>

              {loadingPreview ? (
                <div style={{ textAlign: 'center', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{previewProgressMsg || 'Querying LeetCode historical submissions...'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>This inspects past submissions page by page. No changes are written to GitHub yet.</div>
                </div>
              ) : previewError ? (
                <div style={{ padding: '16px', backgroundColor: 'rgba(248, 81, 73, 0.1)', border: '1px solid var(--accent-red)', borderRadius: 'var(--radius-md)' }}>
                  <strong>Error:</strong> {previewError}
                  <div style={{ marginTop: '10px' }}>
                    <button onClick={handleStartDiscovery} style={{ fontSize: '12px' }}>Retry Discovery</button>
                  </div>
                </div>
              ) : previewData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Summary Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700 }}>{previewData.totalDiscovered}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Discovered Submissions</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-green)' }}>{previewData.newToImportCount}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>New to Import</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-blue)' }}>{previewData.distinctProblems}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Distinct Problems</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-yellow)' }}>{previewData.duplicatesSkippedCount}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Already Synced (Skip)</div>
                    </div>
                  </div>

                  {/* Language Distribution Breakdown */}
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <strong style={{ fontSize: '12px' }}>Language Breakdown:</strong>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {Object.entries(previewData.languageDistribution).map(([lang, count]) => (
                        <span key={lang} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {lang}: <strong>{count}</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Submission Sample Table */}
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', textAlign: 'left' }}>
                          <th style={{ padding: '6px 10px' }}>ID</th>
                          <th style={{ padding: '6px 10px' }}>Problem Title</th>
                          <th style={{ padding: '6px 10px' }}>Status</th>
                          <th style={{ padding: '6px 10px' }}>Lang</th>
                          <th style={{ padding: '6px 10px' }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.submissions.slice(0, 50).map((sub) => (
                          <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '6px 10px', fontFamily: 'var(--font-mono)' }}>{sub.id}</td>
                            <td style={{ padding: '6px 10px' }}>{sub.title}</td>
                            <td style={{ padding: '6px 10px', color: sub.statusDisplay === 'Accepted' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                              {sub.statusDisplay}
                            </td>
                            <td style={{ padding: '6px 10px' }}>{sub.normalizedLanguage || sub.lang}</td>
                            <td style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>
                              {new Date(sub.timestamp * 1000).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <button onClick={() => setStep('configure')}>← Back to Config</button>
                    <button
                      className="primary"
                      disabled={previewData.newToImportCount === 0}
                      onClick={() => handleStartImport(null)}
                      style={{ padding: '8px 24px' }}
                    >
                      Start Import to GitHub ({previewData.newToImportCount} Submissions) →
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* STEP 4: IMPORT PROGRESS */}
          {step === 'importing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
              <h3 style={{ fontSize: '15px' }}>Importing Historical Submissions to GitHub</h3>

              {/* Progress Bar */}
              {progress && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span>Processed {progress.processedCount} of {progress.totalCount} submissions</span>
                    <span>{progress.totalCount > 0 ? Math.round((progress.processedCount / progress.totalCount) * 100) : 0}%</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: 'var(--accent-blue)',
                        width: `${progress.totalCount > 0 ? (progress.processedCount / progress.totalCount) * 100 : 0}%`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Live Status Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-green)' }}>{progress?.importedCount || 0}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Imported Successfully</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-yellow)' }}>{progress?.skippedDuplicatesCount || 0}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Skipped as Duplicates</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-red)' }}>{progress?.failedCount || 0}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Failed</div>
                </div>
              </div>

              {/* Current Status Message & Batch */}
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)' }} />
                <span>{progress?.message || 'Executing bounded atomic batch commits...'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={handleCancel} style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
                  Cancel Import (Save Checkpoint)
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: COMPLETION REPORT */}
          {step === 'completed' && importSummary && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: '36px' }}>🎉</div>
                <h3 style={{ fontSize: '18px', marginTop: '8px' }}>Historical Import Completed!</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Your LeetCode historical submissions are synchronized and indexed in GitHub.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>{importSummary.totalDiscovered}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Evaluated</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-green)' }}>{importSummary.importedCount}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Imported to GitHub</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-blue)' }}>{importSummary.distinctProblemsImported}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Distinct Problems</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-yellow)' }}>{importSummary.skippedCount}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Duplicates Skipped</div>
                </div>
              </div>

              {/* GitHub Commit Links */}
              {importSummary.commitsCreated.length > 0 && (
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <strong style={{ fontSize: '12px' }}>Created GitHub Commits:</strong>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {importSummary.commitsCreated.map((sha, idx) => {
                      const url = `https://github.com/${settings.github.owner}/${settings.github.repo}/commit/${sha}`;
                      return (
                        <a
                          key={sha}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--accent-blue)',
                            textDecoration: 'underline',
                          }}
                        >
                          Batch {idx + 1} ({sha.slice(0, 7)})
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="primary" onClick={onClose} style={{ padding: '8px 24px' }}>
                  Close & View Updated Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
