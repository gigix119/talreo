/**
 * useAnalyticsDashboard — full analytics with caching, filters, range comparison.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { analyticsService } from '@/services/analytics';
import { analyticsAdvancedService } from '@/services/analyticsAdvanced';
import type {
  CategoryBreakdownItem,
  MonthlyTrendItem,
  BudgetVsActualItem,
} from '@/types/database';
import type {
  RangeComparisonResult,
  CategoryDetails,
  CategoryPerformanceRow,
  HeatmapData,
  LargestExpense,
  SpendingVelocity,
  SmartInsight,
} from '@/types/analytics';
import { getFirstDayOfMonth } from '@/utils/date';

function addMonthsUtil(month: string, delta: number): string {
  const d = new Date(month + 'T00:00:00');
  d.setMonth(d.getMonth() + delta);
  return getFirstDayOfMonth(d.getFullYear(), d.getMonth());
}

const CACHE_TTL = 60_000; // 1 min
const cache = new Map<string, { data: unknown; ts: number }>();

function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as { data: T; ts: number } | undefined;
  if (hit && Date.now() - hit.ts < CACHE_TTL) return Promise.resolve(hit.data);
  return fetcher().then((data) => {
    cache.set(key, { data, ts: Date.now() });
    return data;
  });
}

export interface AnalyticsFilters {
  categoryIds: string[];
  type: 'all' | 'expense' | 'income';
}

export function useAnalyticsDashboard(
  month: string,
  monthCount: number = 6,
  filters: AnalyticsFilters = { categoryIds: [], type: 'all' }
) {
  const { user } = useAuth();
  const [expenseBreakdown, setExpenseBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [trend, setTrend] = useState<MonthlyTrendItem[]>([]);
  const [budgetVsActual, setBudgetVsActual] = useState<BudgetVsActualItem[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformanceRow[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [largestExpenses, setLargestExpenses] = useState<LargestExpense[]>([]);
  const [velocity, setVelocity] = useState<SpendingVelocity | null>(null);
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [rangeComparison, setRangeComparison] = useState<RangeComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const prevMonth = addMonthsUtil(month, -1);

  const refetch = useCallback(async () => {
    if (!user?.id) {
      setExpenseBreakdown([]);
      setIncomeBreakdown([]);
      setTrend([]);
      setBudgetVsActual([]);
      setCategoryPerformance([]);
      setHeatmap(null);
      setLargestExpenses([]);
      setVelocity(null);
      setInsights([]);
      setRangeComparison(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const uid = user.id;
    try {
      const [
        exp,
        inc,
        tr,
        bva,
        perf,
        hm,
        largest,
        vel,
        ins,
        range,
      ] = await Promise.all([
        getCached(`exp-${uid}-${month}`, () =>
          analyticsService.getMonthlyCategoryBreakdown(uid, month, 'expense')
        ),
        getCached(`inc-${uid}-${month}`, () =>
          analyticsService.getMonthlyCategoryBreakdown(uid, month, 'income')
        ),
        getCached(`trend-${uid}-${monthCount}`, () =>
          analyticsService.getMonthlyTrend(uid, monthCount)
        ),
        getCached(`bva-${uid}-${month}`, () =>
          analyticsService.getBudgetVsActual(uid, month)
        ),
        getCached(`perf-${uid}-${month}`, () =>
          analyticsAdvancedService.getCategoryPerformance(uid, month, prevMonth)
        ),
        getCached(`heatmap-${uid}-${monthCount}`, () =>
          analyticsAdvancedService.getHeatmapData(uid, monthCount)
        ),
        getCached(`largest-${uid}-${month}`, () =>
          analyticsAdvancedService.getLargestExpenses(uid, month, 5)
        ),
        getCached(`velocity-${uid}-${month}`, () =>
          analyticsAdvancedService.getSpendingVelocity(uid, month)
        ),
        getCached(`insights-${uid}-${month}`, () =>
          analyticsAdvancedService.getSmartInsights(uid, month, prevMonth)
        ),
        getCached(`range-${uid}-${month}`, () => {
          const rangeAStart = addMonthsUtil(month, -3);
          const rangeAEnd = addMonthsUtil(month, -1);
          const rangeBStart = month;
          const rangeBEnd = month;
          return analyticsAdvancedService.getRangeComparison(
            uid,
            rangeAStart,
            rangeAEnd,
            rangeBStart,
            rangeBEnd
          );
        }),
      ]);
      setExpenseBreakdown(Array.isArray(exp) ? exp : []);
      setIncomeBreakdown(Array.isArray(inc) ? inc : []);
      setTrend(Array.isArray(tr) ? tr : []);
      setBudgetVsActual(Array.isArray(bva) ? bva : []);
      setCategoryPerformance(Array.isArray(perf) ? perf : []);
      setHeatmap(hm);
      setLargestExpenses(Array.isArray(largest) ? largest : []);
      setVelocity(vel);
      setInsights(Array.isArray(ins) ? ins : []);
      setRangeComparison(
        range && typeof range === 'object' && range.rangeA && range.rangeB ? range : null
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load analytics.');
      setExpenseBreakdown([]);
      setIncomeBreakdown([]);
      setTrend([]);
      setBudgetVsActual([]);
      setCategoryPerformance([]);
      setHeatmap(null);
      setLargestExpenses([]);
      setVelocity(null);
      setInsights([]);
      setRangeComparison(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, month, monthCount, prevMonth]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filteredExpenseBreakdown = useMemo(() => {
    if (filters.type === 'income') return [];
    if (filters.categoryIds.length === 0) return expenseBreakdown;
    return expenseBreakdown.filter(
      (c) => c.category_id && filters.categoryIds.includes(c.category_id)
    );
  }, [expenseBreakdown, filters.categoryIds, filters.type]);

  const filteredIncomeBreakdown = useMemo(() => {
    if (filters.type === 'expense') return [];
    if (filters.categoryIds.length === 0) return incomeBreakdown;
    return incomeBreakdown.filter(
      (c) => c.category_id && filters.categoryIds.includes(c.category_id)
    );
  }, [incomeBreakdown, filters.categoryIds, filters.type]);

  return {
    expenseBreakdown: filteredExpenseBreakdown,
    incomeBreakdown: filteredIncomeBreakdown,
    rawExpenseBreakdown: expenseBreakdown,
    rawIncomeBreakdown: incomeBreakdown,
    trend,
    budgetVsActual,
    categoryPerformance,
    heatmap,
    largestExpenses,
    velocity,
    insights,
    rangeComparison,
    loading,
    error,
    refetch,
  };
}

export async function fetchCategoryDetails(
  userId: string,
  categoryId: string | null,
  categoryName: string,
  month: string
): Promise<CategoryDetails> {
  return analyticsAdvancedService.getCategoryDetails(
    userId,
    categoryId,
    categoryName,
    month
  );
}
