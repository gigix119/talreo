/**
 * SpendingChart — mini daily expense trend for transactions screen.
 */
import { memo, useMemo } from 'react';
import { View, Text, useWindowDimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import type { Currency } from '@/types/database';

interface TransactionForChart {
  transaction_date: string;
  amount: number;
  type: string;
}

interface SpendingChartProps {
  transactions: TransactionForChart[];
  currency: Currency;
}

function getDailyExpenses(transactions: TransactionForChart[]): { value: number; label: string }[] {
  const byDate = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const d = t.transaction_date;
    byDate.set(d, (byDate.get(d) ?? 0) + Number(t.amount));
  }
  const dates = Array.from(byDate.keys()).sort();
  if (dates.length === 0) return [];
  return dates.map((d) => ({
    value: byDate.get(d)!,
    label: d.slice(8, 10),
  }));
}

export const SpendingChart = memo(function SpendingChart({
  transactions,
  currency,
}: SpendingChartProps) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(280, Math.min(width - 48, 400));

  const data = useMemo(() => getDailyExpenses(transactions), [transactions]);

  if (data.length < 2) return null;

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.sm,
        }}
      >
        {t('transactions.spendingTrend')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={data}
          width={Math.max(chartWidth, data.length * 24)}
          height={100}
          color={theme.colors.expense}
          thickness={2}
          hideDataPoints={data.length > 12}
          dataPointsColor={theme.colors.expense}
          yAxisColor="transparent"
          xAxisColor={theme.colors.border}
          noOfSections={3}
          initialSpacing={12}
          endSpacing={12}
        />
      </ScrollView>
    </View>
  );
});
