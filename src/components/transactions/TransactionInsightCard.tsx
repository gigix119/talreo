/**
 * TransactionInsightCard — category spending/income this month with optional % for expenses.
 */
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { formatAmount } from '@/utils/currency';
import type { Currency } from '@/types/database';

interface TransactionInsightCardProps {
  categoryName: string;
  amount: number;
  currency: Currency;
  isExpense: boolean;
  totalExpensesThisMonth?: number;
}

export function TransactionInsightCard({
  categoryName,
  amount,
  currency,
  isExpense,
  totalExpensesThisMonth = 0,
}: TransactionInsightCardProps) {
  const { t } = useI18n();
  const percent =
    isExpense && totalExpensesThisMonth > 0 && amount > 0
      ? Math.round((amount / totalExpensesThisMonth) * 100)
      : null;

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
      {percent != null && percent > 0 ? (
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.text.tertiary,
            marginTop: 4,
          }}
        >
          {t('transactions.insightPercentOfExpenses').replace('{{percent}}', String(percent))}
        </Text>
      ) : null}
    </View>
  );
}
