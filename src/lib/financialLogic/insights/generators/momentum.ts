/**
 * Spending momentum insights: daily average, projected end-of-month spend.
 * Polish: średnio wydajesz X zł dziennie, przy obecnym tempie zakończysz miesiąc na Y zł.
 */
import type { FinancialInsight } from '../types';
import type { InsightEngineInput } from '../inputTypes';
import { formatAmountForInsight } from '../formatCurrency';

export function generateMomentumInsights(input: InsightEngineInput): FinancialInsight[] {
  const { velocity, currency } = input;
  const insights: FinancialInsight[] = [];

  if (velocity.daysElapsed === 0 && velocity.spentSoFar === 0) return insights;

  if (velocity.dailyAverage > 0) {
    insights.push({
      id: 'momentum-daily',
      type: 'momentum',
      severity: 'neutral',
      title: 'Średnie dzienne wydatki',
      description: `Średnio wydajesz ${formatAmountForInsight(velocity.dailyAverage, currency)} dziennie.`,
      value: velocity.dailyAverage,
      valueUnit: currency,
    });
  }

  if (velocity.daysInMonth > 0 && Number.isFinite(velocity.forecastThisMonth)) {
    insights.push({
      id: 'momentum-forecast',
      type: 'momentum',
      severity: 'neutral',
      title: 'Prognoza na koniec miesiąca',
      description: `Przy obecnym tempie zakończysz miesiąc z wydatkami na poziomie ${formatAmountForInsight(velocity.forecastThisMonth, currency)}.`,
      value: velocity.forecastThisMonth,
      valueUnit: currency,
    });
  }

  return insights;
}
