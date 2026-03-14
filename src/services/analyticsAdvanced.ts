/**
 * Advanced analytics — range comparison, velocity, insights, heatmap, etc.
 */
import { transactionsService } from './transactions';
import { categoriesService } from './categories';
import { analyticsService } from './analytics';
import { getRangeBounds, getMonthsInRange, getFirstDayOfMonth, getRecentMonths } from '@/utils/date';
import type {
  RangeComparisonResult,
  CategoryRangeComparison,
  CategoryDetails,
  CategoryPerformanceRow,
  HeatmapData,
  HeatmapCell,
  LargestExpense,
  SpendingVelocity,
  SmartInsight,
} from '@/types/analytics';

/** Returns null when prev=0 (no meaningful percent comparison). Avoids misleading +100%. */
function safeChangePercent(prev: number, curr: number): number | null {
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

export const analyticsAdvancedService = {
  async getRangeComparison(
    userId: string,
    rangeAStart: string,
    rangeAEnd: string,
    rangeBStart: string,
    rangeBEnd: string
  ): Promise<RangeComparisonResult> {
    const { fromDate: fromA, toDate: toA } = getRangeBounds(rangeAStart, rangeAEnd);
    const { fromDate: fromB, toDate: toB } = getRangeBounds(rangeBStart, rangeBEnd);

    const [txA, txB, categories] = await Promise.all([
      transactionsService.getTransactions(userId, { fromDate: fromA, toDate: toA }),
      transactionsService.getTransactions(userId, { fromDate: fromB, toDate: toB }),
      categoriesService.getCategories(userId, 'expense'),
    ]);

    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const categoryBreakdown = (txs: typeof txA) => {
      const byCat = new Map<string, number>();
      const expenses = txs.filter((t) => t.type === 'expense');
      for (const t of expenses) {
        const cid = t.category_id ?? 'unknown';
        const key = cid === 'unknown' ? '__Unknown' : cid;
        byCat.set(key, (byCat.get(key) ?? 0) + Number(t.amount));
      }
      return Array.from(byCat.entries()).map(([key, amount]) => ({
        categoryId: key.startsWith('__') ? null : key,
        categoryName: key.startsWith('__') ? 'Nieznana' : (catMap.get(key) ?? 'Nieznana'),
        amount,
      }));
    };

    const expenseBreakA = categoryBreakdown(txA);
    const expenseBreakB = categoryBreakdown(txB);

    const sumByType = (txs: typeof txA) => {
      const income = txs.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
      const expense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
      return { income, expense, balance: income - expense };
    };

    const a = sumByType(txA);
    const b = sumByType(txB);

    const categoryMap = new Map<string, { a: number; b: number; name: string }>();
    for (const c of expenseBreakA) {
      const key = c.categoryId ?? `__${c.categoryName}`;
      categoryMap.set(key, { a: c.amount, b: 0, name: c.categoryName });
    }
    for (const c of expenseBreakB) {
      const key = c.categoryId ?? `__${c.categoryName}`;
      const curr = categoryMap.get(key);
      categoryMap.set(key, { a: curr?.a ?? 0, b: c.amount, name: curr?.name ?? c.categoryName });
    }

    const categoryChanges: CategoryRangeComparison[] = [];
    for (const [key, { a: amtA, b: amtB, name }] of categoryMap.entries()) {
      categoryChanges.push({
        categoryId: key.startsWith('__') ? null : key,
        categoryName: name ?? 'Nieznana',
        rangeAAmount: amtA,
        rangeBAmount: amtB,
        changePercent: safeChangePercent(amtA, amtB),
      });
    }
    categoryChanges.sort((x, y) => {
      const ax = x.changePercent == null ? -1 : Math.abs(x.changePercent);
      const ay = y.changePercent == null ? -1 : Math.abs(y.changePercent);
      return ay - ax;
    });

    return {
      rangeA: { totalExpense: a.expense, totalIncome: a.income, balance: a.balance },
      rangeB: { totalExpense: b.expense, totalIncome: b.income, balance: b.balance },
      change: {
        expense: safeChangePercent(a.expense, b.expense),
        income: safeChangePercent(a.income, b.income),
        balance: safeChangePercent(a.balance, b.balance),
      },
      categoryChanges,
    };
  },

  async getCategoryDetails(
    userId: string,
    categoryId: string | null,
    categoryName: string,
    month: string
  ): Promise<CategoryDetails> {
    const { fromDate, toDate } = getRangeBounds(month, month);
    const options: Parameters<typeof transactionsService.getTransactions>[1] = {
      fromDate,
      toDate,
      type: 'expense',
    };
    let transactions: Awaited<ReturnType<typeof transactionsService.getTransactions>>;
    if (categoryId) {
      (options as { categoryId: string }).categoryId = categoryId;
      transactions = await transactionsService.getTransactions(userId, options);
    } else {
      transactions = await transactionsService.getTransactions(userId, { fromDate, toDate, type: 'expense' });
    }
    const filtered = categoryId
      ? transactions.filter((t) => t.category_id === categoryId)
      : transactions.filter((t) => !t.category_id);

    const totalSpent = filtered.reduce((s, t) => s + Number(t.amount), 0);
    const amounts = filtered.map((t) => Number(t.amount));
    const avg = amounts.length ? totalSpent / amounts.length : 0;
    const largest = amounts.length ? Math.max(...amounts) : 0;

    const recentMonths = getMonthsInRange(
      addMonths(month, -5),
      month
    );
    const monthlyTrend: { month: string; amount: number }[] = [];
    for (const m of recentMonths) {
      const { fromDate: fd, toDate: td } = getRangeBounds(m, m);
      const txs = await transactionsService.getTransactions(userId, {
        fromDate: fd,
        toDate: td,
        type: 'expense',
        ...(categoryId ? { categoryId } : {}),
      });
      const amt = categoryId
        ? txs.filter((t) => t.category_id === categoryId).reduce((s, t) => s + Number(t.amount), 0)
        : txs.filter((t) => !t.category_id).reduce((s, t) => s + Number(t.amount), 0);
      monthlyTrend.push({ month: m, amount: amt });
    }

    return {
      categoryId,
      categoryName,
      totalSpent,
      avgTransaction: avg,
      largestTransaction: largest,
      transactionCount: filtered.length,
      monthlyTrend,
      transactions: filtered.sort((a, b) => (b.transaction_date > a.transaction_date ? 1 : -1)),
    };
  },

  async getCategoryPerformance(
    userId: string,
    month: string,
    prevMonth: string
  ): Promise<CategoryPerformanceRow[]> {
    const [breakdown, budgetVsActual, prevBreakdown] = await Promise.all([
      analyticsService.getMonthlyCategoryBreakdown(userId, month, 'expense'),
      analyticsService.getBudgetVsActual(userId, month),
      analyticsService.getMonthlyCategoryBreakdown(userId, prevMonth, 'expense'),
    ]);

    const totalExpense = breakdown.reduce((s, c) => s + c.amount, 0);
    const prevByCat = new Map(prevBreakdown.map((c) => [c.category_id ?? c.category_name, c.amount]));
    const budgetByCat = new Map(budgetVsActual.map((b) => [b.category_id, b.budgetAmount]));

    const rows: CategoryPerformanceRow[] = [];
    for (const c of breakdown) {
      const key = c.category_id ?? c.category_name;
      const prevAmt = prevByCat.get(key) ?? 0;
      const budget = budgetByCat.get(c.category_id ?? '') ?? 0;
      rows.push({
        categoryId: c.category_id,
        categoryName: c.category_name,
        spent: c.amount,
        budget,
        remaining: budget - c.amount,
        percentOfExpenses: totalExpense > 0 ? (c.amount / totalExpense) * 100 : 0,
        vsPrevMonthPercent: safeChangePercent(prevAmt, c.amount),
      });
    }
    rows.sort((a, b) => b.spent - a.spent);
    return rows;
  },

  async getHeatmapData(
    userId: string,
    monthCount: number = 6
  ): Promise<HeatmapData> {
    const months = getRecentMonths(monthCount);
    const breakdowns = await Promise.all(
      months.map((m) => analyticsService.getMonthlyCategoryBreakdown(userId, m, 'expense'))
    );

    const allCategories = new Map<string, string>();
    for (const b of breakdowns) {
      for (const c of b) {
        const key = c.category_id ?? `__${c.category_name}`;
        allCategories.set(key, c.category_name);
      }
    }

    const cells: HeatmapCell[] = [];
    let maxAmount = 0;
    for (const m of months) {
      const idx = months.indexOf(m);
      const br = breakdowns[idx] ?? [];
      for (const c of br) {
        const key = c.category_id ?? `__${c.category_name}`;
        if (c.amount > maxAmount) maxAmount = c.amount;
        cells.push({
          month: m,
          categoryId: c.category_id,
          categoryName: c.category_name,
          amount: c.amount,
          normalized: 0,
        });
      }
    }
    const amtByMonthCat = new Map<string, number>();
    for (const m of months) {
      const br = breakdowns[months.indexOf(m)] ?? [];
      for (const c of br) {
        const catKey = c.category_id ?? `__${c.category_name}`;
        amtByMonthCat.set(`${m}|${catKey}`, c.amount);
      }
    }
    const max = Math.max(1, ...Array.from(amtByMonthCat.values()));
    const categories = Array.from(allCategories.entries()).map(([id, name]) => ({
      id: id.startsWith('__') ? null : id,
      name,
    }));
    const cellsFinal: HeatmapCell[] = [];
    for (const m of months) {
      for (const { id, name } of categories) {
        const key = id ?? `__${name}`;
        const amt = amtByMonthCat.get(`${m}|${key}`) ?? 0;
        cellsFinal.push({
          month: m,
          categoryId: id,
          categoryName: name,
          amount: amt,
          normalized: max > 0 ? amt / max : 0,
        });
      }
    }
    return {
      months,
      categories,
      cells: cellsFinal,
      maxAmount: max,
    };
  },

  async getLargestExpenses(userId: string, month: string, limit: number = 5): Promise<LargestExpense[]> {
    const { fromDate, toDate } = getRangeBounds(month, month);
    const transactions = await transactionsService.getTransactions(userId, {
      fromDate,
      toDate,
      type: 'expense',
      sort: 'amount_desc',
    });
    const categories = await categoriesService.getCategories(userId, 'expense');
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    return transactions.slice(0, limit).map((t) => ({
      id: t.id,
      note: t.note,
      amount: Number(t.amount),
      categoryName: (t.category_id && catMap.get(t.category_id)) ?? 'Nieznana',
      transactionDate: t.transaction_date,
    }));
  },

  async getSpendingVelocity(userId: string, month: string): Promise<SpendingVelocity> {
    const { fromDate, toDate } = getRangeBounds(month, month);
    const transactions = await transactionsService.getTransactions(userId, {
      fromDate,
      toDate,
      type: 'expense',
    });
    const total = transactions.reduce((s, t) => s + Number(t.amount), 0);
    const start = new Date(fromDate + 'T00:00:00');
    const end = new Date(toDate + 'T00:00:00');
    const today = new Date();
    const effectiveEnd = today > end ? end : today;
    const daysElapsed = Math.max(1, Math.ceil((effectiveEnd.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
    const daysInMonth = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    const dailyAverage = total / daysElapsed;
    const forecastThisMonth = dailyAverage * daysInMonth;
    return {
      dailyAverage,
      forecastThisMonth,
      daysElapsed,
      daysInMonth,
      spentSoFar: total,
    };
  },

  async getSmartInsights(userId: string, month: string, prevMonth: string): Promise<SmartInsight[]> {
    const [breakdown, prevBreakdown, budgetVsActual, velocity] = await Promise.all([
      analyticsService.getMonthlyCategoryBreakdown(userId, month, 'expense'),
      analyticsService.getMonthlyCategoryBreakdown(userId, prevMonth, 'expense'),
      analyticsService.getBudgetVsActual(userId, month),
      this.getSpendingVelocity(userId, month),
    ]);

    const insights: SmartInsight[] = [];
    const prevTotal = prevBreakdown.reduce((s, c) => s + c.amount, 0);
    const currTotal = breakdown.reduce((s, c) => s + c.amount, 0);
    const totalChange = safeChangePercent(prevTotal, currTotal);

    if (totalChange != null && Math.abs(totalChange) >= 5) {
      insights.push({
        id: 'total',
        type: totalChange > 0 ? 'warning' : 'success',
        text: totalChange > 0
          ? `Wydatki +${Math.round(Math.abs(totalChange))}% vs poprz. miesiąc.`
          : `Wydatki −${Math.round(Math.abs(totalChange))}% vs poprz. miesiąc.`,
        value: `${totalChange > 0 ? '+' : ''}${Math.round(totalChange)}%`,
        title: totalChange > 0 ? 'Wzrost wydatków' : 'Spadek wydatków',
        recommendation: totalChange > 0 ? 'Sprawdź kategorie z największym wzrostem.' : 'Nadwyżka — rozważ cele oszczędnościowe.',
      });
    } else if (prevTotal === 0 && currTotal > 0) {
      insights.push({
        id: 'total-new',
        type: 'info',
        text: 'Nowe wydatki w tym okresie. Brak danych do porównania.',
        title: 'Nowa aktywność',
      });
    }

    for (const c of breakdown) {
      const prev = prevBreakdown.find((p) => (p.category_id ?? p.category_name) === (c.category_id ?? c.category_name));
      const prevAmt = prev?.amount ?? 0;
      const change = safeChangePercent(prevAmt, c.amount);
      if (change != null && Math.abs(change) >= 15 && c.amount > 50) {
        insights.push({
          id: `cat-${c.category_id ?? c.category_name}`,
          type: change > 0 ? 'warning' : 'success',
          text: `„${c.category_name}": ${change > 0 ? '+' : ''}${Math.round(change)}% vs poprz.`,
          value: `${change > 0 ? '+' : ''}${Math.round(change)}%`,
          categoryName: c.category_name,
          title: change > 0 ? 'Wzrost' : 'Spadek',
          recommendation: change > 0 ? 'Ogranicz wydatki w tej kategorii.' : 'Kontrola OK.',
        });
      } else if (prevAmt === 0 && c.amount > 0 && c.amount > 50) {
        insights.push({
          id: `cat-new-${c.category_id ?? c.category_name}`,
          type: 'info',
          text: `Nowa kategoria „${c.category_name}".`,
          value: undefined,
          categoryName: c.category_name,
          title: 'Nowa',
        });
      }
    }

    for (const b of budgetVsActual) {
      if (b.percentUsed >= 100) {
        insights.push({
          id: `budget-${b.category_id}`,
          type: 'warning',
          text: `„${b.category_name}": przekroczono limit.`,
          value: `${Math.round(b.percentUsed)}%`,
          categoryName: b.category_name,
          title: 'Przekroczono',
          recommendation: 'Dostosuj budżet lub ogranicz wydatki.',
        });
      } else if (b.percentUsed >= 80) {
        insights.push({
          id: `budget-warn-${b.category_id}`,
          type: 'info',
          text: `„${b.category_name}": ${Math.round(b.percentUsed)}% budżetu.`,
          value: `${Math.round(b.percentUsed)}%`,
          categoryName: b.category_name,
          title: 'Blisko limitu',
          recommendation: 'Ogranicz wydatki lub zwiększ limit.',
        });
      }
    }

    const totalBudget = budgetVsActual.reduce((s, b) => s + b.budgetAmount, 0);
    if (totalBudget > 0 && velocity.forecastThisMonth > totalBudget) {
      const over = Math.round(velocity.forecastThisMonth - totalBudget);
      insights.push({
        id: 'velocity',
        type: 'warning',
        text: `Prognoza: przekroczysz budżet o ~${over}.`,
        value: `~${Math.round(velocity.forecastThisMonth)} vs ${Math.round(totalBudget)}`,
        title: 'Ryzyko przekroczenia',
        recommendation: 'Zwolnij wydatki lub dostosuj budżet.',
      });
    }

    return insights.slice(0, 6);
  },
};

function addMonths(month: string, delta: number): string {
  const d = new Date(month + 'T00:00:00');
  d.setMonth(d.getMonth() + delta);
  return getFirstDayOfMonth(d.getFullYear(), d.getMonth());
}
