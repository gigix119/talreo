/**
 * Goals screen — savings goals list.
 * Primary action: Wpłać. Secondary: Wypłać. Edit/Delete in overflow menu.
 */
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useI18n } from '@/i18n';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { theme } from '@/constants/theme';
import { BOTTOM_CONTENT_PADDING } from '@/constants/layout';
import { formatAmount } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import type { SavingsGoalWithStatus, GoalStatus } from '@/types/database';

function StatusBadge({ status }: { status: GoalStatus }) {
  const { t } = useI18n();
  const colors = {
    active: theme.colors.primary,
    completed: theme.colors.success,
    overdue: theme.colors.error,
  };
  const labels = {
    active: t('goals.active'),
    completed: t('goals.completed'),
    overdue: t('goals.overdue'),
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
      <Text style={{ fontSize: 12, fontWeight: '600', color: colors[status] }}>{labels[status]}</Text>
    </View>
  );
}

function GoalCard({
  g,
  currency,
  onAddFunds,
  onWithdraw,
  onEdit,
  onDelete,
}: {
  g: SavingsGoalWithStatus;
  currency: string;
  onAddFunds: () => void;
  onWithdraw: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useI18n();
  const progressColor =
    g.status === 'completed'
      ? theme.colors.success
      : g.status === 'overdue'
        ? theme.colors.warning
        : theme.colors.primary;

  const showOverflowMenu = () => {
    Alert.alert(g.name, undefined, [
      { text: t('goals.edit'), onPress: onEdit },
      { text: t('common.delete'), onPress: onDelete, style: 'destructive' },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  return (
    <Card key={g.id} padding="md" elevated>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text.primary }} numberOfLines={1}>
            {g.name}
          </Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.secondary, marginTop: 4 }}>
            {formatAmount(g.current_amount, currency)} / {formatAmount(g.target_amount, currency)}
            <Text style={{ fontSize: 13, color: theme.colors.text.tertiary }}> · {g.progressPercent.toFixed(0)}%</Text>
          </Text>
          <View
            style={{
              height: 6,
              backgroundColor: theme.colors.border,
              borderRadius: 3,
              marginTop: 8,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${Math.min(g.progressPercent, 100)}%`,
                height: '100%',
                backgroundColor: progressColor,
                borderRadius: 3,
              }}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: theme.spacing.sm, flexWrap: 'wrap' }}>
            <Button variant="primary" onPress={onAddFunds} style={{ paddingHorizontal: 14, paddingVertical: 6 }}>
              {t('goals.addFunds')}
            </Button>
            <Button variant="ghost" onPress={onWithdraw} style={{ paddingHorizontal: 10 }}>
              {t('goals.withdraw')}
            </Button>
            {g.status !== 'active' ? <StatusBadge status={g.status} /> : null}
            {g.target_date ? (
              <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>
                {t('goals.targetDate')}: {formatDate(g.target_date)}
              </Text>
            ) : null}
          </View>
        </View>
        <Pressable onPress={showOverflowMenu} hitSlop={12} style={{ padding: 8, marginLeft: 4 }}>
          <Text style={{ fontSize: 18, color: theme.colors.text.tertiary, fontWeight: '600' }}>⋯</Text>
        </Pressable>
      </View>
    </Card>
  );
}

export default function GoalsScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const currency = (profile?.currency ?? 'PLN') as import('@/types/database').Currency;
  const { t } = useI18n();
  const { goals, loading, error, refetch, deleteSavingsGoal } = useSavingsGoals();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteSavingsGoal(deleteTarget);
    setDeleteTarget(null);
  }, [deleteTarget, deleteSavingsGoal]);

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 48 }}>
          <Text style={{ color: theme.colors.text.secondary }}>{t('common.loading')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  const sorted = [...goals].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    if (a.target_date && b.target_date) return a.target_date.localeCompare(b.target_date);
    return 0;
  });

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary }}>
            {t('goals.title')}
          </Text>
          <Button
            variant="primary"
            onPress={() => router.push('/(modals)/add-goal')}
            style={{ paddingHorizontal: 16 }}
          >
            {t('goals.add')}
          </Button>
        </View>

        {error ? (
          <Text style={{ color: theme.colors.error, marginTop: theme.spacing.md }}>{error}</Text>
        ) : null}

        {goals.length === 0 ? (
          <View style={{ marginTop: theme.spacing.xl }}>
            <EmptyState
              title={t('goals.noGoals')}
              description={t('empty.addFirst')}
              actionLabel={t('goals.addGoal')}
              onAction={() => router.push('/(modals)/add-goal')}
            />
          </View>
        ) : (
          <ScrollView
            style={{ marginTop: theme.spacing.lg }}
            contentContainerStyle={{ paddingBottom: BOTTOM_CONTENT_PADDING }}
            showsVerticalScrollIndicator={false}
          >
            {sorted.map((g) => (
              <View key={g.id} style={{ marginBottom: theme.spacing.sm }}>
                <GoalCard
                  g={g}
                  currency={currency}
                  onAddFunds={() =>
                    router.push({
                      pathname: '/(modals)/goal-funds',
                      params: { goalId: g.id, action: 'add', name: g.name },
                    })
                  }
                  onWithdraw={() =>
                    router.push({
                      pathname: '/(modals)/goal-funds',
                      params: { goalId: g.id, action: 'withdraw', name: g.name },
                    })
                  }
                  onEdit={() =>
                    router.push({
                      pathname: '/(modals)/add-goal',
                      params: {
                        goalId: g.id,
                        name: g.name,
                        targetAmount: String(g.target_amount),
                        currentAmount: String(g.current_amount),
                        targetDate: g.target_date ?? '',
                      },
                    })
                  }
                  onDelete={() => setDeleteTarget(g.id)}
                />
              </View>
            ))}
          </ScrollView>
        )}

        <ConfirmDialog
          visible={!!deleteTarget}
          title={t('common.deleteGoal')}
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
