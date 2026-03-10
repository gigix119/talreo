/**
 * useRecurringTransactions — fetch, create, update, delete, runCatchup.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { recurringTransactionsService } from '@/services/recurringTransactions';
import type {
  RecurringTransaction,
  RecurringTransactionInsert,
  RecurringTransactionUpdate,
} from '@/types/database';

export function useRecurringTransactions() {
  const { user } = useAuth();
  const [list, setList] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user?.id) {
      setList([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await recurringTransactionsService.getRecurringTransactions(user.id);
      setList(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load recurring transactions.');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createRecurringTransaction = useCallback(
    async (r: RecurringTransactionInsert): Promise<RecurringTransaction | null> => {
      if (!user?.id) return null;
      const created = await recurringTransactionsService.createRecurringTransaction(user.id, r);
      await refetch();
      return created;
    },
    [user?.id, refetch]
  );

  const updateRecurringTransaction = useCallback(
    async (id: string, u: RecurringTransactionUpdate): Promise<RecurringTransaction | null> => {
      if (!user?.id) return null;
      const updated = await recurringTransactionsService.updateRecurringTransaction(user.id, id, u);
      await refetch();
      return updated;
    },
    [user?.id, refetch]
  );

  const deleteRecurringTransaction = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) return;
      await recurringTransactionsService.deleteRecurringTransaction(user.id, id);
      setList((prev) => prev.filter((r) => r.id !== id));
    },
    [user?.id]
  );

  const runRecurringCatchup = useCallback(async (): Promise<number> => {
    if (!user?.id) return 0;
    const { generated } = await recurringTransactionsService.runRecurringCatchup(user.id);
    return generated;
  }, [user?.id]);

  return {
    recurringTransactions: list,
    loading,
    error,
    refetch,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    runRecurringCatchup,
  };
}
