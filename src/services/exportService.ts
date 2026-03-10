/**
 * Export — CSV and PDF. Uses expo-file-system, expo-sharing, expo-print.
 */
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { transactionsService } from './transactions';
import { budgetsService } from './budgets';
import { savingsGoalsService } from './savingsGoals';
import { categoriesService } from '@/services/categories';
import { insightsService } from '@/services/insights';
import { getMonthRange, getCurrentMonth, formatMonth } from '@/utils/date';
import type { Language } from '@/types/database';

const CSV_COLS = {
  pl: {
    transactions: { date: 'Data', type: 'Typ', category: 'Kategoria', amount: 'Kwota', note: 'Notatka' },
    budgets: { month: 'Miesiąc', category: 'Kategoria', amount: 'Limit', spent: 'Wydane', remaining: 'Pozostało', status: 'Status' },
    goals: { name: 'Nazwa', target: 'Cel', current: 'Aktualnie', remaining: 'Pozostało', status: 'Status', targetDate: 'Data docelowa' },
  },
  en: {
    transactions: { date: 'Date', type: 'Type', category: 'Category', amount: 'Amount', note: 'Note' },
    budgets: { month: 'Month', category: 'Category', amount: 'Budget', spent: 'Spent', remaining: 'Remaining', status: 'Status' },
    goals: { name: 'Name', target: 'Target', current: 'Current', remaining: 'Remaining', status: 'Status', targetDate: 'Target date' },
  },
};

function escapeCsv(val: string | number): string {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export const exportService = {
  async exportTransactionsCsv(userId: string, locale: Language): Promise<void> {
    const [transactions, categories] = await Promise.all([
      transactionsService.getTransactions(userId),
      categoriesService.getCategories(userId),
    ]);
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    const cols = CSV_COLS[locale].transactions;
    const header = [cols.date, cols.type, cols.category, cols.amount, cols.note].join(',');
    const rows = transactions.map((t) => {
      const catName = t.category_id ? (catMap.get(t.category_id) ?? '') : '';
      const note = (t.note ?? '').replace(/\[recurring:[^\]]+\]\s*/g, '');
      return [
        t.transaction_date,
        t.type,
        escapeCsv(catName),
        Number(t.amount).toFixed(2),
        escapeCsv(note),
      ].join(',');
    });
    const csv = [header, ...rows].join('\n');
    const path = FileSystem.documentDirectory + `talreo_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) await Sharing.shareAsync(path, { mimeType: 'text/csv' });
  },

  async exportBudgetsCsv(userId: string, month: string, locale: Language): Promise<void> {
    const [categories, budgets] = await Promise.all([
      categoriesService.getCategories(userId),
      budgetsService.getBudgets(userId, month),
    ]);
    if (budgets.length === 0) throw new Error('No budgets for this month.');
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    const progress = await budgetsService.getBudgetProgress(userId, month, categories, budgets);
    const cols = CSV_COLS[locale].budgets;
    const header = [cols.month, cols.category, cols.amount, cols.spent, cols.remaining, cols.status].join(',');
    const rows = progress.map((p) => [
      month,
      escapeCsv(p.category_name),
      p.budgetAmount.toFixed(2),
      p.spentAmount.toFixed(2),
      p.remaining.toFixed(2),
      p.status,
    ].join(','));
    const csv = [header, ...rows].join('\n');
    const path = FileSystem.documentDirectory + `talreo_budgets_${month}.csv`;
    await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) await Sharing.shareAsync(path, { mimeType: 'text/csv' });
  },

  async exportGoalsCsv(userId: string, locale: Language): Promise<void> {
    const goals = await savingsGoalsService.getSavingsGoals(userId);
    if (goals.length === 0) throw new Error('No goals.');
    const cols = CSV_COLS[locale].goals;
    const header = [cols.name, cols.target, cols.current, cols.remaining, cols.status, cols.targetDate].join(',');
    const rows = goals.map((g) => [
      escapeCsv(g.name),
      g.target_amount.toFixed(2),
      g.current_amount.toFixed(2),
      g.remaining.toFixed(2),
      g.status,
      g.target_date ?? '',
    ].join(','));
    const csv = [header, ...rows].join('\n');
    const path = FileSystem.documentDirectory + `talreo_goals_${new Date().toISOString().slice(0, 10)}.csv`;
    await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) await Sharing.shareAsync(path, { mimeType: 'text/csv' });
  },

  async exportMonthlyPdf(
    userId: string,
    month: string,
    locale: Language,
    currency: string
  ): Promise<void> {
    const data = await insightsService.getMonthlyInsights(userId, month);
    const monthLabel = formatMonth(month);
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body{font-family:system-ui,sans-serif;padding:24px;color:#1c1c1e}
  h1{font-size:24px;margin:0 0 24px}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  th,td{padding:8px;text-align:left;border-bottom:1px solid #e5e5ea}
  th{color:#8e8e93;font-weight:600}
  .summary{display:flex;gap:24px;margin-bottom:24px;flex-wrap:wrap}
  .box{padding:16px;background:#f2f2f7;border-radius:12px;min-width:120px}
  .label{font-size:12px;color:#8e8e93}
  .value{font-size:18px;font-weight:700}
  .success{color:#34c759}.error{color:#ff3b30}
</style></head>
<body>
  <h1>${locale === 'pl' ? 'Raport miesięczny' : 'Monthly report'} — ${monthLabel}</h1>
  <div class="summary">
    <div class="box"><div class="label">${locale === 'pl' ? 'Przychody' : 'Income'}</div><div class="value success">${data.totalIncome.toFixed(2)} ${currency}</div></div>
    <div class="box"><div class="label">${locale === 'pl' ? 'Wydatki' : 'Expense'}</div><div class="value error">${data.totalExpense.toFixed(2)} ${currency}</div></div>
    <div class="box"><div class="label">${locale === 'pl' ? 'Saldo' : 'Balance'}</div><div class="value">${data.balance.toFixed(2)} ${currency}</div></div>
  </div>
  ${data.topExpenseCategory ? `<p><strong>${locale === 'pl' ? 'Top wydatek' : 'Top expense'}:</strong> ${data.topExpenseCategory.name} (${data.topExpenseCategory.amount.toFixed(2)} ${currency})</p>` : ''}
  ${data.budgetSummary && (data.budgetSummary.exceeded + data.budgetSummary.warning + data.budgetSummary.ok) > 0
    ? `<p><strong>${locale === 'pl' ? 'Budżety' : 'Budgets'}:</strong> ${locale === 'pl' ? 'ok' : 'ok'}: ${data.budgetSummary.ok}, ${locale === 'pl' ? 'ostrzeżenie' : 'warning'}: ${data.budgetSummary.warning}, ${locale === 'pl' ? 'przekroczono' : 'exceeded'}: ${data.budgetSummary.exceeded}</p>`
    : ''}
  ${data.transactionCount > 0 ? `<p>${locale === 'pl' ? 'Transakcji' : 'Transactions'}: ${data.transactionCount}</p>` : ''}
</body>
</html>`;
    const { uri } = await Print.printToFileAsync({ html });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
  },
};
