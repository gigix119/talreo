/**
 * SpendingBehaviorWidget — interactive category explorer.
 * Each category is tappable → opens detailed view (transactions, trend, budget).
 */
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsColors, analyticsShadows, analyticsRadius } from '@/constants/analyticsTheme';
import { formatAmount } from '@/utils/currency';
import { InteractiveWidget } from './InteractiveWidget';
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

interface SpendingBehaviorWidgetProps {
  expenseData: CategoryBreakdownItem[];
  incomeData: CategoryBreakdownItem[];
  currency: string;
  emptyExpenseText: string;
  emptyIncomeText: string;
  onCategoryPress?: (item: CategoryBreakdownItem) => void;
}

export function SpendingBehaviorWidget({
  expenseData,
  incomeData,
  currency,
  emptyExpenseText,
  emptyIncomeText,
  onCategoryPress,
}: SpendingBehaviorWidgetProps) {
  const { t } = useI18n();

  const expenseTotal = expenseData.reduce((s, x) => s + x.amount, 0);
  const incomeTotal = incomeData.reduce((s, x) => s + x.amount, 0);
  const hasData = expenseData.length > 0 || incomeData.length > 0;

  if (!hasData) {
    return (
      <InteractiveWidget title={t('analytics.spendingBehavior')} icon="📂">
        <Text style={{ fontSize: 15, color: theme.colors.text.tertiary }}>{emptyExpenseText}</Text>
      </InteractiveWidget>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {/* Expenses */}
      <InteractiveWidget title={t('analytics.expenseBreakdown')} icon="💸">
        {expenseData.length === 0 ? (
          <Text style={{ fontSize: 15, color: theme.colors.text.tertiary }}>{emptyExpenseText}</Text>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <View style={{ alignItems: 'center', marginRight: theme.spacing.lg }}>
              <PieChart
                data={expenseData.slice(0, 6).map((d, i) => ({
                  value: d.amount,
                  color: CHART_COLORS[i % CHART_COLORS.length],
                  text: '',
                  onPress: () => onCategoryPress?.(d),
                }))}
                radius={Math.min(72, screenWidth / 5)}
                focusOnPress
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 11, color: theme.colors.text.tertiary }}>Total</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.text.primary }}>
                      {formatAmount(expenseTotal, currency)}
                    </Text>
                  </View>
                )}
              />
            </View>
            <View style={{ flex: 1, minWidth: 140 }}>
              {expenseData.slice(0, 5).map((item, i) => (
                <Pressable
                  key={item.category_id ?? item.category_name}
                  onPress={() => onCategoryPress?.(item)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                    padding: 8,
                    borderRadius: analyticsRadius.badge,
                    backgroundColor: pressed ? theme.colors.background : 'transparent',
                  })}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      marginRight: 10,
                    }}
                  />
                  <Text style={{ fontSize: 14, color: theme.colors.text.primary, flex: 1 }} numberOfLines={1}>
                    {item.category_name}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>
                    {formatAmount(item.amount, currency)}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginLeft: 6, minWidth: 36 }}>
                    {item.percent.toFixed(0)}%
                  </Text>
                </Pressable>
              ))}
              <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: 4 }}>
                {t('analytics.tapToSeeDetails')}
              </Text>
            </View>
          </View>
        )}
      </InteractiveWidget>

      {/* Income */}
      <InteractiveWidget title={t('analytics.incomeBreakdown')} icon="📥">
        {incomeData.length === 0 ? (
          <Text style={{ fontSize: 15, color: theme.colors.text.tertiary }}>{emptyIncomeText}</Text>
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
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 11, color: theme.colors.text.tertiary }}>Total</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: analyticsColors.income }}>
                      {formatAmount(incomeTotal, currency)}
                    </Text>
                  </View>
                )}
              />
            </View>
            <View style={{ flex: 1, minWidth: 140 }}>
              {incomeData.slice(0, 5).map((item, i) => (
                <View
                  key={item.category_id ?? item.category_name}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: CHART_COLORS[(i + 2) % CHART_COLORS.length],
                      marginRight: 10,
                    }}
                  />
                  <Text style={{ fontSize: 14, color: theme.colors.text.primary, flex: 1 }} numberOfLines={1}>
                    {item.category_name}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: analyticsColors.income }}>
                    {formatAmount(item.amount, currency)}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginLeft: 6, minWidth: 36 }}>
                    {item.percent.toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </InteractiveWidget>
    </View>
  );
}
