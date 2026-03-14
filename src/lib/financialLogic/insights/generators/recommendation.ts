/**
 * General recommendation insights (actionable next steps).
 * Polish: short, practical suggestions.
 */
import type { FinancialInsight } from '../types';
import type { InsightEngineInput } from '../inputTypes';

export function generateRecommendationInsights(input: InsightEngineInput): FinancialInsight[] {
  const { summary, budgetUsage, goalProgress, categoryTotals } = input;
  const insights: FinancialInsight[] = [];

  // Recommend reviewing top category if it dominates
  if (categoryTotals.length >= 1 && summary.expense > 0) {
    const top = categoryTotals[0];
    const share = (top!.amount / summary.expense) * 100;
    if (share >= 40) {
      insights.push({
        id: 'recommendation-top-category',
        type: 'recommendation',
        severity: 'neutral',
        title: 'Skupienie wydatków',
        description: `${top!.categoryName}: ${Math.round(share)}% wydatków.`,
        relatedCategoryId: top!.categoryId,
        ctaLabel: 'Analityki',
        ctaAction: 'analytics',
      });
    }
  }

  // Recommend setting budgets if none
  if (budgetUsage.length === 0 && summary.expense > 0) {
    insights.push({
      id: 'recommendation-set-budgets',
      type: 'recommendation',
      severity: 'neutral',
      title: 'Ustaw budżety',
      description: 'Ustaw limity — lepsza kontrola wydatków.',
      ctaLabel: 'Budżety',
      ctaAction: 'budgets',
    });
  }

  // Recommend a goal if no active goals and positive balance
  if (goalProgress.filter((g) => g.status === 'active').length === 0 && summary.balance > 0) {
    insights.push({
      id: 'recommendation-set-goal',
      type: 'recommendation',
      severity: 'neutral',
      title: 'Cel oszczędnościowy',
      description: 'Saldo dodatnie — rozważ cel oszczędnościowy.',
      ctaLabel: 'Cele',
      ctaAction: 'goals',
    });
  }

  return insights;
}
