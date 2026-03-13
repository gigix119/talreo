/**
 * Insight prioritization: danger > warning > positive > neutral.
 * Used to order insights for display.
 */
import type { FinancialInsight } from './types';
import { INSIGHT_SEVERITY_ORDER } from './types';

export function prioritizeInsights(insights: FinancialInsight[]): FinancialInsight[] {
  return [...insights].sort((a, b) => {
    const orderA = INSIGHT_SEVERITY_ORDER[a.severity];
    const orderB = INSIGHT_SEVERITY_ORDER[b.severity];
    if (orderA !== orderB) return orderA - orderB;
    return 0;
  });
}
