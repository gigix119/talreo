/**
 * TransactionAmount — color-coded amount.
 */
import { memo } from 'react';
import { Text } from 'react-native';
import { theme } from '@/constants/theme';
import { formatAmount } from '@/utils/currency';
import type { Currency } from '@/types/database';

interface TransactionAmountProps {
  amount: number;
  isIncome: boolean;
  currency: Currency;
}

export const TransactionAmount = memo(function TransactionAmount({
  amount,
  isIncome,
  currency,
}: TransactionAmountProps) {
  return (
    <Text
      style={{
        fontSize: 15,
        fontWeight: '700',
        color: isIncome ? theme.colors.income : theme.colors.expense,
      }}
    >
      {isIncome ? '+' : '−'}{formatAmount(amount, currency)}
    </Text>
  );
});
