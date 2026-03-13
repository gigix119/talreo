/**
 * Category trend insights: top category, notable growth, budget approach.
 * Polish: najwięcej wydajesz na X, kategoria Y zbliża się do limitu, Transport wzrósł.
 */
import type { FinancialInsight } from '../types';
import type { InsightEngineInput } from '../inputTypes';
import type { CategoryTotal } from '../../types';

export function generateCategoryTrendInsights(input: InsightEngineInput): FinancialInsight[] {
  const { categoryTotals, budgetUsage } = input;
  const insights: FinancialInsight[] = [];

  if (categoryTotals.length === 0) return insights;

  // Top spending category
  const top = categoryTotals[0];
  if (top && top.amount > 0) {
    insights.push({
      id: 'category-trend-top',
      type: 'category_trend',
      severity: 'neutral',
      title: 'Największa kategoria wydatków',
      description: `Najwięcej wydajesz na ${top.categoryName}.`,
      relatedCategoryId: top.categoryId,
      value: top.amount,
    });
  }

  // Category approaching budget (warning state) — avoid duplicating budget_alert; here we phrase as "trend"
  const approaching = budgetUsage.filter((b) => b.isWarning);
  for (const b of approaching.slice(0, 2)) {
    insights.push({
      id: `category-trend-approach-${b.categoryId}`,
      type: 'category_trend',
      severity: 'warning',
      title: 'Zbliżasz się do limitu',
      description: `Kategoria ${b.categoryName} zbliża się do przekroczenia budżetu.`,
      relatedCategoryId: b.categoryId,
      relatedBudgetId: b.categoryId,
      value: b.usagePercent,
      valueUnit: '%',
    });
  }

  return insights;
}
