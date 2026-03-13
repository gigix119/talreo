/**
 * Recurring transactions list — manage recurring transactions.
 */
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useI18n } from '@/i18n';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { theme } from '@/constants/theme';
import { formatAmount } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import type { RecurringTransaction } from '@/types/database';

const FREQ_LABELS: Record<string, string> = {
  daily: 'Dziennie',
  weekly: 'Tygodniowo',
  monthly: 'Miesięcznie',
};

function RecurringCard({
  r,
  currency,
  categoryName,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  r: RecurringTransaction;
  currency: string;
  categoryName: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
}) {
  const { t } = useI18n();
  return (
    <Card key={r.id} padding="md" elevated>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
            {r.note || r.type}
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 4 }}>
            {categoryName} · {FREQ_LABELS[r.frequency] ?? r.frequency}
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: 2 }}>
            {formatDate(r.start_date)}
            {r.end_date ? ` – ${formatDate(r.end_date)}` : ' – ongoing'}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: r.type === 'income' ? theme.colors.income : theme.colors.expense,
              marginTop: 8,
            }}
          >
            {r.type === 'income' ? '+' : '−'} {formatAmount(Number(r.amount), currency)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <Switch
            value={r.is_active}
            onValueChange={onToggleActive}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
            thumbColor={r.is_active ? theme.colors.primary : theme.colors.text.tertiary}
          />
          <Button variant="ghost" onPress={onEdit} style={{ paddingHorizontal: 8 }}>
            {t('recurring.edit')}
          </Button>
          <Pressable onPress={onDelete} hitSlop={8} style={{ padding: 8 }}>
            <Text style={{ fontSize: 18, color: theme.colors.error }}>×</Text>
          </Pressable>
        </View>
      </View>
      {!r.is_active && (
        <View
          style={{
            backgroundColor: theme.colors.text.tertiary + '30',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: theme.radius.sm,
            marginTop: 8,
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>{t('recurring.inactive')}</Text>
        </View>
      )}
    </Card>
  );
}

export default function RecurringScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { profile } = useProfile();
  const currency = (profile?.currency ?? 'PLN') as import('@/types/database').Currency;
  const { categories } = useCategories();
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const {
    recurringTransactions,
    loading,
    error,
    refetch,
    updateRecurringTransaction,
    deleteRecurringTransaction,
  } = useRecurringTransactions();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteRecurringTransaction(deleteTarget);
    setDeleteTarget(null);
  }, [deleteTarget, deleteRecurringTransaction]);

  if (loading) {
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
      <View style={{ flex: 1, paddingTop: 48, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.text.primary }}>
            {t('recurring.title')}
          </Text>
          <Text
            onPress={() => router.back()}
            style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '500' }}
          >
            {t('recurring.close')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.md }}>
          <Text style={{ fontSize: 14, color: theme.colors.text.secondary }}>
            Manage recurring income and expenses.
          </Text>
          <Button
            variant="primary"
            onPress={() => router.push('/(modals)/add-recurring')}
            style={{ paddingHorizontal: 16 }}
          >
            {t('recurring.add')}
          </Button>
        </View>

        {error ? (
          <Text style={{ color: theme.colors.error, marginTop: theme.spacing.md }}>{error}</Text>
        ) : null}

        {recurringTransactions.length === 0 ? (
          <View style={{ marginTop: theme.spacing.xl }}>
            <EmptyState
              title={t('recurring.noRecurring')}
              description={t('empty.addFirst')}
              actionLabel={t('recurring.addRecurring')}
              onAction={() => router.push('/(modals)/add-recurring')}
            />
          </View>
        ) : (
          <ScrollView
            style={{ marginTop: theme.spacing.lg }}
            contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
            showsVerticalScrollIndicator={false}
          >
            {recurringTransactions.map((r) => (
              <View key={r.id} style={{ marginBottom: theme.spacing.sm }}>
                <RecurringCard
                  r={r}
                  currency={currency}
                  categoryName={r.category_id ? (catMap.get(r.category_id) ?? t('common.unknownCategory')) : t('common.uncategorized')}
                  onEdit={() =>
                    router.push({
                      pathname: '/(modals)/add-recurring',
                      params: {
                        id: r.id,
                        type: r.type,
                        amount: String(r.amount),
                        categoryId: r.category_id ?? '',
                        note: r.note ?? '',
                        frequency: r.frequency,
                        startDate: r.start_date,
                        endDate: r.end_date ?? '',
                        isActive: r.is_active ? '1' : '0',
                      },
                    })
                  }
                  onDelete={() => setDeleteTarget(r.id)}
                  onToggleActive={(active) => updateRecurringTransaction(r.id, { is_active: active })}
                />
              </View>
            ))}
          </ScrollView>
        )}

        <ConfirmDialog
          visible={!!deleteTarget}
          title={t('common.deleteRecurring')}
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
