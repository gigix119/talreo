/**
 * Spending velocity — daily average, forecast.
 */
import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { formatAmount } from '@/utils/currency';
import type { SpendingVelocity } from '@/types/analytics';
import type { Currency } from '@/types/database';

interface SpendingVelocityCardProps {
  velocity: SpendingVelocity | null;
  currency: Currency;
}

export function SpendingVelocityCard({ velocity, currency }: SpendingVelocityCardProps) {
  const { t } = useI18n();
  if (!velocity) return null;

  return (
    <Card padding="lg" elevated style={{ marginTop: theme.spacing.md }}>
      <Text style={{ fontSize: 17, fontWeight: '600', color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>
        {t('analytics.spendingVelocity')}
      </Text>
      <View style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, color: theme.colors.text.secondary }}>Daily average</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
            {formatAmount(velocity.dailyAverage, currency)}/day
          </Text>
        </View>
        <View
          style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background,
            borderRadius: theme.radius.md,
          }}
        >
          <Text style={{ fontSize: 13, color: theme.colors.text.secondary }}>
            If you continue spending at this pace, you will spend{' '}
            <Text style={{ fontWeight: '700', color: theme.colors.text.primary }}>
              {formatAmount(velocity.forecastThisMonth, currency)}
            </Text>
            {' '}this month.
          </Text>
          <View style={{ marginTop: theme.spacing.sm, height: 6, backgroundColor: theme.colors.border, borderRadius: 3, overflow: 'hidden' }}>
            <View
              style={{
                width: `${Math.min(100, velocity.forecastThisMonth > 0 ? (velocity.spentSoFar / velocity.forecastThisMonth) * 100 : 0)}%`,
                height: '100%',
                backgroundColor: velocity.forecastThisMonth > 0 ? '#EF4444' : theme.colors.border,
                borderRadius: 3,
              }}
            />
          </View>
        </View>
        <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>
          {velocity.daysElapsed} days elapsed · {formatAmount(velocity.spentSoFar, currency)} spent so far
        </Text>
      </View>
    </Card>
  );
}
