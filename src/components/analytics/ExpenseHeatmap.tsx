/**
 * Category × Month heatmap — intensity = spending.
 */
import { View, Text } from 'react-native';
import { theme } from '@/constants/theme';
import { analyticsRadius, analyticsShadows } from '@/constants/analyticsTheme';
import { useI18n } from '@/i18n';
import { formatAmount } from '@/utils/currency';
import type { HeatmapData } from '@/types/analytics';

interface ExpenseHeatmapProps {
  data: HeatmapData | null;
  emptyText: string;
}

function interpolateColor(normalized: number): string {
  if (normalized <= 0) return '#F2F2F7';
  const r = Math.round(10 + (245 - 10) * normalized);
  const g = Math.round(59 + (59 - 59) * normalized);
  const b = Math.round(255 - (255 - 48) * normalized);
  return `rgb(${r}, ${g}, ${Math.max(48, 255 - normalized * 200)})`;
}

export function ExpenseHeatmap({ data, emptyText }: ExpenseHeatmapProps) {
  const { t } = useI18n();
  if (!data || data.cells.length === 0) {
    return (
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: analyticsRadius.card,
          padding: theme.spacing.lg,
          ...analyticsShadows.card,
        }}
      >
        <Text style={{ fontSize: 15, color: theme.colors.text.secondary }}>{t('analytics.heatmap')}</Text>
        <Text style={{ fontSize: 13, color: theme.colors.text.tertiary, marginTop: 8 }}>{emptyText}</Text>
      </View>
    );
  }

  const cellSize = 36;
  const headerWidth = 90;

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: analyticsRadius.card,
        padding: theme.spacing.lg,
        ...analyticsShadows.card,
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary, marginBottom: theme.spacing.md }}>
        {t('analytics.heatmap')}
      </Text>
      <View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: headerWidth }} />
          {data.months.map((m) => (
            <View key={m} style={{ width: cellSize, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: theme.colors.text.tertiary }}>
                {new Date(m + 'T00:00:00').toLocaleDateString('pl-PL', { month: 'short' })}
              </Text>
            </View>
          ))}
        </View>
        {data.categories.slice(0, 8).map((cat) => (
          <View key={String(cat.id ?? cat.name)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text
              style={{ width: headerWidth, fontSize: 11, color: theme.colors.text.secondary }}
              numberOfLines={1}
            >
              {cat.name.slice(0, 10)}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              {data.months.map((month) => {
                const catKey = cat.id ?? `__${cat.name}`;
                const cell = data.cells.find(
                  (c) => c.month === month && ((c.categoryId ?? `__${c.categoryName}`) === catKey)
                );
                const amt = cell?.amount ?? 0;
                const norm = cell?.normalized ?? 0;
                return (
                  <View
                    key={`${cat.id}-${month}`}
                    style={{
                      width: cellSize - 2,
                      height: cellSize - 2,
                      backgroundColor: interpolateColor(norm),
                      borderRadius: 4,
                      margin: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {amt > 0 && (
                      <Text style={{ fontSize: 9, color: norm > 0.5 ? '#fff' : theme.colors.text.secondary }}>
                        {amt >= 1000 ? `${(amt / 1000).toFixed(1)}k` : amt}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
