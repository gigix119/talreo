/**
 * KPI Summary Row — premium finance cards with sparkline and trend.
 * Horizontally swipeable on mobile.
 */
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsColors, analyticsShadows, analyticsRadius } from '@/constants/analyticsTheme';
import { formatAmount } from '@/utils/currency';
import { MiniSparkline } from './MiniSparkline';
import type { MonthlyTrendItem } from '@/types/database';
import type { Currency } from '@/types/database';

interface KPISummaryRowProps {
  trend: MonthlyTrendItem[];
  currency: Currency;
}

function KPICard({
  label,
  value,
  valueFormatter,
  trendPercent,
  sparklineData,
  color,
  isExpense = false,
}: {
  label: string;
  value: number;
  valueFormatter: (v: number) => string;
  trendPercent: number | null;
  sparklineData: number[];
  color: string;
  isExpense?: boolean;
  trendVsLast: string;
}) {
  const showTrend = trendPercent !== null && !Number.isNaN(trendPercent);
  return (
    <Pressable
      style={({ pressed }) => ({
        width: 130,
        minWidth: 130,
        padding: theme.spacing.sm + 4,
        backgroundColor: theme.colors.surface,
        borderRadius: analyticsRadius.card,
        ...analyticsShadows.card,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: theme.colors.text.tertiary, fontWeight: '600' }}>
            {label}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: theme.colors.text.primary, marginTop: 4, letterSpacing: -0.3 }} numberOfLines={1}>
            {valueFormatter(value)}
          </Text>
          {showTrend && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: isExpense ? (trendPercent >= 0 ? analyticsColors.expense : analyticsColors.success) : (trendPercent >= 0 ? analyticsColors.success : analyticsColors.expense),
                }}
              >
                {trendPercent >= 0 ? '+' : ''}{trendPercent.toFixed(1)}%
              </Text>
              <Text style={{ fontSize: 11, color: theme.colors.text.tertiary }}>{trendVsLast}</Text>
            </View>
          )}
        </View>
        {sparklineData.length >= 2 && (
          <MiniSparkline data={sparklineData} color={color} />
        )}
      </View>
    </Pressable>
  );
}

export function KPISummaryRow({ trend, currency }: KPISummaryRowProps) {
  const { t } = useI18n();
  const safeTrend = Array.isArray(trend) ? trend : [];
  if (safeTrend.length === 0) return null;

  const curr = safeTrend[safeTrend.length - 1];
  const prev = safeTrend.length > 1 ? safeTrend[safeTrend.length - 2] : null;
  if (!curr) return null;

  const currIncome = typeof curr.income === 'number' ? curr.income : 0;
  const currExpense = typeof curr.expense === 'number' ? curr.expense : 0;
  const currBalance = typeof curr.balance === 'number' ? curr.balance : 0;
  const prevIncome = prev && typeof prev.income === 'number' ? prev.income : 0;
  const prevExpense = prev && typeof prev.expense === 'number' ? prev.expense : 0;
  const prevBalance = prev && typeof prev.balance === 'number' ? prev.balance : 0;

  const incomeTrend = prev && prevIncome > 0
    ? ((currIncome - prevIncome) / prevIncome) * 100
    : null;
  const expenseTrend = prev && prevExpense > 0
    ? ((currExpense - prevExpense) / prevExpense) * 100
    : null;
  const balanceTrend = prev && prevBalance !== 0
    ? ((currBalance - prevBalance) / Math.abs(prevBalance)) * 100
    : null;

  const savingsRate = currIncome > 0
    ? Math.max(0, ((currIncome - currExpense) / currIncome) * 100)
    : 0;

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 8,
          paddingVertical: 4,
          paddingRight: 16,
        }}
      >
        <KPICard
          label={t('analytics.totalIncome')}
          value={currIncome}
          valueFormatter={(v) => formatAmount(v, currency)}
          trendPercent={incomeTrend}
          sparklineData={safeTrend.map((x) => (typeof x?.income === 'number' ? x.income : 0))}
          color={analyticsColors.income}
          isExpense={false}
          trendVsLast={t('analytics.trendVsLast')}
        />
        <KPICard
          label={t('analytics.totalExpenses')}
          value={curr.expense}
          valueFormatter={(v) => formatAmount(v, currency)}
          trendPercent={expenseTrend}
          sparklineData={safeTrend.map((x) => (typeof x?.expense === 'number' ? x.expense : 0))}
          color={analyticsColors.expense}
          isExpense={true}
          trendVsLast={t('analytics.trendVsLast')}
        />
        <KPICard
          label={t('analytics.balance')}
          value={currBalance}
          valueFormatter={(v) => formatAmount(v, currency)}
          trendPercent={balanceTrend}
          sparklineData={safeTrend.map((x) => (typeof x?.balance === 'number' ? x.balance : 0))}
          color={analyticsColors.balance}
          isExpense={false}
          trendVsLast={t('analytics.trendVsLast')}
        />
        <KPICard
          label={t('analytics.savingsRate')}
          value={savingsRate}
          valueFormatter={(v) => `${v.toFixed(1)}%`}
          trendPercent={null}
          sparklineData={[]}
          color={analyticsColors.analytics}
          trendVsLast={t('analytics.trendVsLast')}
        />
      </ScrollView>
    </View>
  );
}
