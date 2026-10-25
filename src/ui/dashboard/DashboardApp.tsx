import React, { useState, useEffect } from 'react';
import { storage } from '../../core/storage/chrome-storage';
import { AppSettings, DEFAULT_SETTINGS } from '../../core/types/settings';
import { SyncIndex } from '../../core/types/sync-index';
import { SyncQueueItem } from '../../core/types/sync-queue';
import { SubmissionDraft, PlatformSubmission } from '../../core/types/submission';
import { RevisionQueueView } from './components/RevisionQueueView';
import { ProblemList } from './components/ProblemList';
import { NotesEditor } from './components/NotesEditor';
import { ManualImportModal } from './components/ManualImportModal';
import { SyncQueueStatus } from './components/SyncQueueStatus';
import { AnalyticsView } from './components/AnalyticsView';
import { HistoricalImportWizard } from './components/HistoricalImportWizard';

type Tab = 'revision' | 'catalog' | 'queue' | 'analytics';

export const DashboardApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('revision');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [syncIndex, setSyncIndex] = useState<SyncIndex>({
    schemaVersion: 2,
    lastUpdated: '',
    totalProblems: 0,
    totalSubmissions: 0,
    submissions: {},
    problems: {},
  });
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [draft, setDraft] = useState<SubmissionDraft | null>(null);

  // Modals state
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [showManualImport, setShowManualImport] = useState(false);
  const [showHistoricalImport, setShowHistoricalImport] = useState(false);
  const [importDraft, setImportDraft] = useState<PlatformSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAllData = async () => {
    const s = await storage.getSettings();
    const idx = await storage.getSyncIndex();
    const q = await storage.getSyncQueue();
    const d = await storage.getActiveDraft();

    setSettings(s);
    setSyncIndex(idx);
    setSyncQueue(q);
    setDraft(d);
    setLoading(false);
    return d;
  };

  useEffect(() => {
    loadAllData().then((loadedDraft) => {
      // Check hash for direct tab navigation
      const hash = window.location.hash;
      if (hash.includes('historical-import')) {
        setShowHistoricalImport(true);
      } else if (hash.includes('manual-import')) {
        setImportDraft(null);
        setShowManualImport(true);
      } else if (hash.includes('review') && loadedDraft) {
        // Only open review dialog if there is an actual detected draft awaiting review
        setImportDraft(loadedDraft);
        setShowManualImport(true);
      } else if (hash.includes('catalog')) {
        setActiveTab('catalog');
      } else if (hash.includes('revision')) {
        setActiveTab('revision');
      }
    });
  }, []);

  const openSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('options.html');
    }
  };

  const handleReviewDetected = () => {
    if (draft) {
      setImportDraft(draft);
      setShowManualImport(true);
    }
  };

  const handleOpenExplicitManualImport = () => {
    setImportDraft(null);
    setShowManualImport(true);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading LC-Sync Dashboard...</div>;
  }

  const problemArray = Object.values(syncIndex.problems || {});

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="icons/icon48.png" alt="LC-Sync" width="28" height="28" style={{ borderRadius: '6px' }} />
            <span>LC-Sync</span>
          </h1>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Personal DSA Learning & Spaced Repetition Platform
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {settings.github.owner && settings.github.repo ? (
            <div
              style={{
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-blue)',
              }}
            >
              repo: {settings.github.owner}/{settings.github.repo}
            </div>
          ) : (
            <button
              onClick={openSettings}
              style={{ fontSize: '12px', color: 'var(--accent-yellow)', borderColor: 'var(--accent-yellow)' }}
            >
              ⚠️ Set up GitHub Repo
            </button>
          )}

          <button
            className="primary"
            onClick={() => setShowHistoricalImport(true)}
            style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>📥</span>
            <span>Import Historical Submissions</span>
          </button>

          <button onClick={openSettings} style={{ padding: '6px 12px', fontSize: '13px' }}>
            ⚙️ Settings
          </button>
        </div>
      </header>

      {/* Detected Draft Alert Banner */}
      {draft && (
        <div
          style={{
            backgroundColor: 'rgba(35, 134, 54, 0.1)',
            border: '1px solid var(--accent-green)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-easy">Detected Submission</span>
            <strong>{draft.problemTitle}</strong>
            <span className="badge badge-lang">{draft.language}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="primary"
              style={{ fontSize: '12px', padding: '5px 12px' }}
              onClick={handleReviewDetected}
            >
              Review & Sync Now →
            </button>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <nav style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('revision')}
          style={{
            borderColor: activeTab === 'revision' ? 'var(--accent-blue)' : 'transparent',
            backgroundColor: activeTab === 'revision' ? 'var(--bg-secondary)' : 'transparent',
            color: activeTab === 'revision' ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          📅 Daily Revision Queue
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            borderColor: activeTab === 'catalog' ? 'var(--accent-blue)' : 'transparent',
            backgroundColor: activeTab === 'catalog' ? 'var(--bg-secondary)' : 'transparent',
            color: activeTab === 'catalog' ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          📚 Problem Catalog & Notes ({problemArray.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            borderColor: activeTab === 'analytics' ? 'var(--accent-blue)' : 'transparent',
            backgroundColor: activeTab === 'analytics' ? 'var(--bg-secondary)' : 'transparent',
            color: activeTab === 'analytics' ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          📊 Progress & Analytics
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          style={{
            borderColor: activeTab === 'queue' ? 'var(--accent-blue)' : 'transparent',
            backgroundColor: activeTab === 'queue' ? 'var(--bg-secondary)' : 'transparent',
            color: activeTab === 'queue' ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          ⚡ Sync Queue ({syncQueue.length})
        </button>
      </nav>

      {/* Main Tab Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'revision' && (
          <RevisionQueueView
            problems={problemArray}
            onRefresh={loadAllData}
            onOpenProblem={(id) => setSelectedProblemId(id)}
          />
        )}

        {activeTab === 'catalog' && (
          <ProblemList
            problems={problemArray}
            onOpenProblem={(id) => setSelectedProblemId(id)}
            onOpenManualImport={handleOpenExplicitManualImport}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView syncIndex={syncIndex} onRefresh={loadAllData} />
        )}

        {activeTab === 'queue' && (
          <SyncQueueStatus queue={syncQueue} onRefresh={loadAllData} />
        )}
      </main>

      {/* Notes Editor Modal */}
      {selectedProblemId && (
        <NotesEditor
          problemId={selectedProblemId}
          onClose={() => setSelectedProblemId(null)}
          onUpdated={loadAllData}
        />
      )}

      {/* Manual Import Modal */}
      {showManualImport && (
        <ManualImportModal
          initialDraft={importDraft}
          onClose={() => {
            setShowManualImport(false);
            setImportDraft(null);
          }}
          onSuccess={loadAllData}
        />
      )}

      {/* Historical Import Wizard Modal */}
      {showHistoricalImport && (
        <HistoricalImportWizard
          settings={settings}
          syncIndex={syncIndex}
          onClose={() => setShowHistoricalImport(false)}
          onImportComplete={loadAllData}
        />
      )}
    </div>
  );
};
