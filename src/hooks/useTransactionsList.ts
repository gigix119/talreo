/**
 * useTransactionsList — filters, search, date range, category map.
 */
import { useMemo, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useTransactions } from './useTransactions';
import { useCategories } from './useCategories';
import { transactionsService } from '@/services/transactions';
import { getMonthRange } from '@/utils/date';
import { getRecurringNoteSet } from '@/utils/recurringDetector';
import type { Transaction } from '@/types/database';
import type { TypeFilter, DateFilter } from '@/components/transactions/TransactionsFilters';

function getDateRange(dateFilter: DateFilter): { fromDate?: string; toDate?: string } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  switch (dateFilter) {
    case '7d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { fromDate: d.toISOString().slice(0, 10), toDate: today };
    }
    case '30d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return { fromDate: d.toISOString().slice(0, 10), toDate: today };
    }
    case 'month': {
      const { fromDate, toDate } = getMonthRange(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      );
      return { fromDate, toDate };
    }
    default:
      return {};
  }
}

export function useTransactionsList() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const currency = (profile?.currency ?? 'PLN') as import('@/types/database').Currency;

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const dateRange = useMemo(() => getDateRange(dateFilter), [dateFilter]);

  const { transactions, loading, error, refetch, deleteTransaction } = useTransactions({
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    type: typeFilter === 'all' ? undefined : typeFilter,
    categoryId: categoryId ?? undefined,
    search: search.trim() || undefined,
    sort: 'newest',
    limit: 500,
  });

  const { categories: expenseCats } = useCategories('expense');
  const { categories: incomeCats } = useCategories('income');
  const categories = useMemo(() => {
    if (typeFilter === 'expense') return expenseCats;
    if (typeFilter === 'income') return incomeCats;
    return [...expenseCats, ...incomeCats];
  }, [typeFilter, expenseCats, incomeCats]);
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filteredBySearch = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      const note = (t.note ?? '').toLowerCase();
      const catName = (categoryMap.get(t.category_id ?? '') ?? '').toLowerCase();
      const amountStr = String(t.amount);
      return note.includes(q) || catName.includes(q) || amountStr.includes(q);
    });
  }, [transactions, search, categoryMap]);

  const withCategoryName = useMemo(
    () =>
      filteredBySearch.map((t) => ({
        ...t,
        categoryName: categoryMap.get(t.category_id ?? '') ?? '—',
      })),
    [filteredBySearch, categoryMap]
  );

  const recurringNoteSet = useMemo(
    () => getRecurringNoteSet(transactions),
    [transactions]
  );

  const totalExpensesThisMonth = useMemo(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let total = 0;
    for (const t of transactions) {
      if (!t.transaction_date.startsWith(monthStr)) continue;
      if (t.type === 'expense') total += Number(t.amount);
    }
    return total;
  }, [transactions]);

  const categoryTotalsThisMonth = useMemo(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (!t.transaction_date.startsWith(monthStr)) continue;
      const amt = Number(t.amount);
      const catId = t.category_id ?? '_none';
      map.set(catId, (map.get(catId) ?? 0) + amt);
    }
    return map;
  }, [transactions]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of withCategoryName) {
      const amt = Number(t.amount);
      if (t.type === 'income') income += amt;
      else expense += amt;
    }
    return { income, expense };
  }, [withCategoryName]);

  const periodLabel = useMemo(() => {
    switch (dateFilter) {
      case '7d': return 'transactions.summaryLast7Days';
      case '30d': return 'transactions.summaryLast30Days';
      case 'month': return 'transactions.summaryThisMonth';
      default: return 'transactions.summaryAll';
    }
  }, [dateFilter]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      await deleteTransaction(id);
    },
    [user?.id, deleteTransaction]
  );

  return {
    transactions: withCategoryName,
    recurringNoteSet,
    categoryTotalsThisMonth,
    totalExpensesThisMonth,
    summary,
    periodLabel,
    loading,
    error,
    refetch,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    dateFilter,
    setDateFilter,
    categoryId,
    setCategoryId,
    categories,
    currency,
    deleteTransaction: handleDelete,
  };
}
