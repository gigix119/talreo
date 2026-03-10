/**
 * Category performance — app-style cards with progress bars.
 * Premium finance UI, not spreadsheet.
 */
import { View, Text, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsColors, analyticsShadows, analyticsRadius } from '@/constants/analyticsTheme';
import { formatAmount } from '@/utils/currency';
import type { CategoryPerformanceRow } from '@/types/analytics';
import type { Currency } from '@/types/database';

interface CategoryPerformanceCardsProps {
  data: CategoryPerformanceRow[];
  currency: Currency;
  emptyText: string;
}

export function CategoryPerformanceCards({
  data,
  currency,
  emptyText,
}: CategoryPerformanceCardsProps) {
  const { t } = useI18n();

  if (data.length === 0) {
    return (
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: analyticsRadius.card,
          padding: theme.spacing.lg,
          ...analyticsShadows.card,
        }}
      >
        <Text style={{ fontSize: 15, color: theme.colors.text.secondary }}>{t('analytics.categoryPerformance')}</Text>
        <Text style={{ fontSize: 14, color: theme.colors.text.tertiary, marginTop: 8 }}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {data.map((row) => {
        const pctUsed = row.budget > 0 ? Math.min(100, (row.spent / row.budget) * 100) : 0;
        const overBudget = row.budget > 0 && row.spent > row.budget;
        const barColor = overBudget ? analyticsColors.expense : pctUsed >= 80 ? analyticsColors.warning : analyticsColors.success;
        return (
          <Pressable
            key={row.categoryId ?? row.categoryName}
            style={({ pressed }) => ({
              backgroundColor: theme.colors.surface,
              borderRadius: analyticsRadius.card,
              padding: theme.spacing.md,
              ...analyticsShadows.subtle,
              opacity: pressed ? 0.95 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }} numberOfLines={1}>
                {row.categoryName}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>
                  {formatAmount(row.spent, currency)}
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>
                  / {row.budget > 0 ? formatAmount(row.budget, currency) : '—'}
                </Text>
              </View>
            </View>
            {row.budget > 0 && (
              <>
                <View
                  style={{
                    height: 6,
                    backgroundColor: theme.colors.background,
                    borderRadius: 3,
                    overflow: 'hidden',
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>
                    {row.budget > 0
                      ? row.remaining >= 0
                        ? `${formatAmount(row.remaining, currency)} ${t('analytics.budgetLeft')}`
                        : `${formatAmount(Math.abs(row.remaining), currency)} ${t('analytics.budgetOver')}`
                      : '—'}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: analyticsRadius.badge,
                      backgroundColor: row.vsPrevMonthPercent < 0 ? analyticsColors.incomeMuted : row.vsPrevMonthPercent > 0 ? analyticsColors.expenseMuted : theme.colors.background,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: row.vsPrevMonthPercent < 0 ? analyticsColors.success : row.vsPrevMonthPercent > 0 ? analyticsColors.expense : theme.colors.text.secondary,
                      }}
                    >
                      {row.vsPrevMonthPercent >= 0 ? '↑' : '↓'} {Math.abs(row.vsPrevMonthPercent).toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
