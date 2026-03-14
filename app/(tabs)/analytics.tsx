/**
 * Analytics — mobile-first hierarchy: Header → Key metrics → Insight → Chart → Categories → Comparison → AI
 */
import { memo, useCallback, useState } from 'react';
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
  FinancialTrendChart,
  CategoryDetailsPanel,
  RangeComparisonCard,
  AIInsightWidget,
  SpendingCategoriesWidget,
  KPISummaryRow,
} from '@/components/analytics';
import { AnalyticsSkeleton } from '@/components/analytics/AnalyticsSkeleton';
import { theme } from '@/constants/theme';
import { analyticsSpacing } from '@/constants/analyticsTheme';
import { BOTTOM_CONTENT_PADDING } from '@/constants/layout';
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
    insights,
    rangeComparison,
    loading,
    error,
    refetch,
  } = useAnalyticsDashboard(month, monthCount, filters);

  const safeTrend = Array.isArray(trend) ? trend : [];
  const safeRawExpense = Array.isArray(rawExpenseBreakdown) ? rawExpenseBreakdown : [];
  const safeRawIncome = Array.isArray(rawIncomeBreakdown) ? rawIncomeBreakdown : [];
  const safeCategoryPerf = Array.isArray(categoryPerformance) ? categoryPerformance : [];
  const safeInsights = Array.isArray(insights) ? insights : [];
  const safeExpenseBreakdown = Array.isArray(expenseBreakdown) ? expenseBreakdown : [];

  const budgetInfoForCategory = useCallback(
    (categoryId: string | null, categoryName: string) => {
      const row = safeCategoryPerf.find(
        (r) => (r.categoryId && r.categoryId === categoryId) || r.categoryName === categoryName
      );
      return row && row.budget > 0
        ? { spent: row.spent, budget: row.budget, remaining: row.remaining }
        : null;
    },
    [safeCategoryPerf]
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
    safeRawExpense.length > 0 ||
    safeRawIncome.length > 0 ||
    safeTrend.some((item) => (item?.balance ?? 0) !== 0 || (item?.income ?? 0) !== 0 || (item?.expense ?? 0) !== 0) ||
    safeCategoryPerf.length > 0;

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
          paddingTop: 16,
          paddingBottom: BOTTOM_CONTENT_PADDING,
          backgroundColor: theme.colors.background,
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <AnalyticsHeader
          month={month}
          monthCount={monthCount}
          recentMonths={recentMonths}
          onMonthChange={setMonth}
          onRangeChange={setMonthCount}
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
            {/* 1. Key metrics */}
            <KPISummaryRow trend={safeTrend} currency={currency} />

            {/* 2. Insight / warning */}
            {safeInsights.length > 0 && (
              <View
                style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.md,
                  borderLeftWidth: 3,
                  borderLeftColor:
                    safeInsights[0]?.type === 'warning'
                      ? theme.colors.warning
                      : safeInsights[0]?.type === 'success'
                        ? theme.colors.success
                        : theme.colors.primary,
                }}
              >
                <Text style={{ fontSize: 14, lineHeight: 20, color: theme.colors.text.primary }}>{safeInsights[0]?.text ?? ''}</Text>
              </View>
            )}

            {/* 3. Trend chart */}
            <ChartSection
              trend={safeTrend}
              currency={currency}
              title={t('analytics.monthlyTrend')}
              emptyText={t('analytics.noData')}
            />

            {/* 4. Categories */}
            <SpendingCategoriesWidget
              expenseData={safeExpenseBreakdown}
              categoryPerformance={safeCategoryPerf}
              currency={currency}
              emptyText={t('analytics.noExpenses')}
              onCategoryPress={handleCategoryPress}
            />

            {/* 5. Comparison */}
            {rangeComparison && (
              <RangeComparisonCard
                data={rangeComparison}
                currency={currency}
                rangeALabel={rangeALabel}
                rangeBLabel={rangeBLabel}
              />
            )}

            {/* 6. AI insights */}
            <AIInsightWidget insights={safeInsights} />
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
