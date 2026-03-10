/**
 * useBudgetProgress — fetch budget progress for a month.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useBudgets } from './useBudgets';
import { useCategories } from './useCategories';
import { budgetsService } from '@/services/budgets';
import type { BudgetProgress } from '@/types/database';

export function useBudgetProgress(month: string) {
  const { user } = useAuth();
  const { budgets, loading: budgetsLoading, refetch: refetchBudgets } = useBudgets(month);
  const { categories } = useCategories();
  const [progress, setProgress] = useState<BudgetProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    await refetchBudgets();
    // useEffect will re-run when budgets change
  }, [refetchBudgets]);

  useEffect(() => {
    if (!user?.id || budgets.length === 0) {
      setProgress([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    budgetsService
      .getBudgetProgress(user.id, month, categories, budgets)
      .then((list) => {
        if (!cancelled) setProgress(list);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load progress.');
          setProgress([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.id, month, categories, budgets]);

  return { progress, loading: budgetsLoading || loading, error, refetch };
}
