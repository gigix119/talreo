/**
 * Financial health score interpretation insights.
 * Polish: wynik zdrowia finansowego, dodatnie saldo i dobra kontrola, jedna kategoria przekracza limit.
 */
import type { FinancialInsight } from '../types';
import type { InsightEngineInput } from '../inputTypes';

const GRADE_LABELS: Record<string, string> = {
  excellent: 'Świetny',
  good: 'Dobry',
  fair: 'Poprawny',
  needs_improvement: 'Wymaga poprawy',
  poor: 'Słaby',
};

export function generateHealthScoreInsights(input: InsightEngineInput): FinancialInsight[] {
  const { health, summary } = input;
  const insights: FinancialInsight[] = [];

  const gradeLabel = GRADE_LABELS[health.grade] ?? health.grade;

  // Main health summary
  const positiveBalance = summary.balance > 0;
  const exceededNum = input.budgetUsage.filter((b) => b.isExceeded).length;
  let description: string;

  if (health.grade === 'excellent' || health.grade === 'good') {
    description = positiveBalance
      ? `Twój wynik zdrowia finansowego (${gradeLabel}) wynika z dodatniego salda i dobrej kontroli budżetów.`
      : `Twój wynik zdrowia finansowego to ${gradeLabel}. Popraw saldo, aby go podnieść.`;
  } else if (exceededNum > 0) {
    description =
      exceededNum === 1
        ? 'Jedna kategoria przekracza limit, ale saldo netto nadal może być dodatnie.'
        : `${exceededNum} kategorie przekraczają limit. Warto je skorygować.`;
  } else {
    const trendFactor = health.factors.find((f) => f.id === 'spending_trend');
    const trendDesc = trendFactor?.description ?? '';
    description = trendDesc || `Wynik zdrowia finansowego: ${gradeLabel}.`;
  }

  insights.push({
    id: 'health-score-main',
    type: 'health_score',
    severity: health.grade === 'poor' || health.grade === 'needs_improvement' ? 'warning' : 'positive',
    title: `Zdrowie finansowe: ${gradeLabel}`,
    description,
    value: health.score,
    valueUnit: 'pts',
  });

  return insights;
}
