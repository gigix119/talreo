/**
 * Monthly financial summary — income, expense, balance.
 * Pure functions; no database access.
 */
import type { Transaction } from '@/types/database';
import type { MonthlyFinancialSummary } from './types';

export function computeMonthlySummary(
  transactions: Transaction[],
  month: string
): MonthlyFinancialSummary {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);
  return {
    month,
    income,
    expense,
    balance: income - expense,
  };
}

/** Aggregate multiple months into summary array (sorted by month ascending) */
export function computeMonthlySummaries(
  monthlyTransactions: { month: string; transactions: Transaction[] }[]
): MonthlyFinancialSummary[] {
  return monthlyTransactions
    .map(({ month, transactions }) => computeMonthlySummary(transactions, month))
    .sort((a, b) => a.month.localeCompare(b.month));
}
