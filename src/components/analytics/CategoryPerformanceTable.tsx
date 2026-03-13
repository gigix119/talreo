/**
 * Category performance table — spent, budget, remaining, % expenses, vs prev month.
 */
import { View, Text, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { formatAmount } from '@/utils/currency';
import type { CategoryPerformanceRow } from '@/types/analytics';
import type { Currency } from '@/types/database';

interface CategoryPerformanceTableProps {
  data: CategoryPerformanceRow[];
  currency: Currency;
  emptyText: string;
}

export function CategoryPerformanceTable({
  data,
  currency,
  emptyText,
}: CategoryPerformanceTableProps) {
  const { t } = useI18n();
  if (data.length === 0) {
    return (
      <Card padding="lg" elevated style={{ marginTop: theme.spacing.md }}>
        <Text style={{ fontSize: 15, color: theme.colors.text.secondary }}>{t('analytics.categoryPerformance')}</Text>
        <Text style={{ fontSize: 13, color: theme.colors.text.tertiary, marginTop: 8 }}>{emptyText}</Text>
      </Card>
    );
  }

  return (
    <View style={{ marginTop: theme.spacing.md }}>
      <Text style={{ fontSize: 17, fontWeight: '600', color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>
        {t('analytics.categoryPerformance')}
      </Text>
      <Card padding="sm" elevated>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={{ flexDirection: 'row', paddingVertical: theme.spacing.md, borderBottomWidth: 2, borderBottomColor: theme.colors.border }}>
              <Cell header width={100}>{t('analytics.tableCategory')}</Cell>
              <Cell header width={72}>{t('analytics.tableSpent')}</Cell>
              <Cell header width={72}>{t('analytics.tableBudget')}</Cell>
              <Cell header width={72}>{t('analytics.tableRemaining')}</Cell>
              <Cell header width={80}>{t('analytics.tableUsage')}</Cell>
              <Cell header width={56}>{t('analytics.tableTrend')}</Cell>
            </View>
            {data.map((row) => {
              const pctUsed = row.budget > 0 ? Math.min(100, (row.spent / row.budget) * 100) : 0;
              const overBudget = row.budget > 0 && row.spent > row.budget;
              return (
                <View
                  key={row.categoryId ?? row.categoryName}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
                >
                  <Cell width={100}>{row.categoryName.slice(0, 14)}</Cell>
                  <Cell width={72}>{formatAmount(row.spent, currency)}</Cell>
                  <Cell width={72}>{row.budget > 0 ? formatAmount(row.budget, currency) : '-'}</Cell>
                  <Cell width={72} success={row.remaining > 0} warning={row.remaining < 0}>
                    {row.budget > 0 ? formatAmount(row.remaining, currency) : '-'}
                  </Cell>
                  <View style={{ width: 80, paddingHorizontal: theme.spacing.xs }}>
                    {row.budget > 0 ? (
                      <>
                        <View style={{ height: 6, backgroundColor: theme.colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                          <View
                            style={{
                              width: `${Math.min(100, pctUsed)}%`,
                              height: '100%',
                              backgroundColor: overBudget ? '#EF4444' : pctUsed >= 80 ? '#F59E0B' : '#22C55E',
                              borderRadius: 3,
                            }}
                          />
                        </View>
                        <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>{pctUsed.toFixed(0)}%</Text>
                      </>
                    ) : (
                      <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>-</Text>
                    )}
                  </View>
                  <Cell width={56} success={row.vsPrevMonthPercent != null && row.vsPrevMonthPercent < 0} warning={row.vsPrevMonthPercent != null && row.vsPrevMonthPercent > 0}>
                    {row.vsPrevMonthPercent != null
                      ? `${row.vsPrevMonthPercent >= 0 ? '↑' : '↓'} ${Math.abs(row.vsPrevMonthPercent).toFixed(0)}%`
                      : t('analytics.noComparison')}
                  </Cell>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </Card>
    </View>
  );
}

function Cell({
  children,
  header,
  width,
  success,
  warning,
}: {
  children: React.ReactNode;
  header?: boolean;
  width: number;
  success?: boolean;
  warning?: boolean;
}) {
  let color = theme.colors.text.primary;
  if (header) color = theme.colors.text.secondary;
  else if (success) color = theme.colors.success;
  else if (warning) color = theme.colors.warning;

  return (
    <View style={{ width, paddingHorizontal: theme.spacing.xs }}>
      <Text
        style={{
          fontSize: header ? 12 : 13,
          fontWeight: header ? '600' : '400',
          color,
        }}
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  );
}
