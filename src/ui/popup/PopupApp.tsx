import React, { useState, useEffect } from 'react';
import { storage } from '../../core/storage/chrome-storage';
import { AppSettings, DEFAULT_SETTINGS } from '../../core/types/settings';
import { SubmissionDraft } from '../../core/types/submission';
import { SyncIndex } from '../../core/types/sync-index';
import { getReviewUrgency } from '../../core/revision/scheduler';

export const PopupApp: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [draft, setDraft] = useState<SubmissionDraft | null>(null);
  const [syncIndex, setSyncIndex] = useState<SyncIndex | null>(null);
  const [dueCount, setDueCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const s = await storage.getSettings();
      const d = await storage.getActiveDraft();
      const idx = await storage.getSyncIndex();

      setSettings(s);
      setDraft(d);
      setSyncIndex(idx);

      // Calculate reviews due
      let due = 0;
      for (const p of Object.values(idx.problems || {})) {
        const urgency = getReviewUrgency(p.nextReviewDate);
        if (urgency.isOverdue || urgency.isDueToday) due++;
      }
      setDueCount(due);
      setLoading(false);
    }
    loadData();
  }, []);

  const openTab = (path?: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({
        url: chrome.runtime.getURL(path ? `dashboard.html#${path}` : 'dashboard.html'),
      });
    } else {
      window.open(path ? `dashboard.html#${path}` : 'dashboard.html');
    }
  };

  const openOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('options.html');
    }
  };

  const isConfigured = Boolean(
    settings.github.token && settings.github.owner && settings.github.repo
  );

  if (loading) {
    return <div style={{ padding: '16px', textAlign: 'center' }}>Loading LC-Sync...</div>;
  }

  return (
    <div style={{ width: '360px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' }}>⚡ LC-Sync</span>
          <span className="badge" style={{ backgroundColor: '#21262d', color: '#8b949e', fontSize: '10px' }}>v1.0</span>
        </div>
        <button
          onClick={openOptions}
          style={{ padding: '4px 8px', fontSize: '12px' }}
          title="Open Settings"
        >
          ⚙️ Settings
        </button>
      </div>

      {/* GitHub Repository Status Pill */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          fontSize: '12px',
        }}
      >
        <span style={{ color: 'var(--text-secondary)' }}>Destination Repo</span>
        {isConfigured ? (
          <span style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            {settings.github.owner}/{settings.github.repo}
          </span>
        ) : (
          <span style={{ color: 'var(--accent-yellow)', cursor: 'pointer' }} onClick={openOptions}>
            ⚠️ Configure Repo
          </span>
        )}
      </div>

      {/* Active Detected Submission Alert */}
      {draft ? (
        <div
          className="card"
          style={{
            border: '1px solid var(--accent-green)',
            backgroundColor: 'rgba(35, 134, 54, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="badge badge-easy" style={{ marginBottom: '6px' }}>Ready to Sync</span>
              <h4 style={{ fontSize: '14px', fontWeight: 600 }}>{draft.problemTitle}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Language: <span className="badge badge-lang">{draft.language}</span>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button
              className="primary"
              style={{ flex: 1, fontSize: '12px' }}
              onClick={() => openTab('/review')}
            >
              Review & Sync →
            </button>
          </div>
        </div>
      ) : null}

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div
          className="card"
          style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }}
          onClick={() => openTab('/catalog')}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tracked Problems</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-blue)' }}>
            {syncIndex?.totalProblems || 0}
          </div>
        </div>

        <div
          className="card"
          style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }}
          onClick={() => openTab('/revision')}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Reviews Due</div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: dueCount > 0 ? 'var(--accent-yellow)' : 'var(--accent-green)',
            }}
          >
            {dueCount}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          className="primary"
          style={{ width: '100%' }}
          onClick={() => openTab()}
        >
          Open Dashboard & Journal
        </button>

        <button
          style={{ width: '100%', fontSize: '12px' }}
          onClick={() => openTab('/manual-import')}
        >
          Manual Solution Import
        </button>
      </div>

      {/* Footer Info */}
      <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
        Local-first • Secure GitHub Sync • Spaced Repetition
      </div>
    </div>
  );
};
