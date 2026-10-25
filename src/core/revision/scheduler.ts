import { ReviewRecord } from '../types/problem';

export const REVISION_INTERVALS = [1, 3, 7, 14, 30, 60];

export interface ScheduledReviewResult {
  nextReviewDate: string; // YYYY-MM-DD
  intervalDays: number;
  recalled: boolean;
  newReviewRecord: ReviewRecord;
}

/**
 * Calculates the next review date and interval based on confidence rating and past reviews.
 * Rating scale:
 * 1: Failed / Could not solve independently (interval resets to 1 day)
 * 2: Substantial hints needed (interval shrinks or stays at 1-2 days)
 * 3: Solved with some help (advances modestly, multiplier ~ 1.2x - 1.5x)
 * 4: Solved independently (advances standard schedule)
 * 5: Mastered / reproduce confidently (accelerated interval)
 */
export function calculateNextReview(
  rating: number,
  currentReviewsCount: number,
  lastIntervalDays: number = 0,
  referenceDate: Date = new Date()
): ScheduledReviewResult {
  const boundedRating = Math.max(1, Math.min(5, Math.round(rating)));
  const recalled = boundedRating >= 3;

  let nextInterval: number;

  if (boundedRating === 1) {
    // Complete lapse: reset to 1 day
    nextInterval = 1;
  } else if (boundedRating === 2) {
    // Struggled: short interval
    nextInterval = Math.max(1, Math.min(2, Math.floor(lastIntervalDays * 0.5)));
  } else {
    // Successful recall (3, 4, 5)
    if (currentReviewsCount === 0 || lastIntervalDays === 0) {
      // First review
      if (boundedRating === 3) nextInterval = 2;
      else if (boundedRating === 4) nextInterval = 3;
      else nextInterval = 5; // rating === 5
    } else {
      // Subsequent review: scale based on rating
      let multiplier = 1.6;
      if (boundedRating === 3) multiplier = 1.3;
      else if (boundedRating === 4) multiplier = 2.0;
      else if (boundedRating === 5) multiplier = 2.5;

      nextInterval = Math.max(1, Math.round(lastIntervalDays * multiplier));
    }
  }

  // Cap nextInterval at 120 days for safety
  nextInterval = Math.min(120, nextInterval);

  const targetDate = new Date(referenceDate);
  targetDate.setDate(targetDate.getDate() + nextInterval);
  const nextReviewDate = targetDate.toISOString().split('T')[0];
  const todayStr = referenceDate.toISOString().split('T')[0];

  const newReviewRecord: ReviewRecord = {
    date: todayStr,
    rating: boundedRating,
    recalled,
    intervalDays: nextInterval,
  };

  return {
    nextReviewDate,
    intervalDays: nextInterval,
    recalled,
    newReviewRecord,
  };
}

/**
 * Checks if a review is overdue or due today compared to referenceDate
 */
export function getReviewUrgency(nextReviewDateStr: string, referenceDate: Date = new Date()): {
  isOverdue: boolean;
  isDueToday: boolean;
  daysDifference: number; // negative = overdue, 0 = today, positive = days until due
} {
  if (!nextReviewDateStr) {
    return { isOverdue: false, isDueToday: true, daysDifference: 0 };
  }

  const today = new Date(referenceDate.toISOString().split('T')[0]);
  const target = new Date(nextReviewDateStr);

  const diffTime = target.getTime() - today.getTime();
  const daysDifference = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return {
    isOverdue: daysDifference < 0,
    isDueToday: daysDifference === 0,
    daysDifference,
  };
}

/**
 * Sorts problems by review priority (most overdue first, then due today, then upcoming)
 */
export function sortProblemsForReview<T extends { nextReviewDate: string }>(
  problems: T[],
  referenceDate: Date = new Date()
): T[] {
  return [...problems].sort((a, b) => {
    const aDiff = getReviewUrgency(a.nextReviewDate, referenceDate).daysDifference;
    const bDiff = getReviewUrgency(b.nextReviewDate, referenceDate).daysDifference;
    return aDiff - bDiff;
  });
}
