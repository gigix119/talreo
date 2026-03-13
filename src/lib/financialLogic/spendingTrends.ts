/**
 * Spending trends — month-over-month changes, velocity.
 * Pure functions; no database access.
 */
import type { SpendingTrend, SpendingVelocityResult } from './types';

export interface MonthlyAmount {
  month: string;
  amount: number;
}

/**
 * Compute spending trends with change from previous period.
 * Input sorted by month ascending.
 */
export function computeSpendingTrends(monthlyAmounts: MonthlyAmount[]): SpendingTrend[] {
  const sorted = [...monthlyAmounts].sort((a, b) => a.month.localeCompare(b.month));
  return sorted.map((curr, i) => {
    const prev = i > 0 ? sorted[i - 1] : null;
    const changeFromPrev = prev ? curr.amount - prev.amount : null;
    const changePercent =
      prev != null && prev.amount !== 0
        ? (changeFromPrev! / prev.amount) * 100
        : null;
    return {
      period: curr.month,
      amount: curr.amount,
      changeFromPrev,
      changePercent,
    };
  });
}

/**
 * Compute spending velocity: daily average, forecast for rest of month.
 * Assumes current month and partial data.
 */
export function computeSpendingVelocity(
  spentSoFar: number,
  monthFirstDay: string,
  daysElapsed: number,
  daysInMonth: number
): SpendingVelocityResult {
  const dailyAverage = daysElapsed > 0 ? spentSoFar / daysElapsed : 0;
  const forecastThisMonth = daysInMonth > 0 ? dailyAverage * daysInMonth : spentSoFar;

  // "On track" = we have data and forecast is finite (UI may override with budget comparison)
  const onTrack = daysElapsed > 0 && Number.isFinite(forecastThisMonth);

  return {
    dailyAverage,
    forecastThisMonth,
    daysElapsed,
    daysInMonth,
    spentSoFar,
    onTrack,
  };
}

/**
 * Expense change vs previous month (percent).
 * Returns null if prevMonthAmount is 0 or missing.
 */
export function computeExpenseChangePercent(
  currentMonthAmount: number,
  prevMonthAmount: number
): number | null {
  if (prevMonthAmount === 0) return null;
  return ((currentMonthAmount - prevMonthAmount) / prevMonthAmount) * 100;
}
