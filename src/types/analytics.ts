/**
 * Advanced analytics types for Talreo dashboard.
 */
import type { Transaction } from './database';

export interface DateRange {
  /** YYYY-MM-01 */
  startMonth: string;
  /** YYYY-MM-01 */
  endMonth: string;
}

export interface RangeComparisonResult {
  rangeA: { totalExpense: number; totalIncome: number; balance: number };
  rangeB: { totalExpense: number; totalIncome: number; balance: number };
  change: {
    expense: number | null;
    income: number | null;
    balance: number | null;
  };
  /** Category breakdown for both ranges */
  categoryChanges: CategoryRangeComparison[];
}

export interface CategoryRangeComparison {
  categoryId: string | null;
  categoryName: string;
  rangeAAmount: number;
  rangeBAmount: number;
  /** Null when rangeAAmount=0 (avoids misleading +100%) */
  changePercent: number | null;
}

export interface CategoryDetails {
  categoryId: string | null;
  categoryName: string;
  totalSpent: number;
  avgTransaction: number;
  largestTransaction: number;
  transactionCount: number;
  monthlyTrend: { month: string; amount: number }[];
  transactions: Transaction[];
}

export interface CategoryPerformanceRow {
  categoryId: string | null;
  categoryName: string;
  spent: number;
  budget: number;
  remaining: number;
  percentOfExpenses: number;
  /** Null when prev month had no spend in this category (avoids misleading +100%) */
  vsPrevMonthPercent: number | null;
}

export interface HeatmapCell {
  month: string;
  categoryId: string | null;
  categoryName: string;
  amount: number;
  normalized: number; // 0-1 for color intensity
}

export interface HeatmapData {
  months: string[];
  categories: { id: string | null; name: string }[];
  cells: HeatmapCell[];
  maxAmount: number;
}

export interface LargestExpense {
  id: string;
  note: string | null;
  amount: number;
  categoryName: string;
  transactionDate: string;
}

export interface SpendingVelocity {
  dailyAverage: number;
  forecastThisMonth: number;
  daysElapsed: number;
  daysInMonth: number;
  spentSoFar: number;
}

export type InsightCategory = 'warning' | 'opportunity' | 'trend' | 'success' | 'anomaly' | 'info';

export interface SmartInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'highlight';
  text: string;
  value?: string | number;
  /** Optional short title for card header */
  title?: string;
  /** Optional actionable recommendation */
  recommendation?: string;
  /** Optional category name (e.g. "Food") for context */
  categoryName?: string;
  /** Optional category for visual treatment */
  category?: InsightCategory;
}
