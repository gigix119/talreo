/**
 * Analytics — category breakdown, monthly trend, budget vs actual.
 */
import { transactionsService } from './transactions';
import { budgetsService } from './budgets';
import { categoriesService } from '@/services/categories';
import type {
  CategoryBreakdownItem,
  MonthlyTrendItem,
  BudgetVsActualItem,
} from '@/types/database';
import { getMonthRange, getFirstDayOfMonth } from '@/utils/date';

export const analyticsService = {
  async getMonthlyCategoryBreakdown(
    userId: string,
    month: string,
    type: 'expense' | 'income'
  ): Promise<CategoryBreakdownItem[]> {
    const { fromDate, toDate } = getMonthRange(month);
    const transactions = await transactionsService.getTransactions(userId, {
      fromDate,
      toDate,
    });
    const filtered = transactions.filter((t) => t.type === type);
    const categories = await categoriesService.getCategories(userId, type);
    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const byCategory = new Map<string, number>();
    for (const t of filtered) {
      const cid = t.category_id ?? 'unknown';
      const name = catMap.get(cid) ?? 'Unknown';
      const key = cid === 'unknown' ? `__${name}` : cid;
      byCategory.set(key, (byCategory.get(key) ?? 0) + Number(t.amount));
    }

    const total = filtered.reduce((s, t) => s + Number(t.amount), 0);
    const items: CategoryBreakdownItem[] = [];
    for (const [key, amount] of byCategory.entries()) {
      const category_id = key.startsWith('__') ? null : key;
      const category_name = category_id
        ? (catMap.get(category_id) ?? 'Unknown')
        : key.replace('__', '');
      items.push({
        category_id,
        category_name,
        amount,
        percent: total > 0 ? (amount / total) * 100 : 0,
      });
    }
    items.sort((a, b) => b.amount - a.amount);
    return items;
  },

  async getMonthlyTrend(
    userId: string,
    monthCount: number = 6
  ): Promise<MonthlyTrendItem[]> {
    const now = new Date();
    const items: MonthlyTrendItem[] = [];

    for (let i = monthCount - 1; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = getFirstDayOfMonth(m.getFullYear(), m.getMonth());
      const { fromDate, toDate } = getMonthRange(month);
      const tx = await transactionsService.getTransactions(userId, {
        fromDate,
        toDate,
      });
      const income = tx
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + Number(t.amount), 0);
      const expense = tx
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + Number(t.amount), 0);
      items.push({
        month,
        income,
        expense,
        balance: income - expense,
      });
    }
    return items;
  },

  async getBudgetVsActual(userId: string, month: string): Promise<BudgetVsActualItem[]> {
    const categories = await categoriesService.getCategories(userId);
    const budgets = await budgetsService.getBudgets(userId, month);
    if (budgets.length === 0) return [];

    const { fromDate, toDate } = getMonthRange(month);
    const transactions = await transactionsService.getTransactions(userId, {
      fromDate,
      toDate,
    });
    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const items: BudgetVsActualItem[] = [];
    for (const b of budgets) {
      const actual = transactions
        .filter((t) => t.type === 'expense' && t.category_id === b.category_id)
        .reduce((s, t) => s + Number(t.amount), 0);
      const budgetAmount = Number(b.amount);
      const variance = budgetAmount - actual;
      const percentUsed = budgetAmount > 0 ? (actual / budgetAmount) * 100 : 0;
      items.push({
        category_id: b.category_id,
        category_name: catMap.get(b.category_id) ?? 'Unknown',
        budgetAmount,
        actualAmount: actual,
        variance,
        percentUsed,
      });
    }
    items.sort((a, b) => b.actualAmount - a.actualAmount);
    return items;
  },
};
