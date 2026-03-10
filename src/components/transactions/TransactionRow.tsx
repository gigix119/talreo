/**
 * TransactionRow — title-focused layout. Supports long-press for multi-select.
 */
import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
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
  isRecurring?: boolean;
  isSubscription?: boolean;
}

export const TransactionRow = memo(function TransactionRow({
  transaction,
  categoryName,
  currency,
  onPress,
  onLongPress,
  isRecurring = false,
  isSubscription = false,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
}: TransactionRowProps) {
  const { t } = useI18n();
  const amount = Number(transaction.amount);
  const isIncome = transaction.type === 'income';
  const title = getTransactionTitle(transaction.note, categoryName);

  const handlePress = () => {
    if (isSelectionMode && onToggleSelect) onToggleSelect();
    else onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.spacing.lg,
        marginBottom: 8,
        borderRadius: theme.radius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        borderWidth: isSelected ? 2 : 0,
        borderColor: isSelected ? theme.colors.primary : 'transparent',
      })}
    >
      {isSelectionMode ? (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            backgroundColor: isSelected ? theme.colors.primary : 'transparent',
            marginRight: theme.spacing.md,
          }}
        />
      ) : null}
      <TransactionIcon
        categoryName={categoryName}
        type={transaction.type}
        size={40}
      />
      <View style={{ flex: 1, minWidth: 0, marginLeft: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
          {isRecurring ? (
            <View style={{ backgroundColor: '#E8F4FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: theme.colors.primary }}>{t('transactions.labelRecurring')}</Text>
            </View>
          ) : null}
          {isSubscription ? (
            <View style={{ backgroundColor: '#F2F2F7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: theme.colors.text.secondary }}>{t('transactions.labelSubscription')}</Text>
            </View>
          ) : null}
        </View>
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
