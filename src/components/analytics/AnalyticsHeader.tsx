/**
 * Analytics Header — premium compact controls.
 * Month selector + range pills (1M / 3M / 6M / 12M / ALL)
 */
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsRadius, analyticsSpacing } from '@/constants/analyticsTheme';
import { formatMonth } from '@/utils/date';

const RANGE_OPTIONS = [1, 3, 6, 12, -1] as const; // -1 = ALL

interface AnalyticsHeaderProps {
  month: string;
  monthCount: number;
  recentMonths: string[];
  onMonthChange: (month: string) => void;
  onRangeChange: (count: number) => void;
}

export function AnalyticsHeader({
  month,
  monthCount,
  recentMonths,
  onMonthChange,
  onRangeChange,
}: AnalyticsHeaderProps) {
  const { t } = useI18n();

  return (
    <View style={{ marginBottom: analyticsSpacing.sectionGap }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: analyticsSpacing.headerMargin }}>
        <View>
          <Text style={{ fontSize: 26, fontWeight: '700', color: theme.colors.text.primary, letterSpacing: -0.6 }}>
            {t('analytics.title')}
          </Text>
          <Text style={{ fontSize: 14, color: theme.colors.text.tertiary, marginTop: 4 }}>
            {formatMonth(month)}
          </Text>
        </View>
      </View>

      {/* Range pills */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {RANGE_OPTIONS.map((n) => {
          const isSelected = n === -1 ? monthCount >= 24 : monthCount === n;
          const label = n === -1 ? t('analytics.rangeAll') : n === 1 ? t('analytics.range1M') : n === 3 ? t('analytics.range3M') : n === 6 ? t('analytics.range6M') : t('analytics.range12M');
          return (
            <Pressable
              key={n}
              onPress={() => onRangeChange(n === -1 ? 24 : n)}
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: analyticsRadius.pill,
                backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                borderWidth: 1,
                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: isSelected ? '#fff' : theme.colors.text.secondary,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Month selector (compact) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {recentMonths.map((m) => {
          const isSelected = month === m;
          return (
            <Pressable
              key={m}
              onPress={() => onMonthChange(m)}
              style={({ pressed }) => ({
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: analyticsRadius.pill,
                backgroundColor: isSelected ? theme.colors.surface : theme.colors.background,
                borderWidth: 1,
                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isSelected ? '600' : '500',
                  color: isSelected ? theme.colors.primary : theme.colors.text.secondary,
                }}
              >
                {formatMonth(m)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
