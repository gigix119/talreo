/**
 * Range comparison — Range A vs Range B with % change (Binance-style).
 */
import { View, Text } from 'react-native';
import { theme } from '@/constants/theme';
import { analyticsRadius, analyticsShadows } from '@/constants/analyticsTheme';
import { useI18n } from '@/i18n';
import { formatAmount } from '@/utils/currency';
import { formatMonth } from '@/utils/date';
import type { RangeComparisonResult } from '@/types/analytics';
import type { Currency } from '@/types/database';

interface RangeComparisonCardProps {
  data: RangeComparisonResult | null;
  currency: Currency;
  rangeALabel: string;
  rangeBLabel: string;
}

function ChangeBadge({ value }: { value: number | null }) {
  if (value == null) {
    return <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>—</Text>;
  }
  const isPos = value >= 0;
  return (
    <Text
      style={{
        fontSize: 14,
        fontWeight: '600',
        color: isPos ? theme.colors.expense : theme.colors.success,
      }}
    >
      {value >= 0 ? '+' : ''}{value.toFixed(1)}%
    </Text>
  );
}

export function RangeComparisonCard({
  data,
  currency,
  rangeALabel,
  rangeBLabel,
}: RangeComparisonCardProps) {
  const { t } = useI18n();
  if (!data || !data.rangeA || !data.rangeB) return null;

  const rangeA = data.rangeA;
  const rangeB = data.rangeB;
  const change = data.change ?? {};
  const hasAnyChange = change.expense != null || change.income != null || change.balance != null;

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: analyticsRadius.card,
        padding: theme.spacing.md,
        ...analyticsShadows.card,
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>
        {t('analytics.rangeComparison')}
      </Text>
      <Text style={{ fontSize: 11, color: theme.colors.text.tertiary, marginBottom: theme.spacing.sm }}>
        {rangeALabel} → {rangeBLabel}
      </Text>

      <Row label={t('analytics.totalExpenses')} a={rangeA.totalExpense} b={rangeB.totalExpense} change={change.expense ?? null} currency={currency} />
      <Row label={t('analytics.totalIncome')} a={rangeA.totalIncome} b={rangeB.totalIncome} change={change.income ?? null} currency={currency} />
      <Row label={t('analytics.balance')} a={rangeA.balance} b={rangeB.balance} change={change.balance ?? null} currency={currency} />

      {!hasAnyChange && (
        <Text style={{ fontSize: 11, color: theme.colors.text.tertiary, marginTop: theme.spacing.xs }}>
          {t('analytics.noComparisonData')}
        </Text>
      )}
    </View>
  );
}

function Row({
  label,
  a,
  b,
  change,
  currency,
}: {
  label: string;
  a: number;
  b: number;
  change: number | null;
  currency: Currency;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.xs + 2,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Text style={{ fontSize: 13, color: theme.colors.text.secondary }} numberOfLines={1}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flexShrink: 0 }}>
        <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }} numberOfLines={1}>
          {formatAmount(a, currency)}
        </Text>
        <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.text.primary }} numberOfLines={1}>
          {formatAmount(b, currency)}
        </Text>
        <ChangeBadge value={change} />
      </View>
    </View>
  );
}
