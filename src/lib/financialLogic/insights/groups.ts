/**
 * Insight groups per screen: dashboard, analytics, budgets, goals.
 * Each group defines which insight types belong and optional limits.
 */
import type { FinancialInsight, InsightType } from './types';

export type InsightScreen = 'dashboard' | 'analytics' | 'budgets' | 'goals';

const DASHBOARD_TYPES: InsightType[] = [
  'monthly_change',
  'budget_alert',
  'health_score',
  'category_trend',
  'momentum',
  'recommendation',
];

const ANALYTICS_TYPES: InsightType[] = [
  'monthly_change',
  'category_trend',
  'momentum',
  'health_score',
  'budget_alert',
  'recommendation',
];

const BUDGETS_TYPES: InsightType[] = ['budget_alert', 'category_trend'];

const GOALS_TYPES: InsightType[] = ['goal_progress', 'recommendation'];

/** Max insights per screen to avoid clutter */
const LIMITS: Record<InsightScreen, number> = {
  dashboard: 5,
  analytics: 12,
  budgets: 15,
  goals: 10,
};

export function getInsightsForScreen(
  allInsights: FinancialInsight[],
  screen: InsightScreen
): FinancialInsight[] {
  const allowed =
    screen === 'dashboard'
      ? DASHBOARD_TYPES
      : screen === 'analytics'
        ? ANALYTICS_TYPES
        : screen === 'budgets'
          ? BUDGETS_TYPES
          : GOALS_TYPES;

  const filtered = allInsights.filter((i) => allowed.includes(i.type));
  const limit = LIMITS[screen];
  return filtered.slice(0, limit);
}
