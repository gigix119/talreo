/**
 * Budget usage — spent/limit, percentage, warning states.
 * Pure functions; no database access.
 */
import type { BudgetUsageState, BudgetUsageResult } from './types';

/** Thresholds for budget warning (80%) and exceeded (100%) */
export const BUDGET_WARNING_THRESHOLD = 80;
export const BUDGET_EXCEEDED_THRESHOLD = 100;

export function getBudgetUsageState(usagePercent: number): BudgetUsageState {
  if (usagePercent >= BUDGET_EXCEEDED_THRESHOLD) return 'exceeded';
  if (usagePercent >= BUDGET_WARNING_THRESHOLD) return 'warning';
  return 'ok';
}

export function computeBudgetUsage(
  categoryId: string,
  categoryName: string,
  spentAmount: number,
  limitAmount: number
): BudgetUsageResult {
  const remaining = Math.max(0, limitAmount - spentAmount);
  const usagePercent = limitAmount > 0 ? (spentAmount / limitAmount) * 100 : 0;
  const state = getBudgetUsageState(usagePercent);

  return {
    categoryId,
    categoryName,
    spentAmount,
    limitAmount,
    remainingAmount: remaining,
    usagePercent,
    state,
    isExceeded: usagePercent >= BUDGET_EXCEEDED_THRESHOLD,
    isWarning: usagePercent >= BUDGET_WARNING_THRESHOLD && usagePercent < BUDGET_EXCEEDED_THRESHOLD,
  };
}

/** Batch compute budget usage for multiple budgets */
export function computeBudgetUsageBatch(
  items: { categoryId: string; categoryName: string; spentAmount: number; limitAmount: number }[]
): BudgetUsageResult[] {
  return items.map(({ categoryId, categoryName, spentAmount, limitAmount }) =>
    computeBudgetUsage(categoryId, categoryName, spentAmount, limitAmount)
  );
}
