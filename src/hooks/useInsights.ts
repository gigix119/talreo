/**
 * useInsights — monthly insights with human-readable text.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { insightsService } from '@/services/insights';
import type { MonthlyInsightsData } from '@/types/database';

export function useInsights(month: string) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<MonthlyInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user?.id) {
      setInsights(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await insightsService.getMonthlyInsights(user.id, month);
      setInsights(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się załadować spostrzeżeń.');
      setInsights(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, month]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { insights, loading, error, refetch };
}
