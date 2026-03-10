/**
 * TransactionRow — premium list row with icon, title, category, date, amount.
 */
import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { theme } from '@/constants/theme';
import { formatAmount } from '@/utils/currency';
import { formatDateShort } from '@/utils/date';
import type { Transaction } from '@/types/database';
import type { Currency } from '@/types/database';

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍽️',
  jedzenie: '🍽️',
  bills: '📄',
  transport: '🚗',
  shopping: '🛒',
  zakupy: '🛒',
  salary: '💰',
  freelance: '💼',
  default: '📦',
};

function getIcon(categoryName: string | null, type: string): string {
  if (!categoryName) return type === 'income' ? '💰' : '📤';
  const k = categoryName.toLowerCase();
  return CATEGORY_ICONS[k] ?? CATEGORY_ICONS.default;
}

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
  const icon = getIcon(categoryName, transaction.type);
  const amount = Number(transaction.amount);
  const isIncome = transaction.type === 'income';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.spacing.lg,
        marginBottom: 6,
        borderRadius: theme.radius.lg,
        opacity: pressed ? 0.95 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
      })}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: theme.colors.background,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        }}
      >
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text.primary }} numberOfLines={1}>
          {transaction.note || categoryName || '—'}
        </Text>
        <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginTop: 2 }}>
          {categoryName} · {formatDateShort(transaction.transaction_date)}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: isIncome ? theme.colors.income : theme.colors.expense,
        }}
      >
        {isIncome ? '+' : '−'}{formatAmount(amount, currency)}
      </Text>
    </Pressable>
  );
});
