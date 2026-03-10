/**
 * Analytics — financial experience with interactive widgets.
 * Mobile-first, premium fintech feel.
 */
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useAnalyticsDashboard, fetchCategoryDetails } from '@/hooks/useAnalyticsDashboard';
import { useI18n } from '@/i18n';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  AnalyticsHeader,
  FinancialHealthScore,
  FinancialTrendChart,
  CategoryDetailsPanel,
  RangeComparisonCard,
  LargestExpensesList,
  CategoryFilterChips,
  CashflowStoryWidget,
  SpendingBehaviorWidget,
  BudgetStatusWidget,
  SavingsMomentumWidget,
  AIInsightWidget,
} from '@/components/analytics';
import { AnalyticsSkeleton } from '@/components/analytics/AnalyticsSkeleton';
import { theme } from '@/constants/theme';
import { analyticsSpacing } from '@/constants/analyticsTheme';
import { formatMonth, getCurrentMonth, getRecentMonths, getFirstDayOfMonth } from '@/utils/date';
import type { CategoryBreakdownItem } from '@/types/database';
import type { CategoryDetails } from '@/types/analytics';

function monthAdd(month: string, delta: number): string {
  const d = new Date(month + 'T00:00:00');
  d.setMonth(d.getMonth() + delta);
  return getFirstDayOfMonth(d.getFullYear(), d.getMonth());
}

export default function AnalyticsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const { profile } = useProfile();
  const currency = (profile?.currency ?? 'PLN') as import('@/types/database').Currency;
  const currentMonth = getCurrentMonth();
  const [month, setMonth] = useState(currentMonth);
  const [monthCount, setMonthCount] = useState(6);
  const [filters, setFilters] = useState<{ categoryIds: string[]; type: 'all' | 'expense' | 'income' }>({ categoryIds: [], type: 'all' });
  const [categoryDetails, setCategoryDetails] = useState<CategoryDetails | null>(null);
  const [detailsPanelVisible, setDetailsPanelVisible] = useState(false);

  const {
    expenseBreakdown,
    incomeBreakdown,
    rawExpenseBreakdown,
    rawIncomeBreakdown,
    trend,
    categoryPerformance,
    largestExpenses,
    velocity,
    insights,
    rangeComparison,
    loading,
    error,
    refetch,
  } = useAnalyticsDashboard(month, monthCount, filters);

  const budgetInfoForCategory = useCallback(
    (categoryId: string | null, categoryName: string) => {
      const row = categoryPerformance.find(
        (r) => (r.categoryId && r.categoryId === categoryId) || r.categoryName === categoryName
      );
      return row && row.budget > 0
        ? { spent: row.spent, budget: row.budget, remaining: row.remaining }
        : null;
    },
    [categoryPerformance]
  );

  const [selectedBudgetInfo, setSelectedBudgetInfo] = useState<{ spent: number; budget: number; remaining: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleCategoryPress = useCallback(
    async (item: CategoryBreakdownItem) => {
      if (!user?.id) return;
      setDetailsPanelVisible(true);
      setSelectedBudgetInfo(budgetInfoForCategory(item.category_id, item.category_name));
      const details = await fetchCategoryDetails(
        user.id,
        item.category_id,
        item.category_name,
        month
      );
      setCategoryDetails(details);
    },
    [user?.id, month, budgetInfoForCategory]
  );

  const recentMonths = getRecentMonths(12);
  const rangeALabel = `${formatMonth(monthAdd(month, -3))} - ${formatMonth(monthAdd(month, -1))}`;
  const rangeBLabel = formatMonth(month);

  const hasAnyData =
    rawExpenseBreakdown.length > 0 ||
    rawIncomeBreakdown.length > 0 ||
    trend.some((item) => item.balance !== 0 || item.income !== 0 || item.expense !== 0) ||
    categoryPerformance.length > 0;

  if (loading) {
    return (
      <ScreenContainer>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: theme.spacing.lg, paddingTop: 48 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ marginBottom: analyticsSpacing.sectionGap }}>
            <View style={{ width: 120, height: 28, backgroundColor: theme.colors.border, borderRadius: 8, opacity: 0.5, marginBottom: 8 }} />
            <View style={{ width: 200, height: 16, backgroundColor: theme.colors.border, borderRadius: 6, opacity: 0.4 }} />
          </View>
          <AnalyticsSkeleton />
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingTop: 48,
          paddingBottom: theme.spacing.xxl,
          backgroundColor: theme.colors.background,
        }}
        showsVerticalScrollIndicator={false}
      >
        <AnalyticsHeader
          month={month}
          monthCount={monthCount}
          recentMonths={recentMonths}
          onMonthChange={setMonth}
          onRangeChange={setMonthCount}
        />

        <CategoryFilterChips
          expenseCategories={rawExpenseBreakdown}
          incomeCategories={rawIncomeBreakdown}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {error ? (
          <Text style={{ color: theme.colors.error, marginBottom: theme.spacing.md }}>{error}</Text>
        ) : null}

        {!hasAnyData ? (
          <View style={{ marginTop: analyticsSpacing.sectionGap }}>
            <EmptyState
              title={t('analytics.noData')}
              description={t('empty.addFirst')}
              actionLabel={t('transactions.addTransaction')}
              onAction={() => router.push('/(modals)/add-transaction')}
              variant="card"
            />
          </View>
        ) : (
          <View style={{ gap: analyticsSpacing.sectionGap }}>
            {/* 1. Financial Health Score */}
            <FinancialHealthScore
              trend={trend}
              categoryPerformance={categoryPerformance}
              currency={currency}
            />

            {/* 2. Cashflow Story — narrative card */}
            <CashflowStoryWidget trend={trend} currency={currency} />

            {/* 3. Primary Chart */}
            <View>
              <FinancialTrendChart
                data={trend}
                currency={currency}
                title={t('analytics.monthlyTrend')}
                emptyText={t('analytics.noData')}
              />
            </View>

            {/* 4. Spending Behavior — category explorer */}
            <SpendingBehaviorWidget
              expenseData={expenseBreakdown}
              incomeData={incomeBreakdown}
              currency={currency}
              emptyExpenseText={t('analytics.noExpenses')}
              emptyIncomeText={t('analytics.noIncome')}
              onCategoryPress={handleCategoryPress}
            />

            {/* 5. Budget Status — smart bars + prediction */}
            <BudgetStatusWidget
              data={categoryPerformance}
              currency={currency}
              month={month}
              emptyText={t('analytics.noBudgets')}
            />

            {/* 6. Savings Momentum — daily avg + forecast */}
            <SavingsMomentumWidget
              velocity={velocity}
              currency={currency}
              emptyText={t('analytics.noExpenses')}
            />

            {/* 7. Largest Expenses */}
            {largestExpenses.length > 0 && (
              <View
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: 20,
                  padding: theme.spacing.lg,
                }}
              >
                <LargestExpensesList
                  items={largestExpenses}
                  currency={currency}
                  emptyText={t('analytics.noExpenses')}
                />
              </View>
            )}

            {/* 8. Range Comparison */}
            {rangeComparison && (
              <RangeComparisonCard
                data={rangeComparison}
                currency={currency}
                rangeALabel={rangeALabel}
                rangeBLabel={rangeBLabel}
              />
            )}

            {/* 9. AI Insight */}
            <AIInsightWidget insights={insights} />
          </View>
        )}
      </ScrollView>

      <CategoryDetailsPanel
        visible={detailsPanelVisible}
        details={categoryDetails}
        currency={currency}
        budgetInfo={selectedBudgetInfo}
        onClose={() => {
          setDetailsPanelVisible(false);
          setCategoryDetails(null);
          setSelectedBudgetInfo(null);
        }}
      />
    </ScreenContainer>
  );
}
