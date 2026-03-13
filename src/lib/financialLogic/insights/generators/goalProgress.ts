/**
 * Goal progress insights: remaining amount, monthly savings recommendation, behind schedule.
 * Polish: do celu X brakuje Y zł, aby zdążyć na czas odkładaj Z zł miesięcznie.
 */
import type { FinancialInsight } from '../types';
import type { InsightEngineInput } from '../inputTypes';
import { formatAmountForInsight } from '../formatCurrency';

function getRemainingMonths(daysUntilTarget: number | null): number | null {
  if (daysUntilTarget == null || daysUntilTarget <= 0) return null;
  return Math.max(1, Math.ceil(daysUntilTarget / 30));
}

export function generateGoalProgressInsights(input: InsightEngineInput): FinancialInsight[] {
  const { goalProgress, currency } = input;
  const insights: FinancialInsight[] = [];

  for (const g of goalProgress) {
    if (g.status === 'completed') continue;

    insights.push({
      id: `goal-progress-remaining-${g.goalId}`,
      type: 'goal_progress',
      severity: g.status === 'overdue' ? 'warning' : 'neutral',
      title: `Cel: ${g.goalName}`,
      description: `Do osiągnięcia celu ${g.goalName} brakuje ${formatAmountForInsight(g.remaining, currency)}.`,
      relatedGoalId: g.goalId,
      value: g.remaining,
      valueUnit: currency,
      ctaLabel: 'Zobacz cele',
      ctaAction: 'goals',
    });

    // Monthly recommendation when target date exists
    if (g.daysUntilTarget != null && g.daysUntilTarget > 0 && g.remaining > 0) {
      const monthsLeft = getRemainingMonths(g.daysUntilTarget);
      if (monthsLeft != null && monthsLeft >= 1) {
        const monthlySuggested = Math.ceil(g.remaining / monthsLeft);
        insights.push({
          id: `goal-progress-monthly-${g.goalId}`,
          type: 'goal_progress',
          severity: 'neutral',
          title: 'Rekomendacja miesięczna',
          description: `Aby osiągnąć cel ${g.goalName} na czas, warto odkładać średnio ${formatAmountForInsight(monthlySuggested, currency)} miesięcznie.`,
          relatedGoalId: g.goalId,
          value: monthlySuggested,
          valueUnit: currency,
          ctaLabel: 'Zobacz cele',
          ctaAction: 'goals',
        });
      }
    }
  }

  return insights;
}
