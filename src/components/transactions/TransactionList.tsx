/**
 * TransactionList — grouped by date (Today, Yesterday, This week, Earlier).
 */
import { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { TransactionRow } from './TransactionRow';
import type { Transaction } from '@/types/database';
import type { Currency } from '@/types/database';

export type DateGroupKey = 'today' | 'yesterday' | 'thisWeek' | 'earlier';

interface TransactionWithCategory extends Transaction {
  categoryName: string;
}

function getDateGroup(dateStr: string): DateGroupKey {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 7);

  const txDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (txDate.getTime() === today.getTime()) return 'today';
  if (txDate.getTime() === yesterday.getTime()) return 'yesterday';
  if (txDate >= weekStart) return 'thisWeek';
  return 'earlier';
}

function groupByDate(txs: TransactionWithCategory[]): Map<DateGroupKey, TransactionWithCategory[]> {
  const map = new Map<DateGroupKey, TransactionWithCategory[]>();
  for (const t of txs) {
    const key = getDateGroup(t.transaction_date);
    const arr = map.get(key) ?? [];
    arr.push(t);
    map.set(key, arr);
  }
  const order: DateGroupKey[] = ['today', 'yesterday', 'thisWeek', 'earlier'];
  const result = new Map<DateGroupKey, TransactionWithCategory[]>();
  for (const k of order) {
    const list = map.get(k);
    if (list?.length) result.set(k, list);
  }
  return result;
}

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  currency: Currency;
  onTransactionPress: (tx: Transaction) => void;
}

const GROUP_LABELS: Record<DateGroupKey, string> = {
  today: 'transactions.groupToday',
  yesterday: 'transactions.groupYesterday',
  thisWeek: 'transactions.groupThisWeek',
  earlier: 'transactions.groupEarlier',
};

export const TransactionList = memo(function TransactionList({
  transactions,
  currency,
  onTransactionPress,
}: TransactionListProps) {
  const { t } = useI18n();
  const groups = useMemo(() => groupByDate(transactions), [transactions]);

  return (
    <View style={{ gap: theme.spacing.lg }}>
      {Array.from(groups.entries()).map(([key, list]) => (
        <View key={key}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: theme.colors.text.tertiary,
              marginBottom: theme.spacing.sm,
              marginHorizontal: theme.spacing.lg,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {t(GROUP_LABELS[key])}
          </Text>
          {list.map((item) => (
            <TransactionRow
              key={item.id}
              transaction={item}
              categoryName={item.categoryName}
              currency={currency}
              onPress={() => onTransactionPress(item)}
            />
          ))}
        </View>
      ))}
    </View>
  );
});
