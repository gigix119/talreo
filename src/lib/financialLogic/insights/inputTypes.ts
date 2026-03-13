/**
 * Input data shape for the insight engine.
 * Services (e.g. analytics) gather this and pass to buildInsights().
 */
import type { Currency } from '@/types/database';
import type {
  MonthlyFinancialSummary,
  CategoryTotal,
  BudgetUsageResult,
  SpendingVelocityResult,
  FinancialHealthScoreResult,
  GoalProgressResult,
  SpendingTrend,
} from '../types';

export interface InsightEngineInput {
  /** Current month (YYYY-MM-01) */
  month: string;
  /** User's currency */
  currency: Currency;
  /** Current month summary */
  summary: MonthlyFinancialSummary;
  /** Previous month summary (for month-to-month change) */
  summaryPrev: MonthlyFinancialSummary | null;
  /** Expense category totals for current month (sorted by amount desc) */
  categoryTotals: CategoryTotal[];
  /** Budget usage for current month */
  budgetUsage: BudgetUsageResult[];
  /** Spending velocity for current month */
  velocity: SpendingVelocityResult;
  /** Financial health score result */
  health: FinancialHealthScoreResult;
  /** Goal progress for active/completed goals */
  goalProgress: GoalProgressResult[];
  /** Last N months spending trends (includes current) */
  spendingTrends: SpendingTrend[];
}
