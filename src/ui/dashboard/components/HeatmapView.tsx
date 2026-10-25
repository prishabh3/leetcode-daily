import React from 'react';
import { SyncIndex } from '../../../core/types/sync-index';

interface Props {
  syncIndex: SyncIndex;
}

export const HeatmapView: React.FC<Props> = ({ syncIndex }) => {
  // Build activity map for the past 52 weeks (364 days)
  const submissions = Object.values(syncIndex.submissions || {});
  const activityMap = new Map<string, number>();

  for (const s of submissions) {
    if (s.syncedAt) {
      const dateKey = s.syncedAt.split('T')[0];
      activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
    }
  }

  // Generate 52 weeks of dates ending today
  const today = new Date();
  const days: { date: string; count: number; dayOfWeek: number }[] = [];
  const totalDays = 364;

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      count: activityMap.get(dateStr) || 0,
      dayOfWeek: d.getDay(),
    });
  }

  // Group into columns of 7 days
  const weeks: Array<typeof days> = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getColor = (count: number) => {
    if (count === 0) return '#161b22';
    if (count === 1) return '#0e4429';
    if (count <= 3) return '#006d32';
    if (count <= 5) return '#26a641';
    return '#39d353';
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Sync Activity Heatmap (Past 52 Weeks)</h3>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {submissions.length} Total Synchronizations Recorded
        </span>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '3px' }}>
          {weeks.map((week, wIndex) => (
            <div key={wIndex} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} synchronization${day.count === 1 ? '' : 's'}`}
                  style={{
                    width: '11px',
                    height: '11px',
                    borderRadius: '2px',
                    backgroundColor: getColor(day.count),
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span>Less</span>
        <div style={{ width: '10px', height: '10px', backgroundColor: '#161b22', borderRadius: '2px' }} />
        <div style={{ width: '10px', height: '10px', backgroundColor: '#0e4429', borderRadius: '2px' }} />
        <div style={{ width: '10px', height: '10px', backgroundColor: '#006d32', borderRadius: '2px' }} />
        <div style={{ width: '10px', height: '10px', backgroundColor: '#26a641', borderRadius: '2px' }} />
        <div style={{ width: '10px', height: '10px', backgroundColor: '#39d353', borderRadius: '2px' }} />
        <span>More</span>
      </div>
    </div>
  );
};
