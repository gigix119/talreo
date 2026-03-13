/**
 * Analytics tab — premium fintech experience.
 * Order: 1) Financial Health  2) AI Copilot  3) Cashflow Chart
 * 4) Spending Categories  5) Budget Status  6) Spending Momentum  7) Largest Transactions.
 */
import { memo, useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View, Text, ScrollView, Pressable } from 'react-native';
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
  BudgetStatusWidget,
  SavingsMomentumWidget,
  AIInsightWidget,
  SpendingCategoriesWidget,
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

const ChartSection = memo(function ChartSection({
  trend,
  currency,
  title,
  emptyText,
}: {
  trend: import('@/types/database').MonthlyTrendItem[];
  currency: string;
  title: string;
  emptyText: string;
}) {
  return (
    <FinancialTrendChart data={trend} currency={currency} title={title} emptyText={emptyText} />
  );
});

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
          paddingTop: 32,
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

        {/* Time range switch: 1M / 3M / 6M / 12M */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.sm,
            gap: theme.spacing.sm,
          }}
        >
          {[
            { label: '1M', value: 1 },
            { label: '3M', value: 3 },
            { label: '6M', value: 6 },
            { label: '12M', value: 12 },
          ].map((opt) => {
            const active = monthCount === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setMonthCount(opt.value)}
                style={({ pressed }) => ({
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.radius.full,
                  backgroundColor: active ? theme.colors.primary : theme.colors.backgroundElevated,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: active ? '#FFFFFF' : theme.colors.text.secondary,
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

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
            {/* Large cashflow chart */}
            <ChartSection
              trend={trend}
              currency={currency}
              title={t('analytics.monthlyTrend')}
              emptyText={t('analytics.noData')}
            />

            {/* Categories list with percentages */}
            <SpendingCategoriesWidget
              expenseData={expenseBreakdown}
              categoryPerformance={categoryPerformance}
              currency={currency}
              emptyText={t('analytics.noExpenses')}
              onCategoryPress={handleCategoryPress}
            />

            {/* Financial health & AI insights below core analytics */}
            <FinancialHealthScore
              trend={trend}
              categoryPerformance={categoryPerformance}
              currency={currency}
            />

            <AIInsightWidget insights={insights} />

            {/* Budget status, momentum, largest transactions, comparisons */}
            <BudgetStatusWidget
              data={categoryPerformance}
              currency={currency}
              month={month}
              emptyText={t('analytics.noBudgets')}
            />

            <SavingsMomentumWidget
              velocity={velocity}
              currency={currency}
              emptyText={t('analytics.noExpenses')}
            />

            {largestExpenses.length > 0 && (
              <LargestExpensesList
                items={largestExpenses}
                currency={currency}
                emptyText={t('analytics.noExpenses')}
              />
            )}

            {rangeComparison && (
              <RangeComparisonCard
                data={rangeComparison}
                currency={currency}
                rangeALabel={rangeALabel}
                rangeBLabel={rangeBLabel}
              />
            )}
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
