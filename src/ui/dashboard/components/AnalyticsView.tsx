import React, { useState } from 'react';
import { SyncIndex } from '../../../core/types/sync-index';
import { HeatmapView } from './HeatmapView';
import { generateProgressSvg, ProgressStats } from '../../../core/generator/svg-generator';
import { generateReadme } from '../../../core/generator/readme-generator';
import { extractLeetCodeUsername } from '../../../core/leetcode/profile-validator';
import { storage } from '../../../core/storage/chrome-storage';
import { GitHubClient } from '../../../core/github/client';
import { README_PATH, PROGRESS_SVG_PATH } from '../../../core/sync/path-sanitizer';

interface Props {
  syncIndex: SyncIndex;
  onRefresh: () => void;
}

export const AnalyticsView: React.FC<Props> = ({ syncIndex, onRefresh }) => {
  const [isPushing, setIsPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  const problems = Object.values(syncIndex.problems || {});

  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;
  const langCounts: Record<string, number> = {};
  const topicCounts: Record<string, number> = {};

  for (const p of problems) {
    if (p.difficulty === 'Easy') easyCount++;
    else if (p.difficulty === 'Medium') mediumCount++;
    else if (p.difficulty === 'Hard') hardCount++;

    for (const l of p.languages || []) {
      langCounts[l] = (langCounts[l] || 0) + 1;
    }

    for (const t of p.tags || []) {
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    }
  }

  const total = Math.max(1, problems.length);
  const easyPct = Math.round((easyCount / total) * 100);
  const medPct = Math.round((mediumCount / total) * 100);
  const hardPct = Math.round((hardCount / total) * 100);

  const stats: ProgressStats = {
    totalTracked: problems.length,
    totalSubmissions: syncIndex.totalSubmissions,
    easyCount,
    mediumCount,
    hardCount,
    languagesCount: langCounts,
    reviewsCompleted: 0,
  };

  const svgContent = generateProgressSvg(stats);

  const handleRegenerateAndPush = async () => {
    setIsPushing(true);
    setPushStatus(null);
    try {
      const fullSettings = await storage.getSettings();
      const settings = fullSettings.github;
      if (!settings.token || !settings.owner || !settings.repo) {
        setPushStatus('GitHub repository not configured in Settings.');
        return;
      }

      const client = new GitHubClient(settings);
      const existingReadme = await client.getFileContent(README_PATH);
      const cleanLeetCodeUser = extractLeetCodeUsername(fullSettings.leetcodeProfileUsername);
      const basePrefix = settings.defaultPathPrefix || 'solutions';
      const cacheBuster = Math.floor(Date.now() / 1000);

      const updatedReadme = generateReadme(existingReadme?.content || null, syncIndex, {
        repoName: settings.repo,
        githubUsername: settings.owner,
        leetcodeUsername: cleanLeetCodeUser || undefined,
        basePrefix,
        cacheBuster,
      });

      // Update README & SVG via contents API or atomic commit
      await client.putSingleFile(README_PATH, updatedReadme, 'chore: regenerate LC-Sync README', existingReadme?.sha);

      const existingSvg = await client.getFileContent(PROGRESS_SVG_PATH);
      await client.putSingleFile(PROGRESS_SVG_PATH, svgContent, 'chore: regenerate LC-Sync progress SVG', existingSvg?.sha);

      setPushStatus('README and SVG successfully regenerated and pushed to GitHub!');
      setTimeout(() => setPushStatus(null), 4000);
      onRefresh();
    } catch (err: any) {
      setPushStatus(`Error: ${err.message}`);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Notice about verified data */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(88, 166, 255, 0.08)',
          border: '1px solid rgba(88, 166, 255, 0.2)',
          color: 'var(--text-secondary)',
          fontSize: '12px',
        }}
      >
        ℹ️ <strong>Note</strong>: The statistics below represent DSA records verified and tracked by LC-Sync in your personal destination repository, rather than unverified global LeetCode account statistics.
      </div>

      {/* Top metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tracked Problems</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-blue)', marginTop: '4px' }}>
            {problems.length}
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Submissions / Approaches</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-green)', marginTop: '4px' }}>
            {syncIndex.totalSubmissions}
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Unique Languages</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-yellow)', marginTop: '4px' }}>
            {Object.keys(langCounts).length}
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Algorithmic Topics</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#bc8cff', marginTop: '4px' }}>
            {Object.keys(topicCounts).length}
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <HeatmapView syncIndex={syncIndex} />

      {/* Breakdown Grid: Difficulty & Languages */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Difficulty Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>Difficulty Breakdown</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#3fb950', fontWeight: 500 }}>Easy</span>
                <span>{easyCount} ({easyPct}%)</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${easyPct}%`, height: '100%', backgroundColor: '#238636' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#d29922', fontWeight: 500 }}>Medium</span>
                <span>{mediumCount} ({medPct}%)</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${medPct}%`, height: '100%', backgroundColor: '#d29922' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#f85149', fontWeight: 500 }}>Hard</span>
                <span>{hardCount} ({hardPct}%)</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${hardPct}%`, height: '100%', backgroundColor: '#da3633' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Language Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>Language Distribution</h3>
          {Object.keys(langCounts).length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No solutions synced yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(langCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([lang, count]) => {
                  const pct = Math.round((count / syncIndex.totalSubmissions) * 100);
                  return (
                    <div key={lang}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span className="badge badge-lang">{lang}</span>
                        <span>{count} solutions ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-blue)' }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* SVG Progress Card Preview & Manual Re-generation Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Deterministic SVG Graphic & GitHub README</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Rendered deterministically and committed to <code style={{ color: 'var(--accent-blue)' }}>assets/progress.svg</code>.
            </p>
          </div>

          <button
            className="primary"
            onClick={handleRegenerateAndPush}
            disabled={isPushing}
            style={{ fontSize: '12px' }}
          >
            {isPushing ? 'Updating on GitHub...' : '🔄 Re-generate & Push to GitHub'}
          </button>
        </div>

        {pushStatus && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: pushStatus.startsWith('Error') ? 'rgba(218, 54, 51, 0.15)' : 'rgba(35, 134, 54, 0.15)',
              color: pushStatus.startsWith('Error') ? '#f85149' : '#3fb950',
              fontSize: '13px',
              marginBottom: '14px',
            }}
          >
            {pushStatus}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
          <div dangerouslySetInnerHTML={{ __html: svgContent }} />
        </div>
      </div>
    </div>
  );
};
