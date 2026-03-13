/**
 * Premium financial insight types for Talreo.
 * Used by Dashboard, Analytics, Budgets, Goals.
 * All visible title/description in Polish when locale is PL.
 */

export type InsightSeverity = 'positive' | 'neutral' | 'warning' | 'danger';

export type InsightType =
  | 'monthly_change'
  | 'category_trend'
  | 'budget_alert'
  | 'momentum'
  | 'health_score'
  | 'goal_progress'
  | 'recommendation';

export interface FinancialInsight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  /** Short headline (e.g. for card title) */
  title: string;
  /** Actionable description */
  description: string;
  /** Optional CTA button label */
  ctaLabel?: string;
  /** Optional CTA action identifier for navigation */
  ctaAction?: string;
  /** Category id when insight is category-related */
  relatedCategoryId?: string | null;
  /** Budget id when insight is budget-related */
  relatedBudgetId?: string | null;
  /** Goal id when insight is goal-related */
  relatedGoalId?: string | null;
  /** Numeric value for display (e.g. amount, percent) */
  value?: number;
  /** Unit or currency code for value */
  valueUnit?: string;
}

/** Priority order: danger > warning > positive > neutral */
export const INSIGHT_SEVERITY_ORDER: Record<InsightSeverity, number> = {
  danger: 0,
  warning: 1,
  positive: 2,
  neutral: 3,
};
