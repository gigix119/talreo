/**
 * BudgetStatusWidget — smart budget bars with green/yellow/red + prediction.
 * "At this pace you will exceed this budget in 5 days."
 */
import { View, Text, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsColors, analyticsShadows, analyticsRadius } from '@/constants/analyticsTheme';
import { formatAmount } from '@/utils/currency';
import { getDaysElapsedInMonth, getDaysInMonth } from '@/utils/date';
import { InteractiveWidget } from './InteractiveWidget';
import type { CategoryPerformanceRow } from '@/types/analytics';
import type { Currency } from '@/types/database';

interface BudgetStatusWidgetProps {
  data: CategoryPerformanceRow[];
  currency: Currency;
  month: string;
  emptyText: string;
}

function getBarColor(pctUsed: number, overBudget: boolean): string {
  if (overBudget) return analyticsColors.expense;
  if (pctUsed >= 90) return analyticsColors.expense;
  if (pctUsed >= 75) return analyticsColors.warning;
  return analyticsColors.success;
}

function getPredictionText(
  row: CategoryPerformanceRow,
  daysElapsed: number,
  daysInMonth: number,
  t: (k: string) => string
): string | null {
  if (row.budget <= 0 || row.remaining <= 0) return null;
  if (daysElapsed <= 0) return null;
  const dailyAvg = row.spent / daysElapsed;
  if (dailyAvg <= 0) return null;
  const daysUntilExceed = Math.ceil(row.remaining / dailyAvg);
  if (daysUntilExceed > daysInMonth - daysElapsed) return null;
  return `${t('analytics.budgetExceedInDaysPrefix')} ${daysUntilExceed} ${t('analytics.budgetExceedInDaysSuffix')}`;
}

export function BudgetStatusWidget({
  data,
  currency,
  month,
  emptyText,
}: BudgetStatusWidgetProps) {
  const { t } = useI18n();
  const daysElapsed = getDaysElapsedInMonth(month);
  const daysInMonth = getDaysInMonth(month);

  if (data.length === 0) {
    return (
      <InteractiveWidget title={t('analytics.budgetStatus')} icon="🎯">
        <Text style={{ fontSize: 15, color: theme.colors.text.tertiary }}>{emptyText}</Text>
      </InteractiveWidget>
    );
  }

  return (
    <InteractiveWidget title={t('analytics.budgetStatus')} icon="🎯">
      <View style={{ gap: 10 }}>
        {data.map((row) => {
          const pctUsed = row.budget > 0 ? Math.min(100, (row.spent / row.budget) * 100) : 0;
          const overBudget = row.budget > 0 && row.spent > row.budget;
          const barColor = getBarColor(pctUsed, overBudget);
          const prediction = getPredictionText(row, daysElapsed, daysInMonth, t);

          return (
            <Pressable
              key={row.categoryId ?? row.categoryName}
              style={({ pressed }) => ({
                backgroundColor: theme.colors.background,
                borderRadius: theme.radius.sm,
                padding: theme.spacing.sm + 4,
                opacity: pressed ? 0.95 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }} numberOfLines={1}>
                  {row.categoryName}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.text.primary }}>
                  {formatAmount(row.spent, currency)}
                  <Text style={{ fontSize: 12, fontWeight: '500', color: theme.colors.text.tertiary }}> / {row.budget > 0 ? formatAmount(row.budget, currency) : '—'}</Text>
                </Text>
              </View>
              {row.budget > 0 && (
                <>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: theme.colors.border,
                      borderRadius: 3,
                      overflow: 'hidden',
                      marginTop: 6,
                    }}
                  >
                    <View
                      style={{
                        width: `${Math.min(100, pctUsed)}%`,
                        height: '100%',
                        backgroundColor: barColor,
                        borderRadius: 3,
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, flexWrap: 'wrap', gap: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: overBudget ? analyticsColors.expense : barColor }}>
                      {row.remaining >= 0 ? t('analytics.statusOnTrack') : t('analytics.statusOverBudget')}
                      {row.remaining >= 0 ? ` · ${formatAmount(row.remaining, currency)}` : ''}
                    </Text>
                    {prediction ? (
                      <Text style={{ fontSize: 11, fontWeight: '600', color: analyticsColors.warning }} numberOfLines={1}>
                        {prediction}
                      </Text>
                    ) : null}
                  </View>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </InteractiveWidget>
  );
}
