/**
 * Predictions / Pace section — daily average, forecast, budget runway.
 * Compact and premium.
 */
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsColors, analyticsShadows, analyticsRadius } from '@/constants/analyticsTheme';
import { formatAmount } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import type { SpendingVelocity, LargestExpense } from '@/types/analytics';
import type { Currency } from '@/types/database';

interface PredictionsSectionProps {
  velocity: SpendingVelocity | null;
  largestExpenses: LargestExpense[];
  currency: Currency;
  emptyText: string;
}

export function PredictionsSection({
  velocity,
  largestExpenses,
  currency,
  emptyText,
}: PredictionsSectionProps) {
  const { t } = useI18n();

  const hasVelocity = velocity && (velocity.spentSoFar > 0 || velocity.forecastThisMonth > 0);
  const hasExpenses = largestExpenses.length > 0;

  if (!hasVelocity && !hasExpenses) {
    return (
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: analyticsRadius.card,
          padding: theme.spacing.lg,
          ...analyticsShadows.card,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.secondary, marginBottom: 8 }}>
          {t('analytics.sectionPredictions')}
        </Text>
        <Text style={{ fontSize: 14, color: theme.colors.text.tertiary }}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {/* Pace / Forecast */}
      {hasVelocity && (
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: analyticsRadius.card,
            padding: theme.spacing.lg,
            ...analyticsShadows.card,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 12 }}>
            {t('analytics.spendingVelocity')}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <View>
              <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>Daily average</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text.primary }}>
                {formatAmount(velocity!.dailyAverage, currency)}/day
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>Predicted month-end</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: analyticsColors.expense }}>
                {formatAmount(velocity!.forecastThisMonth, currency)}
              </Text>
            </View>
          </View>
          <View
            style={{
              height: 6,
              backgroundColor: theme.colors.background,
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${velocity!.daysInMonth > 0 ? Math.min(100, (velocity!.daysElapsed / velocity!.daysInMonth) * 100) : 0}%`,
                height: '100%',
                backgroundColor: analyticsColors.balance,
                borderRadius: 3,
              }}
            />
          </View>
          <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: 8 }}>
            {velocity!.daysElapsed} days elapsed · {formatAmount(velocity!.spentSoFar, currency)} spent
          </Text>
        </View>
      )}

      {/* Top expenses */}
      {hasExpenses && (
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: analyticsRadius.card,
            padding: theme.spacing.lg,
            ...analyticsShadows.card,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 12 }}>
            {t('analytics.largestExpenses')}
          </Text>
          {largestExpenses.slice(0, 5).map((item, idx) => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 8,
                borderBottomWidth: idx < Math.min(5, largestExpenses.length) - 1 ? 1 : 0,
                borderBottomColor: theme.colors.border,
              }}
            >
              <View>
                <Text style={{ fontSize: 14, color: theme.colors.text.primary }} numberOfLines={1}>
                  {item.note || '—'}
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>
                  {item.categoryName} · {formatDate(item.transactionDate)}
                </Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: analyticsColors.expense }}>
                -{formatAmount(item.amount, currency)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
