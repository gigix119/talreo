/**
 * TransactionRow — title-focused layout with circular category icon.
 * Line 1: Transaction title (bold)
 * Line 2: Category • Date
 * Right: Amount
 */
import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { theme } from '@/constants/theme';
import { TransactionIcon } from './TransactionIcon';
import { TransactionMeta } from './TransactionMeta';
import { TransactionAmount } from './TransactionAmount';
import { getTransactionTitle } from '@/utils/transactionDisplay';
import type { Transaction } from '@/types/database';
import type { Currency } from '@/types/database';

interface TransactionRowProps {
  transaction: Transaction;
  categoryName: string;
  currency: Currency;
  onPress: () => void;
}

export const TransactionRow = memo(function TransactionRow({
  transaction,
  categoryName,
  currency,
  onPress,
}: TransactionRowProps) {
  const amount = Number(transaction.amount);
  const isIncome = transaction.type === 'income';
  const title = getTransactionTitle(transaction.note, categoryName);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: pressed ? theme.colors.background : theme.colors.surface,
        marginHorizontal: theme.spacing.lg,
        marginBottom: 8,
        borderRadius: theme.radius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
      })}
    >
      <TransactionIcon
        categoryName={categoryName}
        type={transaction.type}
        size={40}
      />
      <View style={{ flex: 1, minWidth: 0, marginLeft: theme.spacing.md }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '600',
            color: theme.colors.text.primary,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <TransactionMeta
          categoryName={categoryName}
          date={transaction.transaction_date}
        />
      </View>
      <View style={{ marginLeft: theme.spacing.md }}>
        <TransactionAmount
          amount={amount}
          isIncome={isIncome}
          currency={currency}
        />
      </View>
    </Pressable>
  );
});
