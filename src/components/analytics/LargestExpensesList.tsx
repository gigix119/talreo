/**
 * Top 5 largest expenses this month.
 */
import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { formatAmount } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import type { LargestExpense } from '@/types/analytics';
import type { Currency } from '@/types/database';

interface LargestExpensesListProps {
  items: LargestExpense[];
  currency: Currency;
  emptyText: string;
}

export function LargestExpensesList({ items, currency, emptyText }: LargestExpensesListProps) {
  const { t } = useI18n();
  if (items.length === 0) {
    return (
      <Card padding="lg" elevated style={{ marginTop: theme.spacing.md }}>
        <Text style={{ fontSize: 15, color: theme.colors.text.secondary }}>{t('analytics.largestExpenses')}</Text>
        <Text style={{ fontSize: 13, color: theme.colors.text.tertiary, marginTop: 8 }}>{emptyText}</Text>
      </Card>
    );
  }

  return (
    <View style={{ marginTop: theme.spacing.md }}>
      <Text style={{ fontSize: 17, fontWeight: '600', color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>
        {t('analytics.largestExpenses')}
      </Text>
      <Card padding="md" elevated>
        {items.map((item, i) => (
          <View
            key={item.id}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: theme.spacing.sm,
              borderBottomWidth: i < items.length - 1 ? 1 : 0,
              borderBottomColor: theme.colors.border,
            }}
          >
            <View>
              <Text style={{ fontSize: 14, color: theme.colors.text.primary }} numberOfLines={1}>
                {item.note || 'No note'}
              </Text>
              <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>
                {item.categoryName} · {formatDate(item.transactionDate)}
              </Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: theme.colors.expense }}>
              -{formatAmount(item.amount, currency)}
            </Text>
          </View>
        ))}
      </Card>
    </View>
  );
}
