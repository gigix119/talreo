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
  if (!data) return null;

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: analyticsRadius.card,
        padding: theme.spacing.lg,
        ...analyticsShadows.card,
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: '600', color: theme.colors.text.primary, marginBottom: theme.spacing.md }}>
        {t('analytics.rangeComparison')}
      </Text>

      <Row label={t('analytics.totalExpenses')} a={data.rangeA.totalExpense} b={data.rangeB.totalExpense} change={data.change.expense} currency={currency} />
      <Row label={t('analytics.totalIncome')} a={data.rangeA.totalIncome} b={data.rangeB.totalIncome} change={data.change.income} currency={currency} />
      <Row label={t('analytics.balance')} a={data.rangeA.balance} b={data.rangeB.balance} change={data.change.balance} currency={currency} />

      <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: theme.spacing.sm }}>
        {rangeALabel} vs {rangeBLabel}
      </Text>
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
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Text style={{ fontSize: 14, color: theme.colors.text.secondary }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
        <Text style={{ fontSize: 13, color: theme.colors.text.secondary }}>{formatAmount(a, currency)}</Text>
        <Text style={{ fontSize: 13, color: theme.colors.text.primary }}>{formatAmount(b, currency)}</Text>
        <ChangeBadge value={change} />
      </View>
    </View>
  );
}
