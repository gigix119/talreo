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
        borderRadius: theme.radius.md,
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text style={{ fontSize: 10, color: theme.colors.text.tertiary, marginBottom: 6, fontWeight: '500' }}>{periodLabel}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 10, color: theme.colors.text.tertiary }}>{t('transactions.summaryIncome')}</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.income, letterSpacing: -0.3 }} numberOfLines={1}>+{formatAmount(income, currency)}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 10, color: theme.colors.text.tertiary }}>{t('transactions.summaryExpenses')}</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.expense, letterSpacing: -0.3 }} numberOfLines={1}>−{formatAmount(expense, currency)}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 10, color: theme.colors.text.tertiary }}>{t('transactions.summaryBalance')}</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: balance >= 0 ? theme.colors.income : theme.colors.expense, letterSpacing: -0.3 }} numberOfLines={1}>
            {balance >= 0 ? '+' : ''}{formatAmount(balance, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
});
