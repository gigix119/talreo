/**
 * Zdrowie finansowe — grounded interpretation from savings, budgets, goals.
 * Avoid synthetic "score" language; focus on what matters.
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
  const positiveBalance = summary.balance > 0;
  const exceededNum = input.budgetUsage.filter((b) => b.isExceeded).length;
  const warningNum = input.budgetUsage.filter((b) => b.isWarning).length;

  let description: string;
  if (exceededNum > 0) {
    description =
      exceededNum === 1
        ? 'Jedna kategoria przekracza limit. Warto dostosować budżet lub ograniczyć wydatki.'
        : `${exceededNum} kategorie przekraczają limit. Przejrzyj budżety.`;
  } else if (warningNum > 0) {
    description = `${warningNum} ${warningNum === 1 ? 'kategoria zbliża się' : 'kategorie zbliżają się'} do limitu.`;
  } else if (positiveBalance && input.budgetUsage.length > 0) {
    description = 'Dodatnie saldo i budżety pod kontrolą.';
  } else if (positiveBalance) {
    description = 'Dodatnie saldo. Rozważ ustawienie budżetów dla lepszej kontroli.';
  } else {
    description = health.grade === 'poor' ? 'Wydatki przewyższają przychody. Skup się na redukcji wydatków.' : `${gradeLabel} — kontynuuj śledzenie.`;
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
