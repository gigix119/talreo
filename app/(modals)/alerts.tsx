/**
 * Alerts center — list, mark as read, delete.
 */
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAlerts } from '@/hooks/useAlerts';
import { useI18n } from '@/i18n';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { theme } from '@/constants/theme';
import { formatDate } from '@/utils/date';

export default function AlertsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const {
    alerts,
    loading,
    error,
    refetch,
    markAlertAsRead,
    markAllAlertsAsRead,
    deleteAlert,
  } = useAlerts();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteAlert(deleteTarget);
    setDeleteTarget(null);
  }, [deleteTarget, deleteAlert]);

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
            {t('alerts.title')}
          </Text>
          <Text
            onPress={() => router.back()}
            style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '500' }}
          >
            {t('common.close')}
          </Text>
        </View>
        {alerts.length > 0 ? (
          <Button
            variant="secondary"
            onPress={markAllAlertsAsRead}
            style={{ marginTop: theme.spacing.md, alignSelf: 'flex-start' }}
          >
            {t('alerts.markAllRead')}
          </Button>
        ) : null}

        {error ? (
          <Text style={{ color: theme.colors.error, marginTop: theme.spacing.md }}>{error}</Text>
        ) : null}

        {alerts.length === 0 ? (
          <View style={{ marginTop: theme.spacing.xl }}>
            <EmptyState
              title={t('alerts.noAlerts')}
              actionLabel={t('alerts.goToDashboard')}
              onAction={() => router.back()}
            />
          </View>
        ) : (
          <ScrollView
            style={{ marginTop: theme.spacing.lg }}
            contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
            showsVerticalScrollIndicator={false}
          >
            {alerts.map((a) => (
              <Card
                key={a.id}
                padding="md"
                elevated
                style={{
                  marginBottom: theme.spacing.sm,
                  opacity: a.is_read ? 0.8 : 1,
                  borderLeftWidth: a.is_read ? 0 : 4,
                  borderLeftColor: theme.colors.primary,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
                      {a.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginTop: 4 }}>
                      {a.message}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: 4 }}>
                      {formatDate(a.created_at.slice(0, 10))}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
                    {!a.is_read && (
                      <Button
                        variant="ghost"
                        onPress={() => markAlertAsRead(a.id)}
                        style={{ paddingHorizontal: 8 }}
                      >
                        OK
                      </Button>
                    )}
                    <Pressable onPress={() => setDeleteTarget(a.id)} hitSlop={8} style={{ padding: 8 }}>
                      <Text style={{ fontSize: 18, color: theme.colors.error }}>×</Text>
                    </Pressable>
                  </View>
                </View>
              </Card>
            ))}
          </ScrollView>
        )}

        <ConfirmDialog
          visible={!!deleteTarget}
          title={t('common.deleteAlert')}
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
