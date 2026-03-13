/**
 * Budgets screen — compact budget rows, progress bars, simple status.
 */
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { useBudgets } from '@/hooks/useBudgets';
import { useBudgetProgress } from '@/hooks/useBudgetProgress';
import { useI18n } from '@/i18n';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { theme } from '@/constants/theme';
import { BOTTOM_CONTENT_PADDING } from '@/constants/layout';
import { formatAmount } from '@/utils/currency';
import { getCurrentMonth, formatMonth } from '@/utils/date';
import type { BudgetProgress, BudgetStatus } from '@/types/database';

function StatusBadge({ status }: { status: BudgetStatus }) {
  const { t } = useI18n();
  const colors = {
    ok: theme.colors.success,
    warning: theme.colors.warning,
    exceeded: theme.colors.error,
  };
  const labels = {
    ok: t('budgets.ok'),
    warning: t('budgets.warning'),
    exceeded: t('budgets.exceeded'),
  };
  return (
    <View
      style={{
        backgroundColor: colors[status] + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.radius.sm,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: colors[status] }}>
        {labels[status]}
      </Text>
    </View>
  );
}

function ProgressBar({
  percent,
  status,
}: {
  percent: number;
  status: BudgetStatus;
}) {
  const capped = Math.min(percent, 100);
  const colors = {
    ok: theme.colors.primary,
    warning: theme.colors.warning,
    exceeded: theme.colors.error,
  };
  return (
    <View
      style={{
        height: 6,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.full,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${capped}%`,
          height: '100%',
          backgroundColor: colors[status],
          borderRadius: theme.radius.full,
        }}
      />
    </View>
  );
}

function BudgetCard({
  p,
  currency,
  onEdit,
  onDelete,
}: {
  p: BudgetProgress;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useI18n();
  const showOverflow = () => {
    Alert.alert(p.category_name, undefined, [
      { text: t('budgets.edit'), onPress: onEdit },
      { text: t('common.delete'), onPress: onDelete, style: 'destructive' },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };
  return (
    <Card key={p.budget.id} padding="md" elevated>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }} numberOfLines={1}>
              {p.category_name}
            </Text>
            <StatusBadge status={p.status} />
          </View>
          <Text style={{ fontSize: 14, color: theme.colors.text.secondary, marginTop: 4 }}>
            {formatAmount(p.spentAmount, currency)} / {formatAmount(p.budgetAmount, currency)}
          </Text>
          <View style={{ marginTop: 6 }}>
            <ProgressBar percent={p.progressPercent} status={p.status} />
          </View>
        </View>
        <Pressable onPress={showOverflow} hitSlop={12} style={{ padding: 8, marginLeft: 4 }}>
          <Text style={{ fontSize: 18, color: theme.colors.text.tertiary, fontWeight: '600' }}>⋯</Text>
        </Pressable>
      </View>
    </Card>
  );
}

export default function BudgetsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { profile } = useProfile();
  const currency = (profile?.currency ?? 'PLN') as import('@/types/database').Currency;
  const month = getCurrentMonth();
  const { budgets, loading, error, refetch, deleteBudget } = useBudgets(month);
  const { progress, loading: progressLoading, refetch: refetchProgress } = useBudgetProgress(month);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchProgress();
    }, [refetch, refetchProgress])
  );

  const loadingState = loading || progressLoading;
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteBudget(deleteTarget);
    setDeleteTarget(null);
  }, [deleteTarget, deleteBudget]);

  if (loadingState) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 48 }}>
          <Text style={{ color: theme.colors.text.secondary }}>{t('common.loading')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary }}>
            {t('budgets.title')}
          </Text>
          <Button
            variant="primary"
            onPress={() => router.push('/(modals)/add-budget')}
            style={{ paddingHorizontal: 16 }}
          >
            {t('budgets.add')}
          </Button>
        </View>

        <Text style={{ fontSize: 14, color: theme.colors.text.secondary, marginTop: 4 }}>
          {formatMonth(month)}
        </Text>

        {error ? (
          <Text style={{ color: theme.colors.error, marginTop: theme.spacing.md }}>{error}</Text>
        ) : null}

        {budgets.length === 0 ? (
          <View style={{ marginTop: theme.spacing.xl }}>
            <EmptyState
              title={t('budgets.noBudgets')}
              description={t('empty.addFirst')}
              actionLabel={t('budgets.addBudget')}
              onAction={() => router.push('/(modals)/add-budget')}
            />
          </View>
        ) : (
          <ScrollView
            style={{ marginTop: theme.spacing.lg }}
            contentContainerStyle={{ paddingBottom: BOTTOM_CONTENT_PADDING }}
            showsVerticalScrollIndicator={false}
          >
            {progress.map((p) => (
              <View key={p.budget.id} style={{ marginBottom: theme.spacing.sm }}>
                <BudgetCard
                  p={p}
                  currency={currency}
                  onEdit={() =>
                    router.push({
                      pathname: '/(modals)/add-budget',
                      params: {
                        budgetId: p.budget.id,
                        categoryId: p.budget.category_id,
                        month: p.budget.month,
                        amount: String(p.budgetAmount),
                      },
                    })
                  }
                  onDelete={() => setDeleteTarget(p.budget.id)}
                />
              </View>
            ))}
          </ScrollView>
        )}

        <ConfirmDialog
          visible={!!deleteTarget}
          title={t('common.deleteBudget')}
          message={t('common.confirmDelete')}
          confirmLabel={t('common.delete')}
          cancelLabel={t('common.cancel')}
          destructive
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </View>
    </ScreenContainer>
  );
}
