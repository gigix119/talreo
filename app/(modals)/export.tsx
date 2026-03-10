/**
 * Export — CSV and PDF export.
 */
import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useI18n } from '@/i18n';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/theme';
import { exportService } from '@/services/exportService';
import { getCurrentMonth } from '@/utils/date';
import type { Language } from '@/types/database';

export default function ExportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { settings } = useUserSettings();
  const { t } = useI18n();
  const currency = profile?.currency ?? 'PLN';
  const locale = (settings?.language ?? 'pl') as Language;
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleExportTransactions() {
    if (!user?.id) return;
    setLoading('transactions');
    setError('');
    try {
      await exportService.exportTransactionsCsv(user.id, locale);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(null);
    }
  }

  async function handleExportBudgets() {
    if (!user?.id) return;
    setLoading('budgets');
    setError('');
    try {
      const month = getCurrentMonth();
      await exportService.exportBudgetsCsv(user.id, month, locale);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(null);
    }
  }

  async function handleExportGoals() {
    if (!user?.id) return;
    setLoading('goals');
    setError('');
    try {
      await exportService.exportGoalsCsv(user.id, locale);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(null);
    }
  }

  async function handleExportPdf() {
    if (!user?.id) return;
    setLoading('pdf');
    setError('');
    try {
      const month = getCurrentMonth();
      await exportService.exportMonthlyPdf(user.id, month, locale, currency);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(null);
    }
  }

  const isLoading = !!loading;

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingTop: 48, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.text.primary }}>
            {t('export.title')}
          </Text>
          <Text
            onPress={() => router.back()}
            style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '500' }}
          >
            {t('common.close')}
          </Text>
        </View>

        {error ? (
          <Text style={{ color: theme.colors.error, marginTop: theme.spacing.md }}>{error}</Text>
        ) : null}

        <Card padding="lg" elevated style={{ marginTop: theme.spacing.xl }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.secondary, marginBottom: theme.spacing.md }}>
            {t('export.csv')}
          </Text>
          <View style={{ gap: theme.spacing.sm }}>
            <Button
              variant="secondary"
              onPress={handleExportTransactions}
              disabled={isLoading}
            >
              {loading === 'transactions' ? t('common.loading') : t('export.transactions')}
            </Button>
            <Button
              variant="secondary"
              onPress={handleExportBudgets}
              disabled={isLoading}
            >
              {loading === 'budgets' ? t('common.loading') : t('export.budgets')}
            </Button>
            <Button
              variant="secondary"
              onPress={handleExportGoals}
              disabled={isLoading}
            >
              {loading === 'goals' ? t('common.loading') : t('export.goals')}
            </Button>
          </View>
        </Card>

        <Card padding="lg" elevated style={{ marginTop: theme.spacing.lg }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.secondary, marginBottom: theme.spacing.md }}>
            {t('export.pdf')}
          </Text>
          <Button
            variant="primary"
            onPress={handleExportPdf}
            disabled={isLoading}
          >
            {loading === 'pdf' ? t('common.loading') : t('export.monthlyReport')}
          </Button>
        </Card>
      </View>
    </ScreenContainer>
  );
}
