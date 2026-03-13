/**
 * Analytics — category breakdown, monthly trend, budget vs actual.
 * Uses lib/financialLogic for core calculations.
 */
import { transactionsService } from './transactions';
import { budgetsService } from './budgets';
import { categoriesService } from '@/services/categories';
import { savingsGoalsService } from './savingsGoals';
import type {
  CategoryBreakdownItem,
  MonthlyTrendItem,
  BudgetVsActualItem,
  Currency,
} from '@/types/database';
import { getMonthRange, getFirstDayOfMonth, getDaysElapsedInMonth, getDaysInMonth } from '@/utils/date';
import {
  computeMonthlySummary,
  aggregateByCategory,
  computeBudgetUsageBatch,
  computeFinancialHealthScore,
  computeSpendingTrends,
  computeSpendingVelocity,
  computeExpenseChangePercent,
  isGoalOnTrack,
  computeGoalProgress,
  buildInsights,
} from '@/lib/financialLogic';
import type {
  MonthlyFinancialSummary,
  CategoryAggregationResult,
  BudgetUsageResult,
  FinancialHealthScoreResult,
  SpendingTrend,
  SpendingVelocityResult,
} from '@/lib/financialLogic';
import type { InsightEngineInput, BuildInsightsResult } from '@/lib/financialLogic';

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

  /** Monthly summary: Przychody, Wydatki, Saldo — UI-optimized */
  async getMonthlySummary(userId: string, month: string): Promise<MonthlyFinancialSummary> {
    const { fromDate, toDate } = getMonthRange(month);
    const transactions = await transactionsService.getTransactions(userId, {
      fromDate,
      toDate,
    });
    return computeMonthlySummary(transactions, month);
  },

  /** Category totals: Jedzenie, Rachunki, Transport, etc. — UI-optimized */
  async getCategoryTotals(
    userId: string,
    month: string,
    type: 'expense' | 'income'
  ): Promise<CategoryAggregationResult> {
    const { fromDate, toDate } = getMonthRange(month);
    const transactions = await transactionsService.getTransactions(userId, {
      fromDate,
      toDate,
    });
    const categories = await categoriesService.getCategories(userId, type);
    const categoryNameMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    return aggregateByCategory(transactions, type, categoryNameMap);
  },

  /** Budget usage: spent/limit, percentage, warning states — UI-optimized */
  async getBudgetUsage(userId: string, month: string): Promise<BudgetUsageResult[]> {
    const categories = await categoriesService.getCategories(userId);
    const budgets = await budgetsService.getBudgets(userId, month);
    if (budgets.length === 0) return [];

    const { fromDate, toDate } = getMonthRange(month);
    const transactions = await transactionsService.getTransactions(userId, {
      fromDate,
      toDate,
    });
    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const items = budgets.map((b) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.category_id === b.category_id)
        .reduce((s, t) => s + Number(t.amount), 0);
      return {
        categoryId: b.category_id,
        categoryName: catMap.get(b.category_id) ?? 'Unknown',
        spentAmount: spent,
        limitAmount: Number(b.amount),
      };
    });

    return computeBudgetUsageBatch(items);
  },

  /** Financial health score 0–100 — UI-optimized */
  async getFinancialHealthScore(userId: string, month: string): Promise<FinancialHealthScoreResult> {
    const summary = await this.getMonthlySummary(userId, month);
    const budgetUsage = await this.getBudgetUsage(userId, month);
    const goals = await savingsGoalsService.getSavingsGoals(userId);

    const budgetsExceeded = budgetUsage.filter((b) => b.isExceeded).length;
    const budgetsWarning = budgetUsage.filter((b) => b.isWarning).length;
    const activeGoals = goals.filter((g) => g.status === 'active');
    const goalsOnTrack = activeGoals.filter((g) =>
      isGoalOnTrack(g.progressPercent, g.target_date, g.created_at)
    );

    const { fromDate } = getMonthRange(month);
    const prevMonth = new Date(fromDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStr = getFirstDayOfMonth(prevMonth.getFullYear(), prevMonth.getMonth());
    const prevSummary = await this.getMonthlySummary(userId, prevMonthStr);
    const expenseChangePercent = computeExpenseChangePercent(
      summary.expense,
      prevSummary.expense
    );

    const savingsRate = summary.income > 0 ? summary.balance / summary.income : 0;

    return computeFinancialHealthScore({
      income: summary.income,
      expense: summary.expense,
      budgetsExceededCount: budgetsExceeded,
      budgetsWarningCount: budgetsWarning,
      totalBudgetsCount: budgetUsage.length,
      goalsOnTrackCount: goalsOnTrack.length,
      activeGoalsCount: activeGoals.length,
      expenseChangePercent,
      savingsRate,
    });
  },

  /** Spending trends by month — UI-optimized */
  async getSpendingTrends(
    userId: string,
    monthCount: number = 6
  ): Promise<SpendingTrend[]> {
    const months = [];
    const now = new Date();
    for (let i = monthCount - 1; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(getFirstDayOfMonth(m.getFullYear(), m.getMonth()));
    }

    const amounts: { month: string; amount: number }[] = [];
    for (const month of months) {
      const { fromDate, toDate } = getMonthRange(month);
      const tx = await transactionsService.getTransactions(userId, {
        fromDate,
        toDate,
      });
      const expense = tx
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + Number(t.amount), 0);
      amounts.push({ month, amount: expense });
    }

    return computeSpendingTrends(amounts);
  },

  /** Spending velocity: daily average, forecast — UI-optimized */
  async getSpendingVelocity(
    userId: string,
    month: string
  ): Promise<SpendingVelocityResult> {
    const { fromDate, toDate } = getMonthRange(month);
    const transactions = await transactionsService.getTransactions(userId, {
      fromDate,
      toDate,
    });
    const spentSoFar = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0);

    const daysElapsed = getDaysElapsedInMonth(month);
    const daysInMonth = getDaysInMonth(month);

    return computeSpendingVelocity(spentSoFar, month, daysElapsed, daysInMonth);
  },

  /**
   * Build insight engine input for premium Polish insights (dashboard, analytics, budgets, goals).
   * Call buildInsights(input) to get prioritized insight groups.
   */
  async getInsightEngineInput(
    userId: string,
    month: string,
    currency: Currency
  ): Promise<InsightEngineInput> {
    const [summary, budgetUsage, velocity, health, goals, spendingTrends] = await Promise.all([
      this.getMonthlySummary(userId, month),
      this.getBudgetUsage(userId, month),
      this.getSpendingVelocity(userId, month),
      this.getFinancialHealthScore(userId, month),
      savingsGoalsService.getSavingsGoals(userId),
      this.getSpendingTrends(userId, 6),
    ]);

    const { fromDate } = getMonthRange(month);
    const prevMonth = new Date(fromDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStr = getFirstDayOfMonth(prevMonth.getFullYear(), prevMonth.getMonth());
    const summaryPrev = await this.getMonthlySummary(userId, prevMonthStr);

    const categoryResult = await this.getCategoryTotals(userId, month, 'expense');
    const goalProgressList = goals.map((g) =>
      computeGoalProgress(
        g.id,
        g.name,
        Number(g.current_amount),
        Number(g.target_amount),
        g.target_date ?? null,
        g.is_completed
      )
    );

    return {
      month,
      currency,
      summary,
      summaryPrev,
      categoryTotals: categoryResult.totals,
      budgetUsage,
      velocity,
      health,
      goalProgress: goalProgressList,
      spendingTrends,
    };
  },

  /**
   * Get premium Polish insights for all screens (dashboard, analytics, budgets, goals).
   */
  async getPremiumInsights(
    userId: string,
    month: string,
    currency: Currency
  ): Promise<BuildInsightsResult> {
    const input = await this.getInsightEngineInput(userId, month, currency);
    return buildInsights(input);
  },
};
