/**
 * TransactionsFilters — type chips + date range. Horizontally scrollable.
 */
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';

export type TypeFilter = 'all' | 'expense' | 'income';
export type DateFilter = '7d' | '30d' | 'month' | 'all';

interface TransactionsFiltersProps {
  typeFilter: TypeFilter;
  dateFilter: DateFilter;
  categoryId: string | null;
  categories: { id: string; name: string; type: string }[];
  onTypeChange: (t: TypeFilter) => void;
  onDateChange: (d: DateFilter) => void;
  onCategoryChange: (id: string | null) => void;
}

export function TransactionsFilters({
  typeFilter,
  dateFilter,
  categoryId,
  categories,
  onTypeChange,
  onDateChange,
  onCategoryChange,
}: TransactionsFiltersProps) {
  const { t } = useI18n();

  const typeChips: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: t('transactions.filterTypeAll') },
    { value: 'expense', label: t('transactions.filterTypeExpense') },
    { value: 'income', label: t('transactions.filterTypeIncome') },
  ];

  const dateChips: { value: DateFilter; label: string }[] = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: 'month', label: t('transactions.filterMonth') },
    { value: 'all', label: t('transactions.filterAll') },
  ];

  const Chip = ({
    selected,
    onPress,
    label,
  }: {
    selected: boolean;
    onPress: () => void;
    label: string;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm + 2,
        borderRadius: theme.radius.full,
        backgroundColor: selected ? theme.colors.primary : theme.colors.background,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: selected ? '#FFFFFF' : theme.colors.text.secondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.spacing.sm, paddingRight: theme.spacing.lg, marginBottom: theme.spacing.sm }}
      >
        {typeChips.map((c) => (
          <Chip
            key={c.value}
            selected={typeFilter === c.value}
            onPress={() => onTypeChange(c.value)}
            label={c.label}
          />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.spacing.sm, paddingRight: theme.spacing.lg }}
      >
        {dateChips.map((c) => (
          <Chip
            key={c.value}
            selected={dateFilter === c.value}
            onPress={() => onDateChange(c.value)}
            label={c.label}
          />
        ))}
      </ScrollView>
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: theme.spacing.sm, paddingRight: theme.spacing.lg, marginTop: theme.spacing.sm }}
        >
          <Chip
            selected={categoryId === null}
            onPress={() => onCategoryChange(null)}
            label={t('transactions.filterTypeAll')}
          />
          {categories.slice(0, 8).map((c) => (
            <Chip
              key={c.id}
              selected={categoryId === c.id}
              onPress={() => onCategoryChange(c.id)}
              label={c.name}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
