/**
 * TransactionList — grouped by date, virtualized SectionList for performance.
 */
import { memo, useMemo, useCallback } from 'react';
import { SectionList, View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { TransactionRow } from './TransactionRow';
import { normalizeNote } from '@/utils/recurringDetector';
import { isSubscription } from '@/utils/categorySuggestion';
import { theme } from '@/constants/theme';
import { BOTTOM_CONTENT_PADDING } from '@/constants/layout';
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

export interface TransactionListSection {
  key: DateGroupKey;
  title: string;
  data: TransactionWithCategory[];
}

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  currency: Currency;
  onTransactionPress: (tx: Transaction) => void;
  recurringNoteSet?: Set<string>;
  isSelectionMode?: boolean;
  selectedIds?: Set<string> | string[];
  onToggleSelect?: (id: string) => void;
  onLongPress?: (tx: Transaction) => void;
  /** Rendered at top of list (e.g. summary card). */
  ListHeaderComponent?: React.ReactElement | null;
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
  recurringNoteSet = new Set(),
  isSelectionMode = false,
  selectedIds = [],
  onToggleSelect,
  onLongPress,
  ListHeaderComponent,
}: TransactionListProps) {
  const { t } = useI18n();
  const selectedSet = selectedIds instanceof Set ? selectedIds : new Set(selectedIds as string[]);
  const groups = useMemo(() => groupByDate(transactions), [transactions]);
  const sections = useMemo<TransactionListSection[]>(
    () =>
      Array.from(groups.entries()).map(([key, list]) => ({
        key,
        title: t(GROUP_LABELS[key]),
        data: list,
      })),
    [groups, t]
  );

  const renderItem = useCallback(
    ({ item }: { item: TransactionWithCategory }) => (
      <TransactionRow
        transaction={item}
        categoryName={item.categoryName}
        currency={currency}
        onPress={() => onTransactionPress(item)}
        onLongPress={onLongPress ? () => onLongPress(item) : undefined}
        isRecurring={recurringNoteSet.has(normalizeNote(item.note))}
        isSubscription={isSubscription(item.note ?? '')}
        isSelectionMode={isSelectionMode}
        isSelected={selectedSet.has(item.id)}
        onToggleSelect={onToggleSelect ? () => onToggleSelect(item.id) : undefined}
      />
    ),
    [
      currency,
      onTransactionPress,
      onLongPress,
      recurringNoteSet,
      isSelectionMode,
      selectedSet,
      onToggleSelect,
    ]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: TransactionListSection }) => (
      <View style={{ marginTop: section.key === 'today' ? 0 : theme.spacing.md, marginBottom: theme.spacing.xs }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: '600',
            color: theme.colors.text.tertiary,
            marginHorizontal: 0,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {section.title}
        </Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: TransactionWithCategory) => item.id, []);

  return (
    <SectionList
      sections={sections}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      ListHeaderComponent={ListHeaderComponent}
      stickySectionHeadersEnabled={true}
      style={{ flex: 1, minHeight: 0 }}
      contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: BOTTOM_CONTENT_PADDING }}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      initialNumToRender={12}
      maxToRenderPerBatch={10}
      windowSize={6}
    />
  );
});
