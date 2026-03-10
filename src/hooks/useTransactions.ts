/**
 * useTransactions — fetch, create, delete transactions.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { transactionsService } from '@/services/transactions';
import type { Transaction, TransactionInsert } from '@/types/database';
import type { GetTransactionsOptions } from '@/services/transactions';

export function useTransactions(options?: GetTransactionsOptions) {
  const { user } = useAuth();
  const { limit, fromDate, toDate, type, categoryId, search, sort } = options ?? {};
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user?.id) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await transactionsService.getTransactions(user.id, {
        limit,
        fromDate,
        toDate,
        type,
        categoryId,
        search,
        sort,
      });
      setTransactions(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load transactions.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, limit, fromDate, toDate, type, categoryId, search, sort]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createTransaction = useCallback(
    async (tx: TransactionInsert): Promise<Transaction | null> => {
      if (!user?.id) return null;
      const created = await transactionsService.createTransaction(user.id, tx);
      setTransactions((prev) => [created!, ...prev]);
      return created;
    },
    [user?.id]
  );

  const deleteTransaction = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) throw new Error('User not authenticated.');
      await transactionsService.deleteTransaction(user.id, id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    },
    [user?.id]
  );

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = income - expense;

  return {
    transactions,
    loading,
    error,
    refetch,
    createTransaction,
    deleteTransaction,
    income,
    expense,
    balance,
  };
}
