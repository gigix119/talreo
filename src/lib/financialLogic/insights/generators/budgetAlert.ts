/**
 * Budget alert insights: exceeded, warning (days to exceed), healthy.
 * Polish: przekroczono budżet, przy obecnym tempie przekroczysz za X dni, budżet pod kontrolą.
 */
import type { FinancialInsight } from '../types';
import type { InsightEngineInput } from '../inputTypes';
import { formatAmountForInsight } from '../formatCurrency';
import { getDaysElapsedInMonth, getDaysInMonth } from '@/utils/date';

export function generateBudgetAlertInsights(input: InsightEngineInput): FinancialInsight[] {
  const { budgetUsage, velocity, currency, month } = input;
  const insights: FinancialInsight[] = [];

  if (budgetUsage.length === 0) return insights;

  const daysElapsed = getDaysElapsedInMonth(month);
  const daysInMonth = getDaysInMonth(month);
  const daysLeft = Math.max(0, daysInMonth - daysElapsed);

  for (const b of budgetUsage) {
    if (b.isExceeded) {
      const over = b.spentAmount - b.limitAmount;
      insights.push({
        id: `budget-alert-exceeded-${b.categoryId}`,
        type: 'budget_alert',
        severity: 'danger',
        title: 'Przekroczono budżet',
        description: `Przekroczyłeś budżet kategorii ${b.categoryName} o ${formatAmountForInsight(over, currency)}.`,
        relatedCategoryId: b.categoryId,
        relatedBudgetId: b.categoryId,
        value: over,
        valueUnit: currency,
        ctaLabel: 'Zobacz budżety',
        ctaAction: 'budgets',
      });
    } else if (b.isWarning) {
      // Estimate days until exceed at this category's daily rate (spent so far / days elapsed)
      const categoryDailyRate = daysElapsed > 0 && b.spentAmount >= 0 ? b.spentAmount / daysElapsed : 0;
      let daysToExceed: number | null = null;
      if (categoryDailyRate > 0 && b.remainingAmount > 0) {
        daysToExceed = Math.ceil(b.remainingAmount / categoryDailyRate);
      }
      const dayWord = daysToExceed === 1 ? 'dzień' : 'dni';
      const daysText =
        daysToExceed != null && daysToExceed <= daysLeft && daysToExceed >= 1
          ? ` Przy obecnym tempie przekroczysz budżet za ${daysToExceed} ${dayWord}.`
          : '';

      insights.push({
        id: `budget-alert-warning-${b.categoryId}`,
        type: 'budget_alert',
        severity: 'warning',
        title: 'Zbliżasz się do limitu',
        description: `Kategoria ${b.categoryName} zbliża się do przekroczenia budżetu.${daysText}`.trim(),
        relatedCategoryId: b.categoryId,
        relatedBudgetId: b.categoryId,
        value: b.usagePercent,
        valueUnit: '%',
        ctaLabel: 'Zobacz budżety',
        ctaAction: 'budgets',
      });
    }
  }

  // One "under control" insight if all budgets are ok
  const allOk = budgetUsage.every((b) => !b.isExceeded && !b.isWarning);
  if (allOk && budgetUsage.length > 0) {
    insights.push({
      id: 'budget-alert-healthy',
      type: 'budget_alert',
      severity: 'positive',
      title: 'Budżety pod kontrolą',
      description: 'Wszystkie budżety pozostają pod kontrolą.',
      ctaLabel: 'Zobacz budżety',
      ctaAction: 'budgets',
    });
  }

  return insights;
}
