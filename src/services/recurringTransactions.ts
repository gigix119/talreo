/**
 * Recurring transactions — CRUD + runRecurringCatchup.
 * Generates transactions on app entry (client-side MVP).
 */
import { supabase } from './supabase';
import { transactionsService } from './transactions';
import { categoriesService } from '@/services/categories';
import type {
  RecurringTransaction,
  RecurringTransactionInsert,
  RecurringTransactionUpdate,
} from '@/types/database';
import { getRecurringDatesToGenerate } from '@/utils/date';

export const recurringTransactionsService = {
  async getRecurringTransactions(userId: string): Promise<RecurringTransaction[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message || 'Could not load recurring transactions.');
    return (data ?? []) as RecurringTransaction[];
  },

  async createRecurringTransaction(
    userId: string,
    r: RecurringTransactionInsert
  ): Promise<RecurringTransaction | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert({
        user_id: userId,
        category_id: r.category_id ?? null,
        type: r.type,
        amount: r.amount,
        note: r.note ?? null,
        frequency: r.frequency,
        start_date: r.start_date,
        end_date: r.end_date ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message || 'Could not create recurring transaction.');
    return data as RecurringTransaction;
  },

  async updateRecurringTransaction(
    userId: string,
    id: string,
    u: RecurringTransactionUpdate
  ): Promise<RecurringTransaction | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('recurring_transactions')
      .update({
        ...(u.category_id !== undefined && { category_id: u.category_id }),
        ...(u.type !== undefined && { type: u.type }),
        ...(u.amount !== undefined && { amount: u.amount }),
        ...(u.note !== undefined && { note: u.note }),
        ...(u.frequency !== undefined && { frequency: u.frequency }),
        ...(u.start_date !== undefined && { start_date: u.start_date }),
        ...(u.end_date !== undefined && { end_date: u.end_date }),
        ...(u.is_active !== undefined && { is_active: u.is_active }),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new Error(error.message || 'Could not update recurring transaction.');
    return data as RecurringTransaction;
  },

  async deleteRecurringTransaction(userId: string, id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new Error(error.message || 'Could not delete recurring transaction.');
  },

  /**
   * Catch-up: generate missing transactions from active recurring_transactions.
   * Call on dashboard/transaction list focus.
   */
  async runRecurringCatchup(userId: string): Promise<{ generated: number }> {
    const today = new Date().toISOString().slice(0, 10);
    const list = await this.getRecurringTransactions(userId);
    const active = list.filter((r) => r.is_active);
    let generated = 0;

    const existingTxDates = new Set<string>();
    const transactions = await transactionsService.getTransactions(userId, {
      fromDate: '2000-01-01',
      toDate: today,
    });
    for (const t of transactions) {
      if (t.note?.startsWith('[recurring:')) {
        const match = t.note.match(/\[recurring:([a-f0-9-]+)\]/);
        if (match) {
          const recId = match[1];
          existingTxDates.add(`${recId}:${t.transaction_date}`);
        }
      }
    }

    for (const rec of active) {
      const endDate = rec.end_date ?? null;
      const lastOrStart = rec.last_generated_at ?? rec.start_date;
      const dates = getRecurringDatesToGenerate(rec.frequency, lastOrStart, endDate, today);

      let lastGen = rec.last_generated_at ?? rec.start_date;
      for (const d of dates) {
        const key = `${rec.id}:${d}`;
        if (existingTxDates.has(key)) continue;

        await transactionsService.createTransaction(userId, {
          type: rec.type,
          amount: Number(rec.amount),
          category_id: rec.category_id,
          note: rec.note ? `[recurring:${rec.id}] ${rec.note}` : `[recurring:${rec.id}]`,
          transaction_date: d,
        });
        existingTxDates.add(key);
        generated++;
        lastGen = d;
      }
      if (dates.length > 0) {
        await supabase!
          .from('recurring_transactions')
          .update({ last_generated_at: lastGen })
          .eq('id', rec.id)
          .eq('user_id', userId);
      }
    }

    return { generated };
  },
};
