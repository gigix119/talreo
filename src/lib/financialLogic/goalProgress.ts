/**
 * Goal progress calculation — progress percent, remaining, status.
 * Pure functions; no database access.
 */
import type { GoalProgressResult } from './types';

export type GoalStatus = 'active' | 'completed' | 'overdue';

export function getGoalStatus(
  currentAmount: number,
  targetAmount: number,
  targetDate: string | null,
  isCompleted: boolean
): GoalStatus {
  if (isCompleted || currentAmount >= targetAmount) return 'completed';
  if (targetDate && targetDate < new Date().toISOString().slice(0, 10)) return 'overdue';
  return 'active';
}

export function computeGoalProgress(
  goalId: string,
  goalName: string,
  currentAmount: number,
  targetAmount: number,
  targetDate: string | null,
  isCompleted: boolean
): GoalProgressResult {
  const remaining = Math.max(0, targetAmount - currentAmount);
  const progressPercent = targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0;
  const status = getGoalStatus(currentAmount, targetAmount, targetDate, isCompleted);

  let daysUntilTarget: number | null = null;
  if (targetDate && status === 'active') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate + 'T00:00:00');
    const diff = target.getTime() - today.getTime();
    daysUntilTarget = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return {
    goalId,
    goalName,
    currentAmount,
    targetAmount,
    remaining,
    progressPercent,
    status,
    daysUntilTarget,
  };
}

/**
 * Check if goal is "on track" — progress >= expected by date.
 * For goals with target_date: expected progress = (days elapsed / total days) * 100.
 * For goals without target_date: consider on track if progressPercent > 0.
 */
export function isGoalOnTrack(
  progressPercent: number,
  targetDate: string | null,
  startDate: string
): boolean {
  if (!targetDate) return progressPercent > 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(targetDate + 'T00:00:00');
  const totalDays = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const elapsed = Math.max(0, (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const expectedProgress = (elapsed / totalDays) * 100;

  return progressPercent >= expectedProgress - 5; // 5% tolerance
}
