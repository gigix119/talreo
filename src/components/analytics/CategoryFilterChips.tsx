/**
 * Category filter chips — select one or more categories, income/expense.
 */
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsRadius } from '@/constants/analyticsTheme';
import type { CategoryBreakdownItem } from '@/types/database';
import type { AnalyticsFilters } from '@/hooks/useAnalyticsDashboard';

interface CategoryFilterChipsProps {
  expenseCategories: CategoryBreakdownItem[];
  incomeCategories: CategoryBreakdownItem[];
  filters: AnalyticsFilters;
  onFiltersChange: (f: AnalyticsFilters) => void;
}

export function CategoryFilterChips({
  expenseCategories,
  incomeCategories,
  filters,
  onFiltersChange,
}: CategoryFilterChipsProps) {
  const { t } = useI18n();
  const toggleType = (type: 'all' | 'expense' | 'income') =>
    onFiltersChange({ ...filters, type });

  const toggleCategory = (categoryId: string) => {
    const ids = filters.categoryIds.includes(categoryId)
      ? filters.categoryIds.filter((id) => id !== categoryId)
      : [...filters.categoryIds, categoryId];
    onFiltersChange({ ...filters, categoryIds: ids });
  };

  const categories = filters.type === 'income' ? incomeCategories : expenseCategories;

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginBottom: 8 }}>
        {t('analytics.filter')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Pressable
          onPress={() => toggleType('all')}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: analyticsRadius.pill,
            backgroundColor: filters.type === 'all' ? theme.colors.primary : theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: filters.type === 'all' ? '#fff' : theme.colors.text.primary }}>
            All
          </Text>
        </Pressable>
        <Pressable
          onPress={() => toggleType('expense')}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: analyticsRadius.pill,
            backgroundColor: filters.type === 'expense' ? theme.colors.expense : theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: filters.type === 'expense' ? '#fff' : theme.colors.text.primary }}>
            Expense
          </Text>
        </Pressable>
        <Pressable
          onPress={() => toggleType('income')}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: analyticsRadius.pill,
            backgroundColor: filters.type === 'income' ? theme.colors.income : theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: filters.type === 'income' ? '#fff' : theme.colors.text.primary }}>
            Income
          </Text>
        </Pressable>
        {categories.map((c) => {
          if (!c.category_id) return null;
          const selected = filters.categoryIds.includes(c.category_id);
          return (
            <Pressable
              key={c.category_id}
              onPress={() => toggleCategory(c.category_id!)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: analyticsRadius.pill,
                backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '500', color: selected ? '#fff' : theme.colors.text.primary }} numberOfLines={1}>
                {c.category_name.slice(0, 12)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
