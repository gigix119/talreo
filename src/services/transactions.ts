/**
 * Transactions service — fetch, create, delete transactions.
 */
import { supabase } from './supabase';
import type { Transaction, TransactionInsert } from '@/types/database';

export type TransactionSort = 'newest' | 'oldest' | 'amount_desc' | 'amount_asc';

export interface GetTransactionsOptions {
  limit?: number;
  fromDate?: string;
  toDate?: string;
  type?: 'expense' | 'income';
  categoryId?: string;
  search?: string;
  sort?: TransactionSort;
}

export const transactionsService = {
  async getTransactions(
    userId: string,
    options?: GetTransactionsOptions
  ): Promise<Transaction[]> {
    if (!supabase) return [];
    let q = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);
    const { limit, fromDate, toDate, type, categoryId, search, sort } = options ?? {};
    if (fromDate) q = q.gte('transaction_date', fromDate);
    if (toDate) q = q.lte('transaction_date', toDate);
    if (type) q = q.eq('type', type);
    if (categoryId) q = q.eq('category_id', categoryId);
    if (search?.trim()) q = q.ilike('note', `%${search.trim()}%`);
    if (sort === 'amount_desc' || sort === 'amount_asc') {
      q = q.order('amount', { ascending: sort === 'amount_asc' });
    } else {
      q = q.order('transaction_date', { ascending: sort === 'oldest' });
    }
    q = q.order('created_at', { ascending: false });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (error) throw new Error(error.message || 'Could not load transactions.');
    return (data ?? []) as Transaction[];
  },

  async createTransaction(userId: string, tx: TransactionInsert): Promise<Transaction | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        category_id: tx.category_id ?? null,
        type: tx.type,
        amount: tx.amount,
        note: tx.note ?? null,
        transaction_date: tx.transaction_date ?? new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();
    if (error) throw new Error(error.message || 'Could not create transaction.');
    return data as Transaction;
  },

  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message || 'Could not delete transaction.');
  },
};
