/**
 * Categories service — fetch and create categories.
 */
import { supabase } from './supabase';
import type { Category, CategoryInsert } from '@/types/database';

export const categoriesService = {
  async getCategories(userId: string, type?: 'expense' | 'income'): Promise<Category[]> {
    if (!supabase) return [];
    let q = supabase.from('categories').select('*').eq('user_id', userId).order('name');
    if (type) q = q.eq('type', type);
    const { data, error } = await q;
    if (error) throw new Error(error.message || 'Could not load categories.');
    return (data ?? []) as Category[];
  },

  async createCategory(userId: string, cat: CategoryInsert): Promise<Category | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: userId, ...cat })
      .select()
      .single();
    if (error) throw new Error(error.message || 'Could not create category.');
    return data as Category;
  },
};
