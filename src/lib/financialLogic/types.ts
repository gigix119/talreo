/**
 * Financial logic output types — optimized for UI consumption.
 * All amounts in base units (e.g. PLN cents or standard currency units).
 */

/** Monthly summary: income, expense, balance */
export interface MonthlyFinancialSummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

/** Single category total */
export interface CategoryTotal {
  categoryId: string | null;
  categoryName: string;
  amount: number;
  percentOfTotal: number;
  transactionCount: number;
}

/** Category aggregation result */
export interface CategoryAggregationResult {
  totals: CategoryTotal[];
  totalAmount: number;
  type: 'expense' | 'income';
}

/** Budget usage states for UI (ok, warning, exceeded) */
export type BudgetUsageState = 'ok' | 'warning' | 'exceeded';

/** Budget usage result — spent, limit, percentage, state */
export interface BudgetUsageResult {
  categoryId: string;
  categoryName: string;
  spentAmount: number;
  limitAmount: number;
  remainingAmount: number;
  usagePercent: number;
  state: BudgetUsageState;
  /** true when usagePercent >= 100 */
  isExceeded: boolean;
  /** true when usagePercent >= 80 and < 100 */
  isWarning: boolean;
}

/** Financial health score (0–100) */
export interface FinancialHealthScoreResult {
  score: number;
  grade: 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'poor';
  factors: FinancialHealthFactor[];
}

export interface FinancialHealthFactor {
  id: string;
  label: string;
  score: number;
  weight: number;
  description: string;
}

/** Spending trend for a time period */
export interface SpendingTrend {
  period: string;
  amount: number;
  changeFromPrev: number | null;
  changePercent: number | null;
}

/** Spending velocity — daily average, forecast for month */
export interface SpendingVelocityResult {
  dailyAverage: number;
  forecastThisMonth: number;
  daysElapsed: number;
  daysInMonth: number;
  spentSoFar: number;
  onTrack: boolean;
}

/** Goal progress result */
export interface GoalProgressResult {
  goalId: string;
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  remaining: number;
  progressPercent: number;
  status: 'active' | 'completed' | 'overdue';
  /** Days until target_date (null if no date or completed) */
  daysUntilTarget: number | null;
}
