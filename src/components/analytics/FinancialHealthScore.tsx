/**
 * Financial Health Score — 0–100 based on savings rate, expense stability, budget adherence.
 */
import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsColors, analyticsShadows, analyticsRadius } from '@/constants/analyticsTheme';
import type { MonthlyTrendItem } from '@/types/database';
import type { CategoryPerformanceRow } from '@/types/analytics';

interface FinancialHealthScoreProps {
  trend: MonthlyTrendItem[];
  categoryPerformance: CategoryPerformanceRow[];
  currency: string;
}

function computeScore(
  trend: MonthlyTrendItem[],
  categoryPerformance: CategoryPerformanceRow[]
): { score: number; trend: 'up' | 'down' | 'flat'; explanation: string } {
  if (trend.length === 0) {
    return { score: 50, trend: 'flat', explanation: 'Add more data to see your score.' };
  }

  const curr = trend[trend.length - 1];
  const prev = trend.length > 1 ? trend[trend.length - 2] : null;

  let score = 50;
  let trendDir: 'up' | 'down' | 'flat' = 'flat';

  // Savings rate (0–35 points)
  const savingsRate = curr.income > 0 ? Math.max(0, ((curr.income - curr.expense) / curr.income) * 100) : 0;
  score += Math.min(35, (savingsRate / 30) * 35);

  // Budget adherence (0–35 points) — categories under budget
  if (categoryPerformance.length > 0) {
    const underBudget = categoryPerformance.filter((r) => r.budget > 0 && r.spent <= r.budget).length;
    const adherence = (underBudget / categoryPerformance.length) * 100;
    score += (adherence / 100) * 35;
  }

  // Expense stability (0–30 points) — low variance
  if (trend.length >= 2) {
    const expenses = trend.map((t) => t.expense);
    const avg = expenses.reduce((s, x) => s + x, 0) / expenses.length;
    const variance = expenses.reduce((s, x) => s + (x - avg) ** 2, 0) / expenses.length;
    const stdDev = Math.sqrt(variance);
    const cv = avg > 0 ? stdDev / avg : 0;
    score += Math.max(0, 30 - cv * 100);
  }

  const clamped = Math.round(Math.min(100, Math.max(0, score)));

  if (prev && curr.balance > prev.balance) trendDir = 'up';
  else if (prev && curr.balance < prev.balance) trendDir = 'down';

  let explanation = '';
  if (savingsRate >= 20) {
    explanation = 'Strong savings rate.';
  } else if (savingsRate >= 10) {
    explanation = 'Good savings habits.';
  } else {
    explanation = 'Focus on increasing savings.';
  }
  if (categoryPerformance.length > 0) {
    const overBudget = categoryPerformance.filter((r) => r.budget > 0 && r.spent > r.budget).length;
    if (overBudget > 0) explanation += ` ${overBudget} category/categories over budget.`;
    else explanation += ' All budgets on track.';
  }

  return { score: clamped, trend: trendDir, explanation };
}

export function FinancialHealthScore({
  trend,
  categoryPerformance,
}: FinancialHealthScoreProps) {
  const { t } = useI18n();
  const { score, trend: trendDir, explanation } = useMemo(
    () => computeScore(trend, categoryPerformance),
    [trend, categoryPerformance]
  );

  const color = score >= 70 ? analyticsColors.success : score >= 50 ? analyticsColors.warning : analyticsColors.expense;

  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: analyticsRadius.card,
        padding: theme.spacing.lg,
        ...analyticsShadows.card,
        opacity: pressed ? 0.95 : 1,
      })}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          borderWidth: 4,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '700', color }}>{score}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
            {t('analytics.financialHealthScore')}
          </Text>
          <Text style={{ fontSize: 16 }}>{trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '→'}</Text>
        </View>
        <Text style={{ fontSize: 13, color: theme.colors.text.tertiary, marginTop: 4 }}>
          {explanation || t('analytics.healthScoreExplanation')}
        </Text>
      </View>
    </Pressable>
  );
}
