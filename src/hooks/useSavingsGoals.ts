/**
 * useSavingsGoals — fetch, create, update, delete, add/subtract funds.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { savingsGoalsService } from '@/services/savingsGoals';
import type {
  SavingsGoalWithStatus,
  SavingsGoalInsert,
  SavingsGoalUpdate,
} from '@/types/database';

export function useSavingsGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoalWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user?.id) {
      setGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await savingsGoalsService.getSavingsGoals(user.id);
      setGoals(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load goals.');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createSavingsGoal = useCallback(
    async (g: SavingsGoalInsert) => {
      if (!user?.id) return null;
      const created = await savingsGoalsService.createSavingsGoal(user.id, g);
      await refetch();
      return created;
    },
    [user?.id, refetch]
  );

  const updateSavingsGoal = useCallback(
    async (id: string, u: SavingsGoalUpdate) => {
      if (!user?.id) return null;
      const updated = await savingsGoalsService.updateSavingsGoal(user.id, id, u);
      await refetch();
      return updated;
    },
    [user?.id, refetch]
  );

  const deleteSavingsGoal = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      await savingsGoalsService.deleteSavingsGoal(user.id, id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    },
    [user?.id]
  );

  const addFundsToGoal = useCallback(
    async (goalId: string, amount: number) => {
      if (!user?.id) return null;
      const updated = await savingsGoalsService.addFundsToGoal(user.id, goalId, amount);
      await refetch();
      return updated;
    },
    [user?.id, refetch]
  );

  const subtractFundsFromGoal = useCallback(
    async (goalId: string, amount: number) => {
      if (!user?.id) return null;
      const updated = await savingsGoalsService.subtractFundsFromGoal(user.id, goalId, amount);
      await refetch();
      return updated;
    },
    [user?.id, refetch]
  );

  return {
    goals,
    loading,
    error,
    refetch,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addFundsToGoal,
    subtractFundsFromGoal,
  };
}
