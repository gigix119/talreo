/**
 * CashflowStoryWidget — financial narrative card.
 * "This month you earned X and spent Y. Savings rate Z%..."
 */
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsColors, analyticsShadows, analyticsRadius } from '@/constants/analyticsTheme';
import { formatAmount } from '@/utils/currency';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import type { MonthlyTrendItem } from '@/types/database';
import type { Currency } from '@/types/database';

interface CashflowStoryWidgetProps {
  trend: MonthlyTrendItem[];
  currency: Currency;
}

export function CashflowStoryWidget({ trend, currency }: CashflowStoryWidgetProps) {
  const { t } = useI18n();

  if (trend.length === 0) {
    return (
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: analyticsRadius.card,
          padding: theme.spacing.xl,
          ...analyticsShadows.card,
        }}
      >
        <Text style={{ fontSize: 16, color: theme.colors.text.secondary }}>{t('analytics.noData')}</Text>
      </View>
    );
  }

  const curr = trend[trend.length - 1];
  const prev = trend.length > 1 ? trend[trend.length - 2] : null;
  const savingsRate = curr.income > 0 ? Math.max(0, ((curr.income - curr.expense) / curr.income) * 100) : 0;
  const prevSavingsRate =
    prev && prev.income > 0 ? Math.max(0, ((prev.income - prev.expense) / prev.income) * 100) : null;
  const rateHigher = prevSavingsRate !== null && savingsRate > prevSavingsRate;

  const incomeDisplay = useAnimatedNumber(curr.income, 800, (v) => formatAmount(Math.round(v), currency));
  const expenseDisplay = useAnimatedNumber(curr.expense, 800, (v) => formatAmount(Math.round(v), currency));
  const rateDisplay = useAnimatedNumber(savingsRate, 800, (v) => `${Math.round(v)}%`);

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: analyticsRadius.card,
        padding: theme.spacing.xl,
        ...analyticsShadows.card,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: analyticsColors.balanceMuted,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.md,
          }}
        >
          <Text style={{ fontSize: 22 }}>📊</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.secondary }}>
          {t('analytics.cashflowStoryTitle')}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 17,
          lineHeight: 26,
          color: theme.colors.text.primary,
        }}
      >
        {t('analytics.cashflowStoryEarned')} {incomeDisplay} {t('analytics.cashflowStoryAndSpent')} {expenseDisplay}.{' '}
        {t('analytics.cashflowStoryRate')} {rateDisplay}
        {rateHigher ? ` ${t('analytics.cashflowStoryHigher')}` : ''}
      </Text>
    </View>
  );
}
