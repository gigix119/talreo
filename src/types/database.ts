/**
 * Database types — profiles and future tables.
 */
export type AccountType = 'individual' | 'business';

export type Currency = 'PLN' | 'EUR' | 'USD';

export const CURRENCIES: Currency[] = ['PLN', 'EUR', 'USD'];

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  account_type: AccountType;
  onboarding_completed: boolean;
  avatar_url: string | null;
  currency: Currency;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  full_name?: string | null;
  onboarding_completed?: boolean;
  avatar_url?: string | null;
  currency?: Currency;
}

// Categories & Transactions
export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  icon: string | null;
  color: string | null;
  created_at: string;
}

export interface CategoryInsert {
  name: string;
  type: TransactionType;
  icon?: string | null;
  color?: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  note: string | null;
  transaction_date: string;
  created_at: string;
}

export interface TransactionInsert {
  category_id?: string | null;
  type: TransactionType;
  amount: number;
  note?: string | null;
  transaction_date?: string;
}

// Budgets
export type BudgetStatus = 'ok' | 'warning' | 'exceeded';

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  amount: number;
  created_at: string;
}

export interface BudgetUpsert {
  category_id: string;
  month: string; // YYYY-MM-01
  amount: number;
}

export interface BudgetProgress {
  budget: Budget;
  category_name: string;
  budgetAmount: number;
  spentAmount: number;
  remaining: number;
  progressPercent: number;
  status: BudgetStatus;
}

// Recurring transactions
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  note: string | null;
  frequency: RecurringFrequency;
  start_date: string;
  end_date: string | null;
  last_generated_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface RecurringTransactionInsert {
  category_id?: string | null;
  type: TransactionType;
  amount: number;
  note?: string | null;
  frequency: RecurringFrequency;
  start_date: string;
  end_date?: string | null;
}

export interface RecurringTransactionUpdate {
  category_id?: string | null;
  type?: TransactionType;
  amount?: number;
  note?: string | null;
  frequency?: RecurringFrequency;
  start_date?: string;
  end_date?: string | null;
  is_active?: boolean;
}

// Analytics
export interface CategoryBreakdownItem {
  category_id: string | null;
  category_name: string;
  amount: number;
  percent: number;
}

export interface MonthlyTrendItem {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface BudgetVsActualItem {
  category_id: string;
  category_name: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  percentUsed: number;
}

// Insights
export interface MonthlyInsight {
  id: string;
  type: 'info' | 'success' | 'warning' | 'highlight';
  text: string;
  value?: string | number;
}

export interface MonthlyInsightsData {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  topExpenseCategory: { name: string; amount: number } | null;
  topIncomeCategory: { name: string; amount: number } | null;
  biggestExpenseTransaction: { note: string; amount: number } | null;
  biggestIncomeTransaction: { note: string; amount: number } | null;
  expenseChangeVsPrev: number | null;
  incomeChangeVsPrev: number | null;
  budgetSummary: { exceeded: number; warning: number; ok: number };
  transactionCount: number;
  insights: MonthlyInsight[];
}

// Savings goals
export type GoalStatus = 'active' | 'completed' | 'overdue';

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  icon: string | null;
  color: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface SavingsGoalInsert {
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date?: string | null;
  icon?: string | null;
  color?: string | null;
}

export interface SavingsGoalUpdate {
  name?: string;
  target_amount?: number;
  current_amount?: number;
  target_date?: string | null;
  icon?: string | null;
  color?: string | null;
  is_completed?: boolean;
}

export interface SavingsGoalWithStatus extends SavingsGoal {
  progressPercent: number;
  remaining: number;
  status: GoalStatus;
}

// Alerts
export type AlertType =
  | 'budget_exceeded'
  | 'budget_warning'
  | 'goal_completed'
  | 'unusual_expense'
  | 'recurring_generated';

export interface Alert {
  id: string;
  user_id: string;
  type: AlertType;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface AlertInsert {
  type: AlertType;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
}

// User settings
export type ThemePreference = 'system' | 'light' | 'dark';
export type Language = 'pl' | 'en';

export interface UserSettings {
  id: string;
  user_id: string;
  theme_preference: ThemePreference;
  notifications_enabled: boolean;
  default_transaction_type: TransactionType;
  monthly_start_day: number;
  language: Language;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsUpdate {
  theme_preference?: ThemePreference;
  notifications_enabled?: boolean;
  default_transaction_type?: TransactionType;
  monthly_start_day?: number;
  language?: Language;
}
