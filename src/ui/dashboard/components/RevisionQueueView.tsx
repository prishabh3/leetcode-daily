import React, { useState } from 'react';
import { ProblemSummaryEntry } from '../../../core/types/sync-index';
import { getReviewUrgency, calculateNextReview } from '../../../core/revision/scheduler';
import { storage } from '../../../core/storage/chrome-storage';

interface Props {
  problems: ProblemSummaryEntry[];
  onRefresh: () => void;
  onOpenProblem: (id: string) => void;
}

export const RevisionQueueView: React.FC<Props> = ({ problems, onRefresh, onOpenProblem }) => {
  const [reviewingProblem, setReviewingProblem] = useState<ProblemSummaryEntry | null>(null);
  const [rating, setRating] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Group problems by urgency
  const overdue: ProblemSummaryEntry[] = [];
  const dueToday: ProblemSummaryEntry[] = [];
  const upcoming: ProblemSummaryEntry[] = [];

  for (const p of problems) {
    const urgency = getReviewUrgency(p.nextReviewDate);
    if (urgency.isOverdue) {
      overdue.push(p);
    } else if (urgency.isDueToday) {
      dueToday.push(p);
    } else {
      upcoming.push(p);
    }
  }

  const handleStartReview = async (p: ProblemSummaryEntry) => {
    setReviewingProblem(p);
    setRating(p.confidenceRating || 3);
  };

  const handleCompleteReview = async () => {
    if (!reviewingProblem) return;
    setIsSubmitting(true);

    try {
      const meta = await storage.getProblemMetadata(reviewingProblem.id);
      const pastReviewsCount = meta?.reviewsCount || 0;
      const lastInterval =
        meta?.reviewHistory && meta.reviewHistory.length > 0
          ? meta.reviewHistory[meta.reviewHistory.length - 1].intervalDays
          : 0;

      const calc = calculateNextReview(rating, pastReviewsCount, lastInterval);

      // Update problem metadata
      if (meta) {
        meta.confidenceRating = rating;
        meta.nextReviewDate = calc.nextReviewDate;
        meta.reviewsCount += 1;
        if (!calc.recalled) meta.failedRecallCount += 1;
        meta.reviewHistory.push(calc.newReviewRecord);
        await storage.saveProblemMetadata(meta);
      }

      // Update sync index
      const index = await storage.getSyncIndex();
      if (index.problems[reviewingProblem.id]) {
        index.problems[reviewingProblem.id].confidenceRating = rating;
        index.problems[reviewingProblem.id].nextReviewDate = calc.nextReviewDate;
        await storage.saveSyncIndex(index);
      }

      setReviewingProblem(null);
      onRefresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Overview Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #161b22 0%, #1a222d 100%)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Spaced Repetition Revision Queue</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Strengthen long-term algorithm recall by revisiting problems when they are due.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-red)' }}>
              {overdue.length}
            </span>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Overdue</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-yellow)' }}>
              {dueToday.length}
            </span>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Due Today</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-blue)' }}>
              {upcoming.length}
            </span>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Upcoming</div>
          </div>
        </div>
      </div>

      {/* Review Modal / Drawer */}
      {reviewingProblem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              width: '540px',
              maxWidth: '100%',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
                Review: #{reviewingProblem.id} {reviewingProblem.title}
              </h3>
              <button onClick={() => setReviewingProblem(null)} style={{ padding: '2px 8px' }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              How well were you able to recall and reproduce the optimal approach?
            </p>

            {/* Confidence Selector 1 to 5 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { val: 1, label: '1 — Could not solve independently', desc: 'Reset interval to 1 day' },
                { val: 2, label: '2 — Needed substantial hints', desc: 'Short interval (1-2 days)' },
                { val: 3, label: '3 — Solved with some help or uncertainty', desc: 'Moderate interval step' },
                { val: 4, label: '4 — Solved independently', desc: 'Standard spaced interval' },
                { val: 5, label: '5 — Can explain & reproduce confidently', desc: 'Accelerated interval' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: rating === opt.val ? 'var(--accent-blue)' : 'var(--border-color)',
                    backgroundColor: rating === opt.val ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="confidence"
                    value={opt.val}
                    checked={rating === opt.val}
                    onChange={() => setRating(opt.val)}
                    style={{ width: 'auto' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{opt.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => setReviewingProblem(null)}>Cancel</button>
              <button
                className="primary"
                onClick={handleCompleteReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Complete Review & Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Section */}
      {overdue.length > 0 && (
        <div>
          <h3 style={{ fontSize: '15px', color: 'var(--accent-red)', marginBottom: '12px', fontWeight: 600 }}>
            🚨 Overdue for Review ({overdue.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {overdue.map((p) => (
              <RevisionCard
                key={p.id}
                problem={p}
                onReview={() => handleStartReview(p)}
                onOpen={() => onOpenProblem(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Due Today Section */}
      <div>
        <h3 style={{ fontSize: '15px', color: 'var(--accent-yellow)', marginBottom: '12px', fontWeight: 600 }}>
          📅 Due Today ({dueToday.length})
        </h3>
        {dueToday.length === 0 ? (
          <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            ✓ No reviews due today! You are all caught up.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dueToday.map((p) => (
              <RevisionCard
                key={p.id}
                problem={p}
                onReview={() => handleStartReview(p)}
                onOpen={() => onOpenProblem(p.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Section */}
      {upcoming.length > 0 && (
        <div>
          <h3 style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>
            ⏳ Upcoming Reviews ({upcoming.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcoming.slice(0, 10).map((p) => (
              <RevisionCard
                key={p.id}
                problem={p}
                onReview={() => handleStartReview(p)}
                onOpen={() => onOpenProblem(p.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface CardProps {
  problem: ProblemSummaryEntry;
  onReview: () => void;
  onOpen: () => void;
}

const RevisionCard: React.FC<CardProps> = ({ problem, onReview, onOpen }) => {
  const urgency = getReviewUrgency(problem.nextReviewDate);

  let badgeClass = 'badge-medium';
  if (problem.difficulty === 'Easy') badgeClass = 'badge-easy';
  else if (problem.difficulty === 'Hard') badgeClass = 'badge-hard';

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '13px' }}>
          #{problem.id}
        </span>
        <span className={`badge ${badgeClass}`}>{problem.difficulty}</span>
        <span
          style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)' }}
          onClick={onOpen}
        >
          {problem.title}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {problem.languages.map((l) => (
            <span key={l} className="badge badge-lang">{l}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ textAlign: 'right', fontSize: '12px' }}>
          <div style={{ color: urgency.isOverdue ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
            Due: {problem.nextReviewDate}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            Confidence: {problem.confidenceRating || 3}/5
          </div>
        </div>

        <button className="primary" onClick={onReview} style={{ fontSize: '12px', padding: '5px 12px' }}>
          Review Now
        </button>
      </div>
    </div>
  );
};
