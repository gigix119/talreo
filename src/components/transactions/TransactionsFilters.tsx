/**
 * TransactionsFilters — segmented control, date row, category chips.
 * Three distinct groups for clarity.
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

  const typeOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: t('transactions.filterTypeAll') },
    { value: 'expense', label: t('transactions.filterTypeExpense') },
    { value: 'income', label: t('transactions.filterTypeIncome') },
  ];

  const dateOptions: { value: DateFilter; label: string }[] = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: 'month', label: t('transactions.filterMonth') },
  ];

  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      {/* Segmented control: All | Expenses | Income */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: theme.colors.background,
          borderRadius: theme.radius.md,
          padding: 4,
          marginBottom: theme.spacing.md,
        }}
      >
        {typeOptions.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => onTypeChange(opt.value)}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: theme.spacing.sm + 2,
              borderRadius: theme.radius.sm,
              backgroundColor: typeFilter === opt.value ? theme.colors.surface : 'transparent',
              alignItems: 'center',
              opacity: pressed ? 0.9 : 1,
              shadowColor: typeFilter === opt.value ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 2,
              elevation: typeFilter === opt.value ? 2 : 0,
            })}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: typeFilter === opt.value ? theme.colors.text.primary : theme.colors.text.secondary,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Date filter row */}
      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.md,
        }}
      >
        {dateOptions.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => onDateChange(opt.value)}
            style={({ pressed }) => ({
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm + 2,
              borderRadius: theme.radius.full,
              backgroundColor: dateFilter === opt.value ? theme.colors.primary : theme.colors.background,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: dateFilter === opt.value ? '#FFFFFF' : theme.colors.text.secondary,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => onDateChange('all')}
          style={({ pressed }) => ({
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm + 2,
            borderRadius: theme.radius.full,
            backgroundColor: dateFilter === 'all' ? theme.colors.primary : theme.colors.background,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: dateFilter === 'all' ? '#FFFFFF' : theme.colors.text.secondary,
            }}
          >
            {t('transactions.filterAll')}
          </Text>
        </Pressable>
      </View>

      {/* Category chips — horizontally scrollable */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: theme.spacing.sm,
            paddingRight: theme.spacing.lg,
          }}
        >
          <Pressable
            onPress={() => onCategoryChange(null)}
            style={({ pressed }) => ({
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm + 2,
              borderRadius: theme.radius.full,
              backgroundColor: categoryId === null ? theme.colors.primary : theme.colors.background,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: categoryId === null ? '#FFFFFF' : theme.colors.text.secondary,
              }}
            >
              {t('transactions.filterTypeAll')}
            </Text>
          </Pressable>
          {categories.slice(0, 10).map((c) => (
            <Pressable
              key={c.id}
              onPress={() => onCategoryChange(c.id)}
              style={({ pressed }) => ({
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm + 2,
                borderRadius: theme.radius.full,
                backgroundColor: categoryId === c.id ? theme.colors.primary : theme.colors.background,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: categoryId === c.id ? '#FFFFFF' : theme.colors.text.secondary,
                }}
              >
                {c.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
