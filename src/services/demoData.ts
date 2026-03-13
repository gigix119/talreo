/**
 * Demo data — starter experience for new users.
 * Creates sample transactions, budgets, goals, recurring.
 */
import { transactionsService } from './transactions';
import { budgetsService } from './budgets';
import { savingsGoalsService } from './savingsGoals';
import { recurringTransactionsService } from './recurringTransactions';
import { categoriesService } from '@/services/categories';
import { addMonths, getCurrentMonth } from '@/utils/date';
import type { Currency } from '@/types/database';

export async function hasDemoData(userId: string): Promise<boolean> {
  const txs = await transactionsService.getTransactions(userId, { limit: 1 });
  return txs.length > 0;
}

export async function createDemoData(userId: string, currency: Currency): Promise<void> {
  if (await hasDemoData(userId)) return;

  const categories = await categoriesService.getCategories(userId);
  const expenseCats = categories.filter((c) => c.type === 'expense');
  const incomeCats = categories.filter((c) => c.type === 'income');
  const food = expenseCats.find((c) => c.name?.toLowerCase().includes('food')) ?? expenseCats[0];
  const transport = expenseCats.find((c) => c.name?.toLowerCase().includes('transport')) ?? expenseCats[1];
  const bills = expenseCats.find((c) => c.name?.toLowerCase().includes('bill')) ?? expenseCats[2];
  const shopping = expenseCats.find((c) => c.name?.toLowerCase().includes('shop')) ?? expenseCats[3];
  const salary = incomeCats.find((c) => c.name?.toLowerCase().includes('salary')) ?? incomeCats[0];
  const freelance = incomeCats.find((c) => c.name?.toLowerCase().includes('freelance')) ?? incomeCats[1];

  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const transactions: Array<{
    type: 'expense' | 'income';
    amount: number;
    category_id: string | null;
    note: string;
    date: string;
  }> = [];

  for (let m = -2; m <= 0; m++) {
    const base = new Date(now.getFullYear(), now.getMonth() + m, 15);
    const monthStr = base.toISOString().slice(0, 7);

    if (salary) {
      transactions.push({
        type: 'income',
        amount: 5000 + m * 200,
        category_id: salary.id,
        note: 'Wynagrodzenie',
        date: `${monthStr}-05`,
      });
    }
    if (freelance && m <= -1) {
      transactions.push({
        type: 'income',
        amount: 800,
        category_id: freelance.id,
        note: 'Projekt dodatkowy',
        date: `${monthStr}-20`,
      });
    }

    if (food) {
      transactions.push({ type: 'expense', amount: 450, category_id: food.id, note: 'Zakupy spożywcze', date: `${monthStr}-01` });
      transactions.push({ type: 'expense', amount: 320, category_id: food.id, note: 'Zakupy spożywcze', date: `${monthStr}-15` });
      transactions.push({ type: 'expense', amount: 85, category_id: food.id, note: 'Restauracja', date: `${monthStr}-08` });
    }
    if (transport) {
      transactions.push({ type: 'expense', amount: 150, category_id: transport.id, note: 'Paliwo', date: `${monthStr}-03` });
      transactions.push({ type: 'expense', amount: 45, category_id: transport.id, note: 'Parking', date: `${monthStr}-12` });
    }
    if (bills) {
      transactions.push({ type: 'expense', amount: 320, category_id: bills.id, note: 'Czynsz', date: `${monthStr}-01` });
      transactions.push({ type: 'expense', amount: 80, category_id: bills.id, note: 'Media', date: `${monthStr}-10` });
    }
    if (shopping) {
      transactions.push({ type: 'expense', amount: 120, category_id: shopping.id, note: 'Ubrania', date: `${monthStr}-18` });
    }
  }

  for (const t of transactions) {
    await transactionsService.createTransaction(userId, {
      type: t.type,
      amount: t.amount,
      category_id: t.category_id,
      note: t.note,
      transaction_date: t.date,
    });
  }

  const month = getCurrentMonth();
  if (food) {
    await budgetsService.upsertBudget(userId, { category_id: food.id, month, amount: 800 });
  }
  if (transport) {
    await budgetsService.upsertBudget(userId, { category_id: transport.id, month, amount: 250 });
  }
  if (bills) {
    await budgetsService.upsertBudget(userId, { category_id: bills.id, month, amount: 450 });
  }

  await savingsGoalsService.createSavingsGoal(userId, {
    name: 'Wakacje',
    target_amount: 3000,
    current_amount: 450,
    target_date: addMonths(today, 6).slice(0, 7) + '-01',
  });
  await savingsGoalsService.createSavingsGoal(userId, {
    name: 'Fundusz awaryjny',
    target_amount: 10000,
    current_amount: 1200,
    target_date: null,
  });

  if (salary) {
    await recurringTransactionsService.createRecurringTransaction(userId, {
      type: 'income',
      amount: 5200,
      category_id: salary.id,
      note: 'Wynagrodzenie miesięczne',
      frequency: 'monthly',
      start_date: addMonths(today, -1).slice(0, 7) + '-05',
      end_date: null,
    });
  }
  if (bills) {
    await recurringTransactionsService.createRecurringTransaction(userId, {
      type: 'expense',
      amount: 320,
      category_id: bills.id,
      note: 'Czynsz',
      frequency: 'monthly',
      start_date: addMonths(today, -3).slice(0, 7) + '-01',
      end_date: null,
    });
  }
}
