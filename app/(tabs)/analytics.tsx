/**
 * Analytics — premium mobile-first fintech dashboard.
 * Copilot / Apple Stocks / Revolut inspired.
 */
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useAnalyticsDashboard, fetchCategoryDetails } from '@/hooks/useAnalyticsDashboard';
import { useI18n } from '@/i18n';
import { useResponsive } from '@/hooks/useResponsive';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  AnalyticsHeader,
  KPISummaryRow,
  CategoryBreakdownSection,
  CategoryDetailsPanel,
  RangeComparisonCard,
  CategoryPerformanceCards,
  PredictionsSection,
  FinancialHealthScore,
  FinancialTrendChart,
  AIFinancialAssistant,
  CategoryFilterChips,
  SectionHeader,
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
  const { isDesktop, isTablet } = useResponsive();
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

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleCategoryPress = useCallback(
    async (item: CategoryBreakdownItem) => {
      if (!user?.id) return;
      setDetailsPanelVisible(true);
      const details = await fetchCategoryDetails(
        user.id,
        item.category_id,
        item.category_name,
        month
      );
      setCategoryDetails(details);
    },
    [user?.id, month]
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
        {/* 1. Header — premium compact controls */}
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
            {/* 2. Financial Health Score */}
            <View>
              <SectionHeader title={t('analytics.financialHealthScore')} />
              <FinancialHealthScore
                trend={trend}
                categoryPerformance={categoryPerformance}
                currency={currency}
              />
            </View>

            {/* 3. Financial Summary — swipeable KPI cards */}
            <View>
              <SectionHeader title={t('analytics.sectionSummary')} />
              <KPISummaryRow trend={trend} currency={currency} />
            </View>

            {/* 4. Primary Chart — centerpiece */}
            <View>
              <SectionHeader title={t('analytics.sectionTrend')} />
              <FinancialTrendChart
                data={trend}
                currency={currency}
                title={t('analytics.monthlyTrend')}
                emptyText={t('analytics.noData')}
              />
            </View>

            {/* 5. Category Breakdown — donut + ranked list */}
            <View>
              <SectionHeader title={t('analytics.sectionBreakdown')} />
              <CategoryBreakdownSection
                expenseData={expenseBreakdown}
                incomeData={incomeBreakdown}
                currency={currency}
                emptyExpenseText={t('analytics.noExpenses')}
                emptyIncomeText={t('analytics.noIncome')}
                onExpenseSegmentPress={handleCategoryPress}
              />
            </View>

            {/* 6. Performance — app-style cards */}
            <View>
              <SectionHeader title={t('analytics.sectionPerformance')} />
              <CategoryPerformanceCards
                data={categoryPerformance}
                currency={currency}
                emptyText={t('analytics.noBudgets')}
              />
            </View>

            {/* 7. Predictions — pace + top expenses */}
            <View>
              <SectionHeader title={t('analytics.sectionPredictions')} />
              <PredictionsSection
                velocity={velocity}
                largestExpenses={largestExpenses}
                currency={currency}
                emptyText={t('analytics.noExpenses')}
              />
            </View>

            {/* 8. Range Comparison */}
            <View>
              <RangeComparisonCard
                data={rangeComparison}
                currency={currency}
                rangeALabel={rangeALabel}
                rangeBLabel={rangeBLabel}
              />
            </View>

            {/* 9. AI Financial Copilot */}
            <View>
              <SectionHeader title={t('analytics.aiFinancialCopilot')} subtitle={t('analytics.aiInsights')} />
              <AIFinancialAssistant insights={insights} />
            </View>
          </View>
        )}
      </ScrollView>

      <CategoryDetailsPanel
        visible={detailsPanelVisible}
        details={categoryDetails}
        currency={currency}
        onClose={() => {
          setDetailsPanelVisible(false);
          setCategoryDetails(null);
        }}
      />
    </ScreenContainer>
  );
}
