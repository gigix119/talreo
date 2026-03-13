/**
 * Build all insights from engine input: run generators, prioritize, group.
 */
import type { FinancialInsight } from './types';
import type { InsightEngineInput } from './inputTypes';
import type { InsightScreen } from './groups';
import {
  generateMonthlyChangeInsights,
  generateCategoryTrendInsights,
  generateBudgetAlertInsights,
  generateMomentumInsights,
  generateHealthScoreInsights,
  generateGoalProgressInsights,
  generateRecommendationInsights,
} from './generators';
import { prioritizeInsights } from './prioritize';
import { getInsightsForScreen } from './groups';

export interface BuildInsightsResult {
  /** All insights, prioritized (danger > warning > positive > neutral) */
  all: FinancialInsight[];
  /** For dashboard: summary + warning/positive + recommendation */
  dashboard: FinancialInsight[];
  /** For analytics: deeper comparative + category + momentum + health */
  analytics: FinancialInsight[];
  /** For budgets: per-category alerts, forecast, healthy */
  budgets: FinancialInsight[];
  /** For goals: progress, behind-schedule, monthly recommendation */
  goals: FinancialInsight[];
}

export function buildInsights(input: InsightEngineInput): BuildInsightsResult {
  const batches = [
    ...generateMonthlyChangeInsights(input),
    ...generateCategoryTrendInsights(input),
    ...generateBudgetAlertInsights(input),
    ...generateMomentumInsights(input),
    ...generateHealthScoreInsights(input),
    ...generateGoalProgressInsights(input),
    ...generateRecommendationInsights(input),
  ];

  const byId = new Map<string, FinancialInsight>();
  for (const i of batches) {
    if (!byId.has(i.id)) byId.set(i.id, i);
  }
  const all = prioritizeInsights(Array.from(byId.values()));

  return {
    all,
    dashboard: getInsightsForScreen(all, 'dashboard'),
    analytics: getInsightsForScreen(all, 'analytics'),
    budgets: getInsightsForScreen(all, 'budgets'),
    goals: getInsightsForScreen(all, 'goals'),
  };
}
