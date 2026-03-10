/**
 * TransactionInsightCard — category spending/income with smart contextual insight.
 */
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { formatAmount } from '@/utils/currency';
import { getTransactionInsight } from '@/utils/transactionInsights';
import type { Currency } from '@/types/database';

interface TransactionInsightCardProps {
  categoryName: string;
  amount: number;
  currency: Currency;
  isExpense: boolean;
  totalExpensesThisMonth?: number;
  totalExpensesThisWeek?: number;
  totalExpensesLastMonth?: number;
}

export function TransactionInsightCard({
  categoryName,
  amount,
  currency,
  isExpense,
  totalExpensesThisMonth = 0,
  totalExpensesThisWeek = 0,
  totalExpensesLastMonth = 0,
}: TransactionInsightCardProps) {
  const { t } = useI18n();
  const insight = getTransactionInsight({
    categoryName,
    amount,
    currency,
    isExpense,
    totalExpensesThisMonth,
    totalExpensesThisWeek,
    totalExpensesLastMonth,
  });

  return (
    <View
      style={{
        backgroundColor: theme.colors.primary + '12',
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.text.secondary,
          marginBottom: 4,
        }}
      >
        {categoryName} {isExpense ? t('transactions.insightCategorySpending') : t('transactions.insightCategoryIncome')}
      </Text>
      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: theme.colors.text.primary,
        }}
      >
        {formatAmount(amount, currency)}
      </Text>
      {insight.secondaryText ? (
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.text.tertiary,
            marginTop: 4,
          }}
        >
          {insight.secondaryText}
        </Text>
      ) : null}
    </View>
  );
}
