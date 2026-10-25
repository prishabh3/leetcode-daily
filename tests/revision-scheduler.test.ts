import { describe, it, expect } from 'vitest';
import { calculateNextReview, getReviewUrgency, sortProblemsForReview } from '../src/core/revision/scheduler';

describe('6. Revision interval calculations', () => {
  const refDate = new Date('2026-10-24T00:00:00.000Z');

  it('resets interval to 1 day for rating 1 (failed recall)', () => {
    const res = calculateNextReview(1, 4, 14, refDate);
    expect(res.recalled).toBe(false);
    expect(res.intervalDays).toBe(1);
    expect(res.nextReviewDate).toBe('2026-10-25');
  });

  it('gives short interval for rating 2 (substantial hints)', () => {
    const res = calculateNextReview(2, 3, 10, refDate);
    expect(res.recalled).toBe(false);
    expect(res.intervalDays).toBeLessThanOrEqual(2);
  });

  it('steps forward standard interval for rating 4 (independent solve)', () => {
    const firstReview = calculateNextReview(4, 0, 0, refDate);
    expect(firstReview.recalled).toBe(true);
    expect(firstReview.intervalDays).toBe(3);

    const secondReview = calculateNextReview(4, 1, 3, refDate);
    expect(secondReview.intervalDays).toBe(6);
  });

  it('accelerates interval for rating 5 (mastery)', () => {
    const firstReview = calculateNextReview(5, 0, 0, refDate);
    expect(firstReview.intervalDays).toBe(5);

    const secondReview = calculateNextReview(5, 1, 5, refDate);
    expect(secondReview.intervalDays).toBe(13); // 5 * 2.5
  });

  it('detects overdue and due today correctly', () => {
    const overdue = getReviewUrgency('2026-10-20', refDate);
    expect(overdue.isOverdue).toBe(true);
    expect(overdue.isDueToday).toBe(false);
    expect(overdue.daysDifference).toBe(-4);

    const today = getReviewUrgency('2026-10-24', refDate);
    expect(today.isOverdue).toBe(false);
    expect(today.isDueToday).toBe(true);
    expect(today.daysDifference).toBe(0);

    const upcoming = getReviewUrgency('2026-10-28', refDate);
    expect(upcoming.isOverdue).toBe(false);
    expect(upcoming.isDueToday).toBe(false);
    expect(upcoming.daysDifference).toBe(4);
  });

  it('sorts revision queue with most urgent/overdue first', () => {
    const problems = [
      { id: '1', nextReviewDate: '2026-10-30' },
      { id: '2', nextReviewDate: '2026-10-20' }, // overdue
      { id: '3', nextReviewDate: '2026-10-24' }, // today
    ];

    const sorted = sortProblemsForReview(problems, refDate);
    expect(sorted[0].id).toBe('2'); // overdue first
    expect(sorted[1].id).toBe('3'); // today second
    expect(sorted[2].id).toBe('1'); // upcoming last
  });
});
