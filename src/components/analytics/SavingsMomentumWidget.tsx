/**
 * SavingsMomentumWidget — daily spending avg, trend, month-end forecast.
 */
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsColors, analyticsShadows, analyticsRadius } from '@/constants/analyticsTheme';
import { formatAmount } from '@/utils/currency';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { InteractiveWidget } from './InteractiveWidget';
import type { SpendingVelocity } from '@/types/analytics';
import type { Currency } from '@/types/database';

interface SavingsMomentumWidgetProps {
  velocity: SpendingVelocity | null;
  currency: Currency;
  emptyText: string;
}

export function SavingsMomentumWidget({ velocity, currency, emptyText }: SavingsMomentumWidgetProps) {
  const { t } = useI18n();

  const hasVelocity = velocity && (velocity.spentSoFar > 0 || velocity.forecastThisMonth > 0);

  const dailyDisplay = useAnimatedNumber(velocity?.dailyAverage ?? 0, 700, (v) => formatAmount(Math.round(v), currency));
  const forecastDisplay = useAnimatedNumber(velocity?.forecastThisMonth ?? 0, 700, (v) => formatAmount(Math.round(v), currency));

  if (!hasVelocity) {
    return (
      <InteractiveWidget title={t('analytics.spendingMomentum')} icon="📈">
        <Text style={{ fontSize: 15, color: theme.colors.text.tertiary }}>{emptyText}</Text>
      </InteractiveWidget>
    );
  }

  const v = velocity!;
  const progressPct = v.daysInMonth > 0 ? Math.min(100, (v.daysElapsed / v.daysInMonth) * 100) : 0;

  return (
    <InteractiveWidget title={t('analytics.spendingMomentum')} icon="📈">
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <View>
            <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginBottom: 4 }}>
              {t('analytics.dailySpending')}
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: theme.colors.text.primary }}>
              {dailyDisplay}
              <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.text.tertiary }}> {t('analytics.dailyUnit')}</Text>
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginBottom: 4 }}>
              {t('analytics.projectedMonthEnd')}
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: analyticsColors.expense }}>
              {forecastDisplay}
            </Text>
          </View>
        </View>
        <View
          style={{
            height: 8,
            backgroundColor: theme.colors.background,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${progressPct}%`,
              height: '100%',
              backgroundColor: analyticsColors.balance,
              borderRadius: 4,
            }}
          />
        </View>
        <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>
          {v.daysElapsed} {t('analytics.daysElapsed')} · {formatAmount(v.spentSoFar, currency)} {t('analytics.spent')}
        </Text>
      </View>
    </InteractiveWidget>
  );
}
