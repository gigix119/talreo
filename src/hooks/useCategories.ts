/**
 * useCategories — fetch categories by type.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { categoriesService } from '@/services/categories';
import type { Category } from '@/types/database';

export function useCategories(type?: 'expense' | 'income') {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user?.id) {
      setCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await categoriesService.getCategories(user.id, type);
      setCategories(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load categories.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, type]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories, loading, error, refetch };
}
