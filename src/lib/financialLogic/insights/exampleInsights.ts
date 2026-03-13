/**
 * Example insight engine input and sample Polish insight outputs.
 * Use for tests, docs, or UI placeholders. Does not depend on services.
 */
import type { InsightEngineInput } from './inputTypes';
import type { FinancialInsight } from './types';
import type { BuildInsightsResult } from './buildInsights';
import { buildInsights } from './buildInsights';

/** Sample input for insight engine (realistic Polish user data) */
export function getExampleInsightInput(): InsightEngineInput {
  const month = '2025-03-01';
  return {
    month,
    currency: 'PLN',
    summary: {
      month,
      income: 8500,
      expense: 6120,
      balance: 2380,
    },
    summaryPrev: {
      month: '2025-02-01',
      income: 8500,
      expense: 5200,
      balance: 3300,
    },
    categoryTotals: [
      { categoryId: 'cat-1', categoryName: 'Restauracje', amount: 1200, percentOfTotal: 19.6, transactionCount: 14 },
      { categoryId: 'cat-2', categoryName: 'Jedzenie', amount: 980, percentOfTotal: 16, transactionCount: 22 },
      { categoryId: 'cat-3', categoryName: 'Transport', amount: 650, percentOfTotal: 10.6, transactionCount: 8 },
      { categoryId: 'cat-4', categoryName: 'Rachunki', amount: 1850, percentOfTotal: 30.2, transactionCount: 5 },
    ],
    budgetUsage: [
      {
        categoryId: 'cat-2',
        categoryName: 'Jedzenie',
        spentAmount: 980,
        limitAmount: 1000,
        remainingAmount: 20,
        usagePercent: 98,
        state: 'warning',
        isExceeded: false,
        isWarning: true,
      },
      {
        categoryId: 'cat-4',
        categoryName: 'Rachunki',
        spentAmount: 1850,
        limitAmount: 1900,
        remainingAmount: 50,
        usagePercent: 97.4,
        state: 'warning',
        isExceeded: false,
        isWarning: true,
      },
    ],
    velocity: {
      dailyAverage: 204,
      forecastThisMonth: 6324,
      daysElapsed: 10,
      daysInMonth: 31,
      spentSoFar: 2040,
      onTrack: true,
    },
    health: {
      score: 68,
      grade: 'good',
      factors: [
        { id: 'savings_rate', label: 'Wskaźnik oszczędności', score: 28, weight: 0.25, description: 'Oszczędzasz 28.0% przychodów' },
        { id: 'budget_adherence', label: 'Kontrola budżetu', score: 80, weight: 0.3, description: '2 budżet(ów) w ostrzeżeniu' },
        { id: 'goal_progress', label: 'Postęp celów oszczędnościowych', score: 100, weight: 0.25, description: '1/1 celów na dobrej drodze' },
        { id: 'spending_trend', label: 'Trend wydatków', score: 50, weight: 0.2, description: 'Wydatki wzrosły o 17.7%' },
      ],
    },
    goalProgress: [
      {
        goalId: 'goal-1',
        goalName: 'Wakacje',
        currentAmount: 2450,
        targetAmount: 5000,
        remaining: 2550,
        progressPercent: 49,
        status: 'active',
        daysUntilTarget: 120,
      },
    ],
    spendingTrends: [
      { period: '2024-10-01', amount: 4800, changeFromPrev: null, changePercent: null },
      { period: '2024-11-01', amount: 5100, changeFromPrev: 300, changePercent: 6.25 },
      { period: '2024-12-01', amount: 6200, changeFromPrev: 1100, changePercent: 21.6 },
      { period: '2025-01-01', amount: 5300, changeFromPrev: -900, changePercent: -14.5 },
      { period: '2025-02-01', amount: 5200, changeFromPrev: -100, changePercent: -1.9 },
      { period: '2025-03-01', amount: 6120, changeFromPrev: 920, changePercent: 17.7 },
    ],
  };
}

/** Build example insights from sample data (Polish) */
export function getExampleInsightOutput(): BuildInsightsResult {
  return buildInsights(getExampleInsightInput());
}

/**
 * Example Polish insight objects (for docs / reference).
 * These match the style produced by the engine.
 */
export const EXAMPLE_POLISH_INSIGHTS: Partial<FinancialInsight>[] = [
  {
    id: 'monthly-change-expense',
    type: 'monthly_change',
    severity: 'warning',
    title: 'Wzrost wydatków',
    description: 'Twoje wydatki wzrosły o 18% względem poprzedniego miesiąca.',
    value: 17.7,
    valueUnit: '%',
  },
  {
    id: 'budget-alert-warning-cat-2',
    type: 'budget_alert',
    severity: 'warning',
    title: 'Zbliżasz się do limitu',
    description: 'Kategoria Jedzenie zbliża się do przekroczenia budżetu. Przy obecnym tempie przekroczysz budżet za 1 dzień.',
    relatedCategoryId: 'cat-2',
    value: 98,
    valueUnit: '%',
    ctaLabel: 'Zobacz budżety',
    ctaAction: 'budgets',
  },
  {
    id: 'category-trend-top',
    type: 'category_trend',
    severity: 'neutral',
    title: 'Największa kategoria wydatków',
    description: 'Najwięcej wydajesz na Restauracje.',
    relatedCategoryId: 'cat-1',
    value: 1200,
  },
  {
    id: 'momentum-daily',
    type: 'momentum',
    severity: 'neutral',
    title: 'Średnie dzienne wydatki',
    description: 'Średnio wydajesz 204 zł dziennie.',
    value: 204,
    valueUnit: 'PLN',
  },
  {
    id: 'momentum-forecast',
    type: 'momentum',
    severity: 'neutral',
    title: 'Prognoza na koniec miesiąca',
    description: 'Przy obecnym tempie zakończysz miesiąc z wydatkami na poziomie 6324 zł.',
    value: 6324,
    valueUnit: 'PLN',
  },
  {
    id: 'health-score-main',
    type: 'health_score',
    severity: 'positive',
    title: 'Zdrowie finansowe: Dobry',
    description: 'Twój wynik zdrowia finansowego (Dobry) wynika z dodatniego salda i dobrej kontroli budżetów.',
    value: 68,
    valueUnit: 'pts',
  },
  {
    id: 'goal-progress-remaining-goal-1',
    type: 'goal_progress',
    severity: 'neutral',
    title: 'Cel: Wakacje',
    description: 'Do osiągnięcia celu Wakacje brakuje 2550 zł.',
    relatedGoalId: 'goal-1',
    value: 2550,
    valueUnit: 'PLN',
    ctaLabel: 'Zobacz cele',
    ctaAction: 'goals',
  },
  {
    id: 'goal-progress-monthly-goal-1',
    type: 'goal_progress',
    severity: 'neutral',
    title: 'Rekomendacja miesięczna',
    description: 'Aby osiągnąć cel Wakacje na czas, warto odkładać średnio 638 zł miesięcznie.',
    relatedGoalId: 'goal-1',
    value: 638,
    valueUnit: 'PLN',
    ctaLabel: 'Zobacz cele',
    ctaAction: 'goals',
  },
];
