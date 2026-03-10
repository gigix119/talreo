/**
 * Advanced trend chart — toggle income/expense/balance, tooltip.
 */
import { useState } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Card } from '@/components/ui/Card';
import { Pressable } from 'react-native';
import { theme } from '@/constants/theme';
import { analyticsColors } from '@/constants/analyticsTheme';
import { formatAmount } from '@/utils/currency';
import type { MonthlyTrendItem } from '@/types/database';

const screenWidth = Dimensions.get('window').width - 48;

interface AdvancedTrendChartProps {
  data: MonthlyTrendItem[];
  currency: string;
  title: string;
  emptyText: string;
}

type Series = 'income' | 'expense' | 'balance';

export function AdvancedTrendChart({
  data,
  currency,
  title,
  emptyText,
}: AdvancedTrendChartProps) {
  const [selectedSeries, setSelectedSeries] = useState<Series>('balance');

  if (data.length === 0) {
    return (
      <Card padding="lg" elevated style={{ marginTop: theme.spacing.md, alignItems: 'center' }}>
        <Text style={{ fontSize: 15, color: theme.colors.text.secondary }}>{title}</Text>
        <Text style={{ fontSize: 13, color: theme.colors.text.tertiary, marginTop: 8 }}>{emptyText}</Text>
      </Card>
    );
  }

  const labels = data.map((d) => new Date(d.month + 'T00:00:00').toLocaleDateString('pl-PL', { month: 'short' }));
  const incomeData = data.map((d, i) => ({
    value: d.income,
    label: labels[i],
    dataPointText: formatAmount(d.income, currency),
  }));
  const expenseData = data.map((d, i) => ({
    value: d.expense,
    label: labels[i],
    dataPointText: formatAmount(d.expense, currency),
  }));
  const balanceData = data.map((d, i) => ({
    value: d.balance,
    label: labels[i],
    dataPointText: formatAmount(d.balance, currency),
  }));

  const seriesData = selectedSeries === 'income' ? incomeData : selectedSeries === 'expense' ? expenseData : balanceData;
  const color = selectedSeries === 'income' ? analyticsColors.income : selectedSeries === 'expense' ? analyticsColors.expense : analyticsColors.balance;

  return (
    <View style={{ marginTop: theme.spacing.xl }}>
      <Text style={{ fontSize: 17, fontWeight: '600', color: theme.colors.text.primary }}>{title}</Text>
      <Card padding="lg" elevated style={{ marginTop: theme.spacing.sm, borderRadius: theme.radius.xl }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
          {(['income', 'expense', 'balance'] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setSelectedSeries(s)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: 6,
                borderRadius: theme.radius.sm,
                backgroundColor: selectedSeries === s ? (s === 'income' ? analyticsColors.incomeMuted : s === 'expense' ? analyticsColors.expenseMuted : analyticsColors.balanceMuted) : theme.colors.background,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: s === 'income' ? analyticsColors.income : s === 'expense' ? analyticsColors.expense : analyticsColors.balance,
                  marginRight: 6,
                }}
              />
              <Text style={{ fontSize: 13, color: theme.colors.text.primary }}>
                {s === 'income' ? 'Income' : s === 'expense' ? 'Expenses' : 'Balance'}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={seriesData}
            width={Math.max(screenWidth, data.length * 50)}
            height={200}
            color={color}
            thickness={2}
            hideDataPoints={false}
            dataPointsColor={color}
            startFillColor={`${color}20`}
            endFillColor={`${color}08`}
            startOpacity={0.9}
            endOpacity={0.2}
            initialSpacing={20}
            endSpacing={20}
            yAxisColor={theme.colors.border}
            xAxisColor={theme.colors.border}
            yAxisLabelWidth={50}
            noOfSections={4}
            formatYLabel={(v) => formatAmount(Number(v), currency)}
          />
        </ScrollView>
      </Card>
    </View>
  );
}
