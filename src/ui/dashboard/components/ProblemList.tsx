import React, { useState } from 'react';
import { ProblemSummaryEntry } from '../../../core/types/sync-index';
import { getReviewUrgency } from '../../../core/revision/scheduler';

interface Props {
  problems: ProblemSummaryEntry[];
  onOpenProblem: (id: string) => void;
  onOpenManualImport: () => void;
}

export const ProblemList: React.FC<Props> = ({ problems, onOpenProblem, onOpenManualImport }) => {
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Collect unique languages
  const allLanguages = Array.from(new Set(problems.flatMap((p) => p.languages || [])));

  // Filter problems
  const filtered = problems.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.id.includes(search) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchDiff = selectedDifficulty === 'all' || p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchLang = selectedLanguage === 'all' || (p.languages || []).includes(selectedLanguage as any);

    return matchSearch && matchDiff && matchLang;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
          <input
            type="text"
            placeholder="Search problems by name, #ID, or topic tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '360px' }}
          />

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{ width: '130px' }}
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{ width: '130px' }}
          >
            <option value="all">All Languages</option>
            {allLanguages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <button className="primary" onClick={onOpenManualImport}>
          + Import Solution
        </button>
      </div>

      {/* Problem Table */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {problems.length === 0
            ? 'No problems tracked yet. Solve a problem on LeetCode or use the Import button above.'
            : 'No problems match your current filters.'}
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 14px', width: '70px' }}>#ID</th>
                <th style={{ padding: '10px 14px' }}>Problem Title</th>
                <th style={{ padding: '10px 14px', width: '110px' }}>Difficulty</th>
                <th style={{ padding: '10px 14px' }}>Languages</th>
                <th style={{ padding: '10px 14px', width: '100px' }}>Confidence</th>
                <th style={{ padding: '10px 14px', width: '120px' }}>Next Revision</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', width: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const urgency = getReviewUrgency(p.nextReviewDate);
                let badgeClass = 'badge-medium';
                if (p.difficulty === 'Easy') badgeClass = 'badge-easy';
                else if (p.difficulty === 'Hard') badgeClass = 'badge-hard';

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.1s',
                    }}
                  >
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      #{p.id}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                        onClick={() => onOpenProblem(p.id)}
                      >
                        {p.title}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`badge ${badgeClass}`}>{p.difficulty}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(p.languages || []).map((l) => (
                          <span key={l} className="badge badge-lang">{l}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                      {p.confidenceRating ? `${p.confidenceRating}/5` : '-'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          color: urgency.isOverdue
                            ? 'var(--accent-red)'
                            : urgency.isDueToday
                            ? 'var(--accent-yellow)'
                            : 'var(--text-secondary)',
                          fontSize: '12px',
                        }}
                      >
                        {p.nextReviewDate || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => onOpenProblem(p.id)}
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        Notes & Code
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
