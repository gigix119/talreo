/**
 * Alerts — CRUD, mark as read, generateSystemAlerts.
 */
import { supabase } from './supabase';
import { transactionsService } from './transactions';
import { budgetsService } from './budgets';
import { categoriesService } from '@/services/categories';
import type { Alert, AlertInsert } from '@/types/database';
import { getMonthRange, getFirstDayOfMonth } from '@/utils/date';

const DEDUP_WINDOW_HOURS = 24;

export const alertsService = {
  async getAlerts(userId: string, limit?: number): Promise<Alert[]> {
    if (!supabase) return [];
    let q = supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (error) throw new Error(error.message || 'Could not load alerts.');
    return (data ?? []) as Alert[];
  },

  async createAlert(userId: string, a: AlertInsert): Promise<Alert | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        user_id: userId,
        type: a.type,
        title: a.title,
        message: a.message,
        metadata: a.metadata ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message || 'Could not create alert.');
    return data as Alert;
  },

  async markAlertAsRead(userId: string, id: string): Promise<void> {
    if (!supabase) return;
    await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId);
  },

  async markAllAlertsAsRead(userId: string): Promise<void> {
    if (!supabase) return;
    await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('user_id', userId);
  },

  async deleteAlert(userId: string, id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new Error(error.message || 'Could not delete alert.');
  },

  async hasRecentAlert(userId: string, type: string, dedupKey: string): Promise<boolean> {
    if (!supabase) return false;
    const since = new Date();
    since.setHours(since.getHours() - DEDUP_WINDOW_HOURS);
    const sinceStr = since.toISOString();
    const { data } = await supabase
      .from('alerts')
      .select('id, metadata')
      .eq('user_id', userId)
      .eq('type', type)
      .gte('created_at', sinceStr)
      .limit(50);
    if (!data || data.length === 0) return false;
    const match = data.find((a) => (a as { metadata?: { key?: string } }).metadata?.key === dedupKey);
    return !!match;
  },

  async generateSystemAlerts(userId: string, month?: string): Promise<number> {
    const now = new Date();
    const monthStr = month ?? getFirstDayOfMonth(now.getFullYear(), now.getMonth());
    const { fromDate, toDate } = getMonthRange(monthStr);
    const [categories, budgets, transactions] = await Promise.all([
      categoriesService.getCategories(userId),
      budgetsService.getBudgets(userId, monthStr),
      transactionsService.getTransactions(userId, { fromDate, toDate }),
    ]);
    let created = 0;

    if (budgets.length > 0) {
      const budgetProgress = await budgetsService.getBudgetProgress(userId, monthStr, categories, budgets);
      for (const p of budgetProgress) {
        if (p.status === 'exceeded') {
          const key = `category:${p.budget.category_id}:month:${monthStr}`;
          const has = await this.hasRecentAlert(userId, 'budget_exceeded', key);
          if (!has) {
            await this.createAlert(userId, {
              type: 'budget_exceeded',
              title: `Budżet przekroczony: ${p.category_name}`,
              message: `Wydałeś ${p.spentAmount.toFixed(2)} z ${p.budgetAmount.toFixed(2)} (${p.progressPercent.toFixed(0)}%).`,
              metadata: { key, category_id: p.budget.category_id, month: monthStr },
            });
            created++;
          }
        } else if (p.status === 'warning') {
          const key = `category:${p.budget.category_id}:month:${monthStr}`;
          const has = await this.hasRecentAlert(userId, 'budget_warning', key);
          if (!has) {
            await this.createAlert(userId, {
              type: 'budget_warning',
              title: `Ostrzeżenie budżetu: ${p.category_name}`,
              message: `Budżet wykorzystany w ${p.progressPercent.toFixed(0)}%.`,
              metadata: { key, category_id: p.budget.category_id, month: monthStr },
            });
            created++;
          }
        }
      }
    }

    const expenseTx = transactions.filter((t) => t.type === 'expense' && t.category_id);
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    for (const t of expenseTx) {
      if (!t.category_id) continue;
      const prevMonths = [
        getFirstDayOfMonth(now.getFullYear(), now.getMonth() - 1),
        getFirstDayOfMonth(now.getFullYear(), now.getMonth() - 2),
        getFirstDayOfMonth(now.getFullYear(), now.getMonth() - 3),
      ];
      let sum = 0;
      let count = 0;
      for (const m of prevMonths) {
        const { fromDate: fd, toDate: td } = getMonthRange(m);
        const prevTx = await transactionsService.getTransactions(userId, { fromDate: fd, toDate: td });
        const catTx = prevTx.filter(
          (x) => x.type === 'expense' && x.category_id === t.category_id
        );
        for (const x of catTx) {
          sum += Number(x.amount);
          count++;
        }
      }
      if (count < 3) continue;
      const avg = sum / count;
      const amount = Number(t.amount);
      if (avg > 0 && amount >= avg * 1.5) {
        const key = `tx:${t.id}`;
        const has = await this.hasRecentAlert(userId, 'unusual_expense', key);
        if (!has) {
          const catName = catMap.get(t.category_id) ?? 'Nieznana';
          await this.createAlert(userId, {
            type: 'unusual_expense',
            title: `Nietypowy wydatek`,
            message: `${amount.toFixed(2)} w ${catName} (średnio ${avg.toFixed(2)}).`,
            metadata: { key, tx_id: t.id, category_id: t.category_id },
          });
          created++;
        }
      }
    }

    return created;
  },
};
