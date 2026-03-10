/**
 * TransactionDetailHeader — large amount, title, category/type label.
 */
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { formatAmount } from '@/utils/currency';
import { getTransactionTitle } from '@/utils/transactionDisplay';
import type { Transaction } from '@/types/database';
import type { Currency } from '@/types/database';

interface TransactionDetailHeaderProps {
  transaction: Transaction;
  categoryName: string;
  currency: Currency;
}

export function TransactionDetailHeader({
  transaction,
  categoryName,
  currency,
}: TransactionDetailHeaderProps) {
  const { t } = useI18n();
  const amount = Number(transaction.amount);
  const isIncome = transaction.type === 'income';
  const title = getTransactionTitle(transaction.note, categoryName);
  const typeLabel = isIncome ? t('transactions.filterTypeIncome') : t('transactions.filterTypeExpense');

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.xl,
        marginBottom: theme.spacing.lg,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 40,
          fontWeight: '700',
          color: isIncome ? theme.colors.income : theme.colors.expense,
          letterSpacing: -0.5,
        }}
      >
        {isIncome ? '+' : '−'}{formatAmount(amount, currency)}
      </Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.text.primary,
          marginTop: theme.spacing.sm,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <View
        style={{
          marginTop: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: 4,
          backgroundColor: theme.colors.background,
          borderRadius: theme.radius.sm,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text.secondary }}>
          {categoryName} · {typeLabel}
        </Text>
      </View>
    </View>
  );
}
