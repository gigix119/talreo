/**
 * SpendingCategoriesWidget — category explorer with cards (icon, amount, %, mini trend).
 * Replaces donut chart. Tap opens detailed breakdown modal.
 */
import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsColors, analyticsRadius } from '@/constants/analyticsTheme';
import { formatAmount } from '@/utils/currency';
import { AnalyticsCard } from './AnalyticsCard';
import type { CategoryBreakdownItem } from '@/types/database';
import type { CategoryPerformanceRow } from '@/types/analytics';

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍽️',
  jedzenie: '🍽️',
  bills: '📄',
  rachunki: '📄',
  transport: '🚗',
  shopping: '🛒',
  zakupy: '🛒',
  entertainment: '🎬',
  rozrywka: '🎬',
  health: '❤️',
  zdrowie: '❤️',
  default: '📦',
};

function getCategoryIcon(name: string): string {
  const key = name.toLowerCase();
  return CATEGORY_ICONS[key] ?? CATEGORY_ICONS.default;
}

interface SpendingCategoriesWidgetProps {
  expenseData: CategoryBreakdownItem[];
  categoryPerformance: CategoryPerformanceRow[];
  currency: string;
  emptyText: string;
  onCategoryPress?: (item: CategoryBreakdownItem) => void;
}

function CategoryCard({
  item,
  currency,
  vsPrevPercent,
  onPress,
}: {
  item: CategoryBreakdownItem;
  currency: string;
  vsPrevPercent?: number;
  onPress?: () => void;
}) {
  const icon = getCategoryIcon(item.category_name);

  return (
    <AnalyticsCard onPress={onPress} padding="md">
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
            {item.category_name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: analyticsColors.expense }}>
              {formatAmount(item.amount, currency)}
            </Text>
            <Text style={{ fontSize: 13, color: theme.colors.text.tertiary }}>{item.percent.toFixed(0)}%</Text>
            {vsPrevPercent !== undefined && !Number.isNaN(vsPrevPercent) && (
              <>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: vsPrevPercent > 0 ? analyticsColors.expense : analyticsColors.success,
                  }}
                >
                  {vsPrevPercent >= 0 ? '↑' : '↓'} {Math.abs(vsPrevPercent).toFixed(0)}%
                </Text>
                <View
                  style={{
                    width: 24,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: vsPrevPercent > 0 ? analyticsColors.expenseMuted : analyticsColors.incomeMuted,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${Math.min(100, Math.abs(vsPrevPercent))}%`,
                      height: '100%',
                      backgroundColor: vsPrevPercent > 0 ? analyticsColors.expense : analyticsColors.success,
                      borderRadius: 2,
                    }}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </AnalyticsCard>
  );
}

export const SpendingCategoriesWidget = memo(function SpendingCategoriesWidget({
  expenseData,
  categoryPerformance,
  currency,
  emptyText,
  onCategoryPress,
}: SpendingCategoriesWidgetProps) {
  const { t } = useI18n();

  if (expenseData.length === 0) {
    return (
      <AnalyticsCard>
        <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.text.primary, marginBottom: 8 }}>
          {t('analytics.spendingCategories')}
        </Text>
        <Text style={{ fontSize: 15, color: theme.colors.text.tertiary }}>{emptyText}</Text>
      </AnalyticsCard>
    );
  }

  const perfMap = new Map(categoryPerformance.map((p) => [p.categoryName, p.vsPrevMonthPercent]));

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.text.primary }}>
        {t('analytics.spendingCategories')}
      </Text>
      {expenseData.slice(0, 8).map((item) => (
        <CategoryCard
          key={item.category_id ?? item.category_name}
          item={item}
          currency={currency}
          vsPrevPercent={perfMap.get(item.category_name)}
          onPress={onCategoryPress ? () => onCategoryPress(item) : undefined}
        />
      ))}
      <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>
        {t('analytics.tapToSeeDetails')}
      </Text>
    </View>
  );
});
