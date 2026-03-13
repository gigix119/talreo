/**
 * Category spending aggregation — totals per category.
 * Pure functions; no database access.
 */
import type { Transaction } from '@/types/database';
import type { CategoryTotal, CategoryAggregationResult } from './types';

export interface CategoryNameMap {
  [categoryId: string]: string;
}

/**
 * Aggregate transactions by category for a single type (expense or income).
 * Uses categoryNameMap for display names; unknown categories get "Unknown".
 */
export function aggregateByCategory(
  transactions: Transaction[],
  type: 'expense' | 'income',
  categoryNameMap: CategoryNameMap
): CategoryAggregationResult {
  const filtered = transactions.filter((t) => t.type === type);
  const totalAmount = filtered.reduce((s, t) => s + Number(t.amount), 0);

  const byCategory = new Map<string, { amount: number; count: number }>();
  for (const t of filtered) {
    const cid = t.category_id ?? '__uncategorized';
    const name = cid === '__uncategorized' ? 'Bez kategorii' : (categoryNameMap[cid] ?? 'Nieznana');
    const key = cid;
    const existing = byCategory.get(key) ?? { amount: 0, count: 0 };
    byCategory.set(key, {
      amount: existing.amount + Number(t.amount),
      count: existing.count + 1,
    });
  }

  const totals: CategoryTotal[] = [];
  for (const [cid, { amount, count }] of byCategory.entries()) {
    const categoryId = cid === '__uncategorized' ? null : cid;
    const categoryName = categoryId ? (categoryNameMap[categoryId] ?? 'Nieznana') : 'Bez kategorii';
    totals.push({
      categoryId,
      categoryName,
      amount,
      percentOfTotal: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      transactionCount: count,
    });
  }

  totals.sort((a, b) => b.amount - a.amount);

  return {
    totals,
    totalAmount,
    type,
  };
}
