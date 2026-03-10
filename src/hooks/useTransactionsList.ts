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

  const handleDelete = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      await deleteTransaction(id);
    },
    [user?.id, deleteTransaction]
  );

  return {
    transactions: withCategoryName,
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
