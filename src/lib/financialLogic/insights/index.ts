/**
 * Premium Polish financial insight engine for Talreo.
 * Consumed by Dashboard, Analytics, Budgets, Goals.
 */

export type {
  FinancialInsight,
  InsightSeverity,
  InsightType,
} from './types';
export { INSIGHT_SEVERITY_ORDER } from './types';

export type { InsightEngineInput } from './inputTypes';
export type { BuildInsightsResult } from './buildInsights';
export type { InsightScreen } from './groups';

export { buildInsights } from './buildInsights';
export { prioritizeInsights } from './prioritize';
export { getInsightsForScreen } from './groups';
export { formatAmountForInsight } from './formatCurrency';
