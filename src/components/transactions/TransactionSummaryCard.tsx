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
        padding: theme.spacing.sm + 4,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text style={{ fontSize: 11, color: theme.colors.text.tertiary, marginBottom: 4 }}>{periodLabel}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: theme.colors.text.secondary }}>{t('transactions.summaryIncome')}</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.income }}>+{formatAmount(income, currency)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: theme.colors.text.secondary }}>{t('transactions.summaryExpenses')}</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.expense }}>−{formatAmount(expense, currency)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: theme.colors.text.secondary }}>{t('transactions.summaryBalance')}</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: balance >= 0 ? theme.colors.income : theme.colors.expense }}>
            {balance >= 0 ? '+' : ''}{formatAmount(balance, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
});
