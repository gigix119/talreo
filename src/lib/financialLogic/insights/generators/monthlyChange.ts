/**
 * Month-to-month change insights (expenses, income, balance).
 * Polish copy: wydatki wzrosły/spadły, przychody, saldo.
 */
import type { FinancialInsight } from '../types';
import type { InsightEngineInput } from '../inputTypes';
import { formatAmountForInsight } from '../formatCurrency';

function roundPercent(value: number): number {
  return Math.round(Math.abs(value));
}

export function generateMonthlyChangeInsights(input: InsightEngineInput): FinancialInsight[] {
  const { summary, summaryPrev, currency } = input;
  const insights: FinancialInsight[] = [];

  if (!summaryPrev) return insights;

  // Expense change
  if (summaryPrev.expense > 0) {
    const changePercent = ((summary.expense - summaryPrev.expense) / summaryPrev.expense) * 100;
    if (Math.abs(changePercent) >= 5) {
      const severity = changePercent > 0 ? 'warning' : 'positive';
      const direction =
        changePercent > 0
          ? `Twoje wydatki wzrosły o ${roundPercent(changePercent)}% względem poprzedniego miesiąca.`
          : `Twoje wydatki spadły o ${roundPercent(changePercent)}% względem poprzedniego miesiąca.`;
      insights.push({
        id: 'monthly-change-expense',
        type: 'monthly_change',
        severity,
        title: changePercent > 0 ? 'Wzrost wydatków' : 'Spadek wydatków',
        description: direction,
        value: changePercent,
        valueUnit: '%',
      });
    }
  }

  // Income change
  if (summaryPrev.income > 0) {
    const changePercent = ((summary.income - summaryPrev.income) / summaryPrev.income) * 100;
    if (Math.abs(changePercent) >= 5) {
      const severity = changePercent > 0 ? 'positive' : 'warning';
      const direction =
        changePercent > 0
          ? `Przychody wzrosły o ${roundPercent(changePercent)}% względem poprzedniego okresu.`
          : `Przychody spadły o ${roundPercent(changePercent)}% względem poprzedniego okresu.`;
      insights.push({
        id: 'monthly-change-income',
        type: 'monthly_change',
        severity,
        title: changePercent > 0 ? 'Wzrost przychodów' : 'Spadek przychodów',
        description: direction,
        value: changePercent,
        valueUnit: '%',
      });
    }
  }

  // Balance change (net flow)
  const balanceChange = summary.balance - summaryPrev.balance;
  if (Math.abs(balanceChange) >= 1) {
    const severity = balanceChange > 0 ? 'positive' : 'warning';
    const direction =
      balanceChange > 0
        ? `Saldo netto poprawiło się o ${formatAmountForInsight(balanceChange, currency)}.`
        : `Saldo netto pogorszyło się o ${formatAmountForInsight(Math.abs(balanceChange), currency)}.`;
    insights.push({
      id: 'monthly-change-balance',
      type: 'monthly_change',
      severity,
      title: balanceChange > 0 ? 'Lepsze saldo' : 'Gorsze saldo',
      description: direction,
      value: balanceChange,
      valueUnit: currency,
    });
  }

  return insights;
}
