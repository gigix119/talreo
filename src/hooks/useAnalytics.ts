/**
 * useAnalytics — category breakdown, monthly trend, budget vs actual.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { analyticsService } from '@/services/analytics';
import type {
  CategoryBreakdownItem,
  MonthlyTrendItem,
  BudgetVsActualItem,
} from '@/types/database';

export function useAnalytics(month: string, monthCount: number = 6) {
  const { user } = useAuth();
  const [expenseBreakdown, setExpenseBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [trend, setTrend] = useState<MonthlyTrendItem[]>([]);
  const [budgetVsActual, setBudgetVsActual] = useState<BudgetVsActualItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user?.id) {
      setExpenseBreakdown([]);
      setIncomeBreakdown([]);
      setTrend([]);
      setBudgetVsActual([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [exp, inc, tr, bva] = await Promise.all([
        analyticsService.getMonthlyCategoryBreakdown(user.id, month, 'expense'),
        analyticsService.getMonthlyCategoryBreakdown(user.id, month, 'income'),
        analyticsService.getMonthlyTrend(user.id, monthCount),
        analyticsService.getBudgetVsActual(user.id, month),
      ]);
      setExpenseBreakdown(exp);
      setIncomeBreakdown(inc);
      setTrend(tr);
      setBudgetVsActual(bva);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load analytics.');
      setExpenseBreakdown([]);
      setIncomeBreakdown([]);
      setTrend([]);
      setBudgetVsActual([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, month, monthCount]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    expenseBreakdown,
    incomeBreakdown,
    trend,
    budgetVsActual,
    loading,
    error,
    refetch,
  };
}
