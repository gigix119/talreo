/**
 * BudgetStatusWidget — compact scan strip: OK · blisko · przekroczone.
 * Mobile-first, easy to scan. Full details on Budgets tab.
 */
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import type { CategoryPerformanceRow } from '@/types/analytics';
import type { Currency } from '@/types/database';

interface BudgetStatusWidgetProps {
  data: CategoryPerformanceRow[];
  currency: Currency;
  month: string;
  emptyText: string;
}

function getStatusCounts(data: CategoryPerformanceRow[]): { ok: number; warning: number; exceeded: number } {
  let ok = 0;
  let warning = 0;
  let exceeded = 0;
  for (const row of data) {
    if (row.budget <= 0) continue;
    const pctUsed = (row.spent / row.budget) * 100;
    if (row.spent > row.budget) exceeded++;
    else if (pctUsed >= 80) warning++;
    else ok++;
  }
  return { ok, warning, exceeded };
}

export function BudgetStatusWidget({ data }: BudgetStatusWidgetProps) {
  const { t } = useI18n();
  if (data.length === 0) return null;

  const { ok, warning, exceeded } = getStatusCounts(data);
  const parts: string[] = [];
  if (ok > 0) parts.push(`${ok} ${t('budgets.ok')}`);
  if (warning > 0) parts.push(`${warning} ${t('budgets.warning')}`);
  if (exceeded > 0) parts.push(`${exceeded} ${t('budgets.exceeded')}`);
  if (parts.length === 0) return null;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.sm + 4,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.sm,
        gap: theme.spacing.sm,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.text.tertiary }}>
        {t('analytics.budgetStatus')}
      </Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>
        {parts.join(' · ')}
      </Text>
    </View>
  );
}
