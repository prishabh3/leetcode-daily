import React, { useState } from 'react';
import { SyncQueueItem } from '../../../core/types/sync-queue';
import { syncQueueManager } from '../../../core/sync/sync-queue-manager';
import { storage } from '../../../core/storage/chrome-storage';
import { GitHubClient } from '../../../core/github/client';

interface Props {
  queue: SyncQueueItem[];
  onRefresh: () => void;
}

export const SyncQueueStatus: React.FC<Props> = ({ queue, onRefresh }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessAll = async () => {
    setIsProcessing(true);
    try {
      const settings = (await storage.getSettings()).github;
      if (settings.token && settings.owner && settings.repo) {
        const client = new GitHubClient(settings);
        await syncQueueManager.processQueue(client);
      }
      onRefresh();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      const settings = (await storage.getSettings()).github;
      const client = settings.token ? new GitHubClient(settings) : undefined;
      await syncQueueManager.retryItem(id, client);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (id: string) => {
    await syncQueueManager.removeItem(id);
    onRefresh();
  };

  const getStatusBadge = (status: SyncQueueItem['status']) => {
    switch (status) {
      case 'Synced':
        return <span className="badge badge-easy">Synced</span>;
      case 'Syncing':
        return <span className="badge badge-medium">Syncing...</span>;
      case 'Pending':
        return <span className="badge" style={{ backgroundColor: '#21262d', color: '#8b949e' }}>Pending</span>;
      case 'Needs Attention':
        return <span className="badge badge-hard">Needs Attention</span>;
      case 'Failed':
      default:
        return <span className="badge badge-hard">Failed</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Sync Queue & Health Monitor</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Live status of submission uploads, atomic commits, and deduplication states.
          </p>
        </div>

        <button
          className="primary"
          onClick={handleProcessAll}
          disabled={isProcessing || queue.length === 0}
        >
          {isProcessing ? 'Processing Queue...' : '⚡ Process Pending Queue'}
        </button>
      </div>

      {queue.length === 0 ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No synchronization events recorded yet. Submissions from LeetCode or manual imports will appear here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {queue.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getStatusBadge(item.status)}
                  <span style={{ fontWeight: 600 }}>{item.submission.problemTitle}</span>
                  <span className="badge badge-lang">{item.submission.language}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Approach: {item.approachName}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Created: {new Date(item.createdAt).toLocaleString()} • Attempts: {item.attemptCount}/{item.maxAttempts}
                  {item.commitSha && (
                    <span style={{ marginLeft: '10px' }}>
                      Commit:{' '}
                      <code style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                        {item.commitSha.slice(0, 7)}
                      </code>
                    </span>
                  )}
                </div>

                {item.error && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: item.status === 'Synced' ? 'var(--accent-yellow)' : 'var(--accent-red)',
                      backgroundColor: 'var(--bg-primary)',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '4px',
                    }}
                  >
                    {item.error}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {(item.status === 'Failed' || item.status === 'Needs Attention') && (
                  <button
                    onClick={() => handleRetry(item.id)}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    Retry
                  </button>
                )}
                <button
                  onClick={() => handleRemove(item.id)}
                  style={{ fontSize: '12px', padding: '4px 10px', color: 'var(--text-muted)' }}
                  title="Dismiss from queue"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
