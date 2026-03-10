/**
 * Budgets service — fetch, upsert, delete, progress.
 */
import { supabase } from './supabase';
import { transactionsService } from './transactions';
import type { Budget, BudgetUpsert, BudgetProgress, BudgetStatus } from '@/types/database';
import type { Category } from '@/types/database';
import { getMonthRange } from '@/utils/date';

function getStatus(progressPercent: number): BudgetStatus {
  if (progressPercent >= 100) return 'exceeded';
  if (progressPercent >= 80) return 'warning';
  return 'ok';
}

export const budgetsService = {
  async getBudgets(userId: string, month: string): Promise<Budget[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .order('amount', { ascending: false });
    if (error) throw new Error(error.message || 'Could not load budgets.');
    return (data ?? []) as Budget[];
  },

  async upsertBudget(userId: string, b: BudgetUpsert): Promise<Budget | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('budgets')
      .upsert(
        { user_id: userId, category_id: b.category_id, month: b.month, amount: b.amount },
        { onConflict: 'user_id,category_id,month' }
      )
      .select()
      .single();
    if (error) throw new Error(error.message || 'Could not save budget.');
    return data as Budget;
  },

  async deleteBudget(userId: string, budgetId: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message || 'Could not delete budget.');
  },

  async getBudgetProgress(
    userId: string,
    month: string,
    categories: Category[],
    budgets: Budget[]
  ): Promise<BudgetProgress[]> {
    const { fromDate, toDate } = getMonthRange(month);
    const transactions = await transactionsService.getTransactions(userId, {
      fromDate,
      toDate,
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    return budgets.map((budget) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.category_id === budget.category_id)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const budgetAmount = Number(budget.amount);
      const remaining = budgetAmount - spent;
      const progressPercent = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
      return {
        budget,
        category_name: categoryMap.get(budget.category_id) ?? 'Unknown',
        budgetAmount,
        spentAmount: spent,
        remaining,
        progressPercent,
        status: getStatus(progressPercent),
      };
    });
  },
};
