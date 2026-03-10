/**
 * useBudgets — fetch, upsert, delete budgets.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { budgetsService } from '@/services/budgets';
import type { Budget, BudgetUpsert } from '@/types/database';

export function useBudgets(month: string) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user?.id) {
      setBudgets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await budgetsService.getBudgets(user.id, month);
      setBudgets(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load budgets.');
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, month]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const upsertBudget = useCallback(
    async (b: BudgetUpsert): Promise<Budget | null> => {
      if (!user?.id) return null;
      const saved = await budgetsService.upsertBudget(user.id, b);
      await refetch();
      return saved;
    },
    [user?.id, refetch]
  );

  const deleteBudget = useCallback(
    async (id: string): Promise<void> => {
      if (!user?.id) return;
      await budgetsService.deleteBudget(user.id, id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    },
    [user?.id]
  );

  return { budgets, loading, error, refetch, upsertBudget, deleteBudget };
}
