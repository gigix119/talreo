/**
 * Category breakdown — compact donut + ranked list.
 * Premium fintech layout.
 */
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsColors, analyticsShadows, analyticsRadius } from '@/constants/analyticsTheme';
import { formatAmount } from '@/utils/currency';
import type { CategoryBreakdownItem } from '@/types/database';

const CHART_COLORS = [
  analyticsColors.balance,
  analyticsColors.income,
  analyticsColors.expense,
  '#8B5CF6',
  '#F59E0B',
  '#06B6D4',
  '#EC4899',
  '#6366F1',
];

const screenWidth = Dimensions.get('window').width - 48;

interface CategoryBreakdownSectionProps {
  expenseData: CategoryBreakdownItem[];
  incomeData: CategoryBreakdownItem[];
  currency: string;
  emptyExpenseText: string;
  emptyIncomeText: string;
  onExpenseSegmentPress?: (item: CategoryBreakdownItem) => void;
}

export function CategoryBreakdownSection({
  expenseData,
  incomeData,
  currency,
  emptyExpenseText,
  emptyIncomeText,
  onExpenseSegmentPress,
}: CategoryBreakdownSectionProps) {
  const { t } = useI18n();

  return (
    <View style={{ flexDirection: 'column', gap: theme.spacing.lg }}>
      {/* Expenses — donut + ranked list */}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: analyticsRadius.card,
          padding: theme.spacing.lg,
          ...analyticsShadows.card,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary, marginBottom: theme.spacing.md }}>
          {t('analytics.expenseBreakdown')}
        </Text>
        {expenseData.length === 0 ? (
          <Text style={{ fontSize: 14, color: theme.colors.text.tertiary }}>{emptyExpenseText}</Text>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <View style={{ alignItems: 'center', marginRight: theme.spacing.lg }}>
              <PieChart
                data={expenseData.slice(0, 6).map((d, i) => ({
                  value: d.amount,
                  color: CHART_COLORS[i % CHART_COLORS.length],
                  text: '',
                  onPress: () => onExpenseSegmentPress?.(d),
                }))}
                radius={Math.min(72, screenWidth / 5)}
                focusOnPress
                centerLabelComponent={() => {
                  const total = expenseData.reduce((s, x) => s + x.amount, 0);
                  return (
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 11, color: theme.colors.text.tertiary }}>Total</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.text.primary }}>
                        {formatAmount(total, currency)}
                      </Text>
                    </View>
                  );
                }}
              />
            </View>
            <View style={{ flex: 1, minWidth: 140 }}>
              {expenseData.slice(0, 5).map((item, i) => (
                <Pressable
                  key={item.category_id ?? item.category_name}
                  onPress={() => onExpenseSegmentPress?.(item)}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      marginRight: 8,
                    }}
                  />
                  <Text style={{ fontSize: 13, color: theme.colors.text.primary, flex: 1 }} numberOfLines={1}>
                    {item.category_name}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text.primary }}>
                    {formatAmount(item.amount, currency)}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.colors.text.tertiary, marginLeft: 4, minWidth: 36 }}>
                    {item.percent.toFixed(0)}%
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Income — compact donut + list */}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: analyticsRadius.card,
          padding: theme.spacing.lg,
          ...analyticsShadows.card,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary, marginBottom: theme.spacing.md }}>
          {t('analytics.incomeBreakdown')}
        </Text>
        {incomeData.length === 0 ? (
          <Text style={{ fontSize: 14, color: theme.colors.text.tertiary }}>{emptyIncomeText}</Text>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <View style={{ alignItems: 'center', marginRight: theme.spacing.lg }}>
              <PieChart
                data={incomeData.slice(0, 6).map((d, i) => ({
                  value: d.amount,
                  color: CHART_COLORS[(i + 2) % CHART_COLORS.length],
                  text: '',
                }))}
                radius={Math.min(72, screenWidth / 5)}
                focusOnPress
                centerLabelComponent={() => {
                  const total = incomeData.reduce((s, x) => s + x.amount, 0);
                  return (
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 11, color: theme.colors.text.tertiary }}>Total</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: analyticsColors.income }}>
                        {formatAmount(total, currency)}
                      </Text>
                    </View>
                  );
                }}
              />
            </View>
            <View style={{ flex: 1, minWidth: 140 }}>
              {incomeData.slice(0, 5).map((item, i) => (
                <View key={item.category_id ?? item.category_name} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: CHART_COLORS[(i + 2) % CHART_COLORS.length],
                      marginRight: 8,
                    }}
                  />
                  <Text style={{ fontSize: 13, color: theme.colors.text.primary, flex: 1 }} numberOfLines={1}>
                    {item.category_name}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: analyticsColors.income }}>
                    {formatAmount(item.amount, currency)}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.colors.text.tertiary, marginLeft: 4, minWidth: 36 }}>
                    {item.percent.toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
