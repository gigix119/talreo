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

  return (
    <InteractiveWidget title={t('analytics.spendingMomentum')} icon="📈">
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <View>
            <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>{t('analytics.dailyAvg')}</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary }}>
              {dailyDisplay} <Text style={{ fontSize: 13, fontWeight: '500', color: theme.colors.text.tertiary }}>/ {t('analytics.day')}</Text>
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>{t('analytics.projMonth')}</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: analyticsColors.expense }}>{forecastDisplay}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 11, color: theme.colors.text.tertiary }}>
          {t('analytics.projContext')} {v.daysElapsed}/{v.daysInMonth} dni.
        </Text>
      </View>
    </InteractiveWidget>
  );
}
