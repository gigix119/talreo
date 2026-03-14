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
          <Text style={{ fontSize: 11, color: theme.colors.text.tertiary, fontWeight: '500' }}>
            {label}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text.primary, marginTop: 2, letterSpacing: -0.3 }} numberOfLines={1}>
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
  if (trend.length === 0) return null;

  const curr = trend[trend.length - 1];
  const prev = trend.length > 1 ? trend[trend.length - 2] : null;

  const incomeTrend = prev && prev.income > 0
    ? ((curr.income - prev.income) / prev.income) * 100
    : null;
  const expenseTrend = prev && prev.expense > 0
    ? ((curr.expense - prev.expense) / prev.expense) * 100
    : null;
  const balanceTrend = prev && prev.balance !== 0
    ? ((curr.balance - prev.balance) / Math.abs(prev.balance)) * 100
    : null;

  const savingsRate = curr.income > 0
    ? Math.max(0, ((curr.income - curr.expense) / curr.income) * 100)
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
          value={curr.income}
          valueFormatter={(v) => formatAmount(v, currency)}
          trendPercent={incomeTrend}
          sparklineData={trend.map((x) => x.income)}
          color={analyticsColors.income}
          isExpense={false}
          trendVsLast={t('analytics.trendVsLast')}
        />
        <KPICard
          label={t('analytics.totalExpenses')}
          value={curr.expense}
          valueFormatter={(v) => formatAmount(v, currency)}
          trendPercent={expenseTrend}
          sparklineData={trend.map((x) => x.expense)}
          color={analyticsColors.expense}
          isExpense={true}
          trendVsLast={t('analytics.trendVsLast')}
        />
        <KPICard
          label={t('analytics.balance')}
          value={curr.balance}
          valueFormatter={(v) => formatAmount(v, currency)}
          trendPercent={balanceTrend}
          sparklineData={trend.map((x) => x.balance)}
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
