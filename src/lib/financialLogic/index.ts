/**
 * Financial logic — pure business logic for Talreo.
 * No UI, no Supabase. Consumed by services and UI.
 */

// Types
export type {
  MonthlyFinancialSummary,
  CategoryTotal,
  CategoryAggregationResult,
  BudgetUsageState,
  BudgetUsageResult,
  FinancialHealthScoreResult,
  FinancialHealthFactor,
  SpendingTrend,
  SpendingVelocityResult,
  GoalProgressResult,
} from './types';

// Monthly summary
export {
  computeMonthlySummary,
  computeMonthlySummaries,
} from './monthlySummary';

// Category aggregation
export {
  aggregateByCategory,
  type CategoryNameMap,
} from './categoryAggregation';

// Budget usage
export {
  getBudgetUsageState,
  computeBudgetUsage,
  computeBudgetUsageBatch,
  BUDGET_WARNING_THRESHOLD,
  BUDGET_EXCEEDED_THRESHOLD,
} from './budgetUsage';

// Financial health score
export {
  computeFinancialHealthScore,
  type FinancialHealthInput,
  type HealthGrade,
} from './financialHealthScore';

// Spending trends
export {
  computeSpendingTrends,
  computeSpendingVelocity,
  computeExpenseChangePercent,
} from './spendingTrends';

// Goal progress
export {
  getGoalStatus,
  computeGoalProgress,
  isGoalOnTrack,
  type GoalStatus,
} from './goalProgress';

// Premium insights (Polish, dashboard/analytics/budgets/goals)
export {
  buildInsights,
  prioritizeInsights,
  getInsightsForScreen,
  formatAmountForInsight,
  type FinancialInsight,
  type InsightSeverity,
  type InsightType,
  type InsightEngineInput,
  type BuildInsightsResult,
  type InsightScreen,
} from './insights';
export { INSIGHT_SEVERITY_ORDER } from './insights';
export { getExampleInsightInput, getExampleInsightOutput, EXAMPLE_POLISH_INSIGHTS } from './insights/exampleInsights';
