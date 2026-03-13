/**
 * Monthly insights — dynamic insights with human-readable text.
 */
import { transactionsService } from './transactions';
import { budgetsService } from './budgets';
import { categoriesService } from '@/services/categories';
import type { MonthlyInsightsData, MonthlyInsight } from '@/types/database';
import { getMonthRange, getFirstDayOfMonth } from '@/utils/date';

export const insightsService = {
  async getMonthlyInsights(userId: string, month: string): Promise<MonthlyInsightsData> {
    const { fromDate, toDate } = getMonthRange(month);
    const prevMonth = new Date(month + 'T00:00:00');
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStr = getFirstDayOfMonth(prevMonth.getFullYear(), prevMonth.getMonth());
    const { fromDate: prevFrom, toDate: prevTo } = getMonthRange(prevMonthStr);

    const [tx, prevTx, categories, budgets] = await Promise.all([
      transactionsService.getTransactions(userId, { fromDate, toDate }),
      transactionsService.getTransactions(userId, { fromDate: prevFrom, toDate: prevTo }),
      categoriesService.getCategories(userId),
      budgetsService.getBudgets(userId, month),
    ]);

    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const incomeTx = tx.filter((t) => t.type === 'income');
    const expenseTx = tx.filter((t) => t.type === 'expense');
    const totalIncome = incomeTx.reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = expenseTx.reduce((s, t) => s + Number(t.amount), 0);
    const balance = totalIncome - totalExpense;

    const prevIncome = prevTx
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + Number(t.amount), 0);
    const prevExpense = prevTx
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0);

    const expenseChangeVsPrev =
      prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : null;
    const incomeChangeVsPrev =
      prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : null;

    const byExpenseCat = new Map<string, number>();
    for (const t of expenseTx) {
      const cid = t.category_id ?? 'unknown';
      byExpenseCat.set(cid, (byExpenseCat.get(cid) ?? 0) + Number(t.amount));
    }
    let topExpenseCategory: { name: string; amount: number } | null = null;
    if (byExpenseCat.size > 0) {
      const [cid, amount] = [...byExpenseCat.entries()].sort((a, b) => b[1] - a[1])[0];
      topExpenseCategory = {
        name: catMap.get(cid ?? '') ?? 'Nieznana',
        amount,
      };
    }

    const byIncomeCat = new Map<string, number>();
    for (const t of incomeTx) {
      const cid = t.category_id ?? 'unknown';
      byIncomeCat.set(cid, (byIncomeCat.get(cid) ?? 0) + Number(t.amount));
    }
    let topIncomeCategory: { name: string; amount: number } | null = null;
    if (byIncomeCat.size > 0) {
      const [cid, amount] = [...byIncomeCat.entries()].sort((a, b) => b[1] - a[1])[0];
      topIncomeCategory = {
        name: catMap.get(cid ?? '') ?? 'Nieznana',
        amount,
      };
    }

    const biggestExpense =
      expenseTx.length > 0
        ? expenseTx.reduce((a, b) =>
            Number(a.amount) >= Number(b.amount) ? a : b
          )
        : null;
    const biggestIncome =
      incomeTx.length > 0
        ? incomeTx.reduce((a, b) =>
            Number(a.amount) >= Number(b.amount) ? a : b
          )
        : null;

    const budgetSummary = { exceeded: 0, warning: 0, ok: 0 };
    if (budgets.length > 0) {
      const budgetProgress = await budgetsService.getBudgetProgress(
        userId,
        month,
        categories,
        budgets
      );
      for (const p of budgetProgress) {
        if (p.status === 'exceeded') budgetSummary.exceeded++;
        else if (p.status === 'warning') budgetSummary.warning++;
        else budgetSummary.ok++;
      }
    }

    const insights: MonthlyInsight[] = [];

    if (topExpenseCategory) {
      insights.push({
        id: 'top-expense',
        type: 'highlight',
        text: `${topExpenseCategory.name} to Twoja główna kategoria wydatków w tym miesiącu.`,
        value: topExpenseCategory.amount,
      });
    }

    if (expenseChangeVsPrev !== null) {
      if (expenseChangeVsPrev > 10) {
        insights.push({
          id: 'expense-up',
          type: 'warning',
          text: `Wydałeś o ${Math.round(expenseChangeVsPrev)}% więcej niż w zeszłym miesiącu.`,
          value: expenseChangeVsPrev,
        });
      } else if (expenseChangeVsPrev < -10) {
        insights.push({
          id: 'expense-down',
          type: 'success',
          text: `Wydałeś o ${Math.round(Math.abs(expenseChangeVsPrev))}% mniej niż w zeszłym miesiącu.`,
          value: expenseChangeVsPrev,
        });
      }
    }

    if (incomeChangeVsPrev !== null && incomeChangeVsPrev > 10) {
      insights.push({
        id: 'income-up',
        type: 'success',
        text: `Przychody wzrosły o ${Math.round(incomeChangeVsPrev)}% względem zeszłego miesiąca.`,
        value: incomeChangeVsPrev,
      });
    }

    if (budgetSummary.exceeded > 0) {
      const word = budgetSummary.exceeded === 1 ? 'budżetu' : 'budżetów';
      insights.push({
        id: 'budget-exceeded',
        type: 'warning',
        text: `Przekroczyłeś ${budgetSummary.exceeded} ${word} kategorii.`,
        value: budgetSummary.exceeded,
      });
    }

    if (budgetSummary.warning > 0 && budgetSummary.exceeded === 0) {
      const word = budgetSummary.warning === 1 ? 'budżet blisko' : 'budżety blisko';
      insights.push({
        id: 'budget-warning',
        type: 'info',
        text: `${budgetSummary.warning} ${word} limitu.`,
        value: budgetSummary.warning,
      });
    }

    if (tx.length > 0) {
      const word = tx.length === 1 ? 'transakcja' : tx.length < 5 ? 'transakcje' : 'transakcji';
      insights.push({
        id: 'tx-count',
        type: 'info',
        text: `${tx.length} ${word} w tym miesiącu.`,
        value: tx.length,
      });
    }

    if (biggestExpense) {
      const note = biggestExpense.note?.replace(/\[recurring:[^]+\]\s*/, '') || 'wydatek';
      insights.push({
        id: 'biggest-expense',
        type: 'info',
        text: `Największy wydatek: ${note}`,
        value: biggestExpense.amount,
      });
    }

    return {
      month,
      totalIncome,
      totalExpense,
      balance,
      topExpenseCategory,
      topIncomeCategory,
      biggestExpenseTransaction: biggestExpense
        ? {
            note: biggestExpense.note?.replace(/\[recurring:[^]+\]\s*/, '') || 'wydatek',
            amount: Number(biggestExpense.amount),
          }
        : null,
      biggestIncomeTransaction: biggestIncome
        ? {
            note: biggestIncome.note?.replace(/\[recurring:[^]+\]\s*/, '') || 'przychód',
            amount: Number(biggestIncome.amount),
          }
        : null,
      expenseChangeVsPrev,
      incomeChangeVsPrev,
      budgetSummary,
      transactionCount: tx.length,
      insights,
    };
  },
};
