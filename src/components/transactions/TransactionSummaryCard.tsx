/**
 * TransactionSummaryCard — Income, Expenses, Balance for selected period.
 */
import { memo } from 'react';
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { formatAmount } from '@/utils/currency';
import type { Currency } from '@/types/database';

interface TransactionSummaryCardProps {
  income: number;
  expense: number;
  currency: Currency;
  periodLabel: string;
}

export const TransactionSummaryCard = memo(function TransactionSummaryCard({
  income,
  expense,
  currency,
  periodLabel,
}: TransactionSummaryCardProps) {
  const { t } = useI18n();
  const balance = income - expense;

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: theme.colors.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: theme.spacing.md,
        }}
      >
        {periodLabel}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg }}>
        <View style={{ flex: 1, minWidth: 90 }}>
          <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginBottom: 4 }}>
            {t('transactions.summaryIncome')}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.income }}>
            +{formatAmount(income, currency)}
          </Text>
        </View>
        <View style={{ flex: 1, minWidth: 90 }}>
          <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginBottom: 4 }}>
            {t('transactions.summaryExpenses')}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.expense }}>
            −{formatAmount(expense, currency)}
          </Text>
        </View>
        <View style={{ flex: 1, minWidth: 90 }}>
          <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginBottom: 4 }}>
            {t('transactions.summaryBalance')}
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: balance >= 0 ? theme.colors.income : theme.colors.expense,
            }}
          >
            {balance >= 0 ? '+' : ''}{formatAmount(balance, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
});
