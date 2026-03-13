/**
 * transactionInsights — generate contextual insight text from transaction data.
 */
import type { Currency } from '@/types/database';

export interface InsightContext {
  categoryName: string;
  amount: number;
  currency: Currency;
  isExpense: boolean;
  totalExpensesThisMonth?: number;
  totalExpensesLastMonth?: number;
  totalExpensesThisWeek?: number;
}

export interface TransactionInsight {
  primaryText: string;
  secondaryText?: string;
}

/**
 * Generate human-readable insight text.
 * E.g. "You spent 320 zł on food this week" or "Food spending increased 18% vs last month"
 */
export function getTransactionInsight(ctx: InsightContext): TransactionInsight {
  const { categoryName, amount, currency, isExpense } = ctx;

  if (ctx.totalExpensesThisWeek != null && ctx.totalExpensesThisWeek > 0 && isExpense) {
    const percent = Math.round((amount / ctx.totalExpensesThisWeek) * 100);
    return {
      primaryText: formatAmountForInsight(amount, currency),
      secondaryText: percent > 0 ? `${percent}% wydatków w tym tygodniu` : undefined,
    };
  }

  if (
    ctx.totalExpensesThisMonth != null &&
    ctx.totalExpensesLastMonth != null &&
    ctx.totalExpensesLastMonth > 0 &&
    isExpense
  ) {
    const change = ctx.totalExpensesThisMonth - ctx.totalExpensesLastMonth;
    const changePercent = Math.round((change / ctx.totalExpensesLastMonth) * 100);
    if (Math.abs(changePercent) >= 5) {
      const dir = changePercent > 0 ? 'wzrosły' : 'spadły';
      return {
        primaryText: formatAmountForInsight(amount, currency),
        secondaryText: `Wydatki ${dir} o ${Math.abs(changePercent)}% vs zeszły miesiąc`,
      };
    }
  }

  return {
    primaryText: formatAmountForInsight(amount, currency),
    secondaryText:
      ctx.totalExpensesThisMonth != null &&
      ctx.totalExpensesThisMonth > 0 &&
      isExpense
        ? `${Math.round((amount / ctx.totalExpensesThisMonth) * 100)}% wydatków w tym miesiącu`
        : undefined,
  };
}

function formatAmountForInsight(amount: number, currency: Currency): string {
  const sym = currency === 'PLN' ? 'zł' : currency === 'EUR' ? '€' : '$';
  const formatted = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${sym}`;
}
