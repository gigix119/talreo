/**
 * Financial health score — composite score from multiple factors.
 * Pure functions; no database access.
 */
import type { FinancialHealthScoreResult, FinancialHealthFactor } from './types';

export type HealthGrade = 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'poor';

export interface FinancialHealthInput {
  /** Monthly income */
  income: number;
  /** Monthly expense */
  expense: number;
  /** Number of budgets exceeded this month (0 = good) */
  budgetsExceededCount: number;
  /** Number of budgets in warning (80–99%) */
  budgetsWarningCount: number;
  /** Total number of budgets */
  totalBudgetsCount: number;
  /** Savings goals: count of active goals on track (progress >= expected by date) */
  goalsOnTrackCount: number;
  /** Savings goals: total active count */
  activeGoalsCount: number;
  /** Month-over-month expense change (negative = spending down = good) */
  expenseChangePercent: number | null;
  /** Savings rate 0–1 (savings / income) */
  savingsRate: number;
}

const GRADE_THRESHOLDS: { min: number; grade: HealthGrade }[] = [
  { min: 80, grade: 'excellent' },
  { min: 65, grade: 'good' },
  { min: 50, grade: 'fair' },
  { min: 35, grade: 'needs_improvement' },
  { min: 0, grade: 'poor' },
];

function scoreToGrade(score: number): HealthGrade {
  for (const { min, grade } of GRADE_THRESHOLDS) {
    if (score >= min) return grade;
  }
  return 'poor';
}

/**
 * Compute financial health score (0–100) from inputs.
 * Uses weighted factors: savings rate, budget adherence, goal progress, spending trend.
 */
export function computeFinancialHealthScore(input: FinancialHealthInput): FinancialHealthScoreResult {
  const factors: FinancialHealthFactor[] = [];
  let weightedSum = 0;
  let totalWeight = 0;

  // 1. Savings rate (0–100): higher is better
  const savingsScore = Math.min(100, Math.max(0, input.savingsRate * 100));
  const savingsWeight = 0.25;
  factors.push({
    id: 'savings_rate',
    label: 'Wskaźnik oszczędności',
    score: savingsScore,
    weight: savingsWeight,
    description: `Oszczędzasz ${(input.savingsRate * 100).toFixed(1)}% przychodów`,
  });
  weightedSum += savingsScore * savingsWeight;
  totalWeight += savingsWeight;

  // 2. Budget adherence: penalty for exceeded/warning
  const budgetPenalty = input.budgetsExceededCount * 30 + input.budgetsWarningCount * 10;
  const budgetScore = Math.max(0, 100 - budgetPenalty);
  const budgetWeight = 0.3;
  factors.push({
    id: 'budget_adherence',
    label: 'Kontrola budżetu',
    score: budgetScore,
    weight: budgetWeight,
    description:
      input.budgetsExceededCount > 0
        ? `${input.budgetsExceededCount} budżet(ów) przekroczonych`
        : input.budgetsWarningCount > 0
          ? `${input.budgetsWarningCount} budżet(ów) w ostrzeżeniu`
          : input.totalBudgetsCount > 0
            ? 'Wszystkie budżety pod kontrolą'
            : 'Brak ustawionych budżetów',
  });
  weightedSum += budgetScore * budgetWeight;
  totalWeight += budgetWeight;

  // 3. Goal progress: active goals on track
  const goalScore =
    input.activeGoalsCount === 0 ? 100 : (input.goalsOnTrackCount / input.activeGoalsCount) * 100;
  const goalWeight = 0.25;
  factors.push({
    id: 'goal_progress',
    label: 'Postęp celów oszczędnościowych',
    score: goalScore,
    weight: goalWeight,
    description:
      input.activeGoalsCount === 0
        ? 'Brak aktywnych celów'
        : `${input.goalsOnTrackCount}/${input.activeGoalsCount} celów na dobrej drodze`,
  });
  weightedSum += goalScore * goalWeight;
  totalWeight += goalWeight;

  // 4. Spending trend: expense down = good
  let trendScore = 75; // neutral default when no comparison
  if (input.expenseChangePercent != null) {
    if (input.expenseChangePercent <= -5) trendScore = 100;
    else if (input.expenseChangePercent <= 0) trendScore = 90;
    else if (input.expenseChangePercent <= 10) trendScore = 70;
    else if (input.expenseChangePercent <= 20) trendScore = 50;
    else trendScore = 30;
  }
  const trendWeight = 0.2;
  factors.push({
    id: 'spending_trend',
    label: 'Trend wydatków',
    score: trendScore,
    weight: trendWeight,
    description:
      input.expenseChangePercent == null
        ? 'Brak danych do porównania'
        : input.expenseChangePercent <= 0
          ? `Wydatki spadły o ${Math.abs(input.expenseChangePercent).toFixed(1)}%`
          : `Wydatki wzrosły o ${input.expenseChangePercent.toFixed(1)}%`,
  });
  weightedSum += trendScore * trendWeight;
  totalWeight += trendWeight;

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;
  const clampedScore = Math.min(100, Math.max(0, score));

  return {
    score: clampedScore,
    grade: scoreToGrade(clampedScore),
    factors,
  };
}
