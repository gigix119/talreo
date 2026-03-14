/**
 * Interactive pie chart with tooltip on press and drill-down.
 */
import { useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useI18n } from '@/i18n';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/theme';
import { formatAmount, formatPercent } from '@/utils/currency';
import type { CategoryBreakdownItem } from '@/types/database';

const CHART_COLORS = [
  '#3B82F6',
  '#22C55E',
  '#8B5CF6',
  '#F59E0B',
  '#EF4444',
  '#06B6D4',
  '#EC4899',
  '#6366F1',
];

const screenWidth = Dimensions.get('window').width - 48;

interface AnalyticsCategoryPieChartProps {
  data: CategoryBreakdownItem[];
  title: string;
  emptyText: string;
  currency: string;
  onSegmentPress?: (item: CategoryBreakdownItem) => void;
}

export function AnalyticsCategoryPieChart({
  data,
  title,
  emptyText,
  currency,
  onSegmentPress,
}: AnalyticsCategoryPieChartProps) {
  const { t, locale } = useI18n();
  const [selectedItem, setSelectedItem] = useState<CategoryBreakdownItem | null>(null);

  if (data.length === 0) {
    return (
      <Card padding="lg" elevated style={{ marginTop: theme.spacing.md, alignItems: 'center' }}>
        <Text style={{ fontSize: 15, color: theme.colors.text.secondary }}>{title}</Text>
        <Text style={{ fontSize: 13, color: theme.colors.text.tertiary, marginTop: 8 }}>
          {emptyText}
        </Text>
      </Card>
    );
  }

  const total = data.reduce((s, d) => s + d.amount, 0);
  const pieData = data.map((d, i) => ({
    value: d.amount,
    color: CHART_COLORS[i % CHART_COLORS.length],
    text: d.category_name.slice(0, 10),
    onPress: () => {
      setSelectedItem(d);
      onSegmentPress?.(d);
    },
  }));

  return (
    <View style={{ marginTop: theme.spacing.md }}>
      <Text style={{ fontSize: 17, fontWeight: '600', color: theme.colors.text.primary }}>
        {title}
      </Text>
      <Card padding="lg" elevated style={{ marginTop: theme.spacing.sm, alignItems: 'center', borderRadius: theme.radius.xl }}>
        <PieChart
          data={pieData}
          radius={Math.min(100, screenWidth / 3)}
          focusOnPress
          centerLabelComponent={() => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>Total</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text.primary }}>
                {formatAmount(total, currency)}
              </Text>
            </View>
          )}
        />
        {selectedItem && (
          <Pressable
            onPress={() => onSegmentPress?.(selectedItem)}
            style={{
              marginTop: theme.spacing.md,
              padding: theme.spacing.md,
              backgroundColor: theme.colors.background,
              borderRadius: theme.radius.md,
              width: '100%',
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>
              {selectedItem.category_name}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.primary, marginTop: 4 }}>
              {formatAmount(selectedItem.amount, currency)}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 }}>
              {formatPercent(selectedItem.percent, 1, locale)} {t('analytics.percentOfExpensesLabel')}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.primary, marginTop: 4 }}>
              {t('analytics.tapToSeeDetails')}
            </Text>
          </Pressable>
        )}
      </Card>
    </View>
  );
}
