/**
 * Category details panel — total, avg, largest, trend, transactions list.
 */
import { View, Text, ScrollView, Modal } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { formatAmount } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import type { CategoryDetails } from '@/types/analytics';
import type { Currency } from '@/types/database';

interface CategoryDetailsPanelProps {
  visible: boolean;
  details: CategoryDetails | null;
  currency: Currency;
  onClose: () => void;
}

export function CategoryDetailsPanel({
  visible,
  details,
  currency,
  onClose,
}: CategoryDetailsPanelProps) {
  const { t } = useI18n();
  if (!details) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.md,
            paddingTop: theme.spacing.xl,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary }}>
            {details.categoryName}
          </Text>
          <Button variant="ghost" onPress={onClose}>
            {t('common.close')}
          </Button>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: theme.spacing.xxl }}
          showsVerticalScrollIndicator={false}
        >
          <Card padding="lg" elevated style={{ marginBottom: theme.spacing.md }}>
            <Text style={{ fontSize: 14, color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>
              Summary
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
              <StatBlock label={t('analytics.totalSpent')} value={formatAmount(details.totalSpent, currency)} />
              <StatBlock label={t('analytics.avgTransaction')} value={formatAmount(details.avgTransaction, currency)} />
              <StatBlock label={t('analytics.largest')} value={formatAmount(details.largestTransaction, currency)} />
              <StatBlock label={t('analytics.transactions')} value={String(details.transactionCount)} />
            </View>
          </Card>

          {details.monthlyTrend.length > 0 && (
            <Card padding="lg" elevated style={{ marginBottom: theme.spacing.md }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>
                {t('analytics.monthlyTrendTitle')}
              </Text>
              {details.monthlyTrend.map(({ month, amount }) => (
                <View
                  key={month}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: theme.spacing.xs,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <Text style={{ fontSize: 14, color: theme.colors.text.secondary }}>
                    {new Date(month + 'T00:00:00').toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' })}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>
                    {formatAmount(amount, currency)}
                  </Text>
                </View>
              ))}
            </Card>
          )}

          <Card padding="lg" elevated>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>
              {t('analytics.transactions')}
            </Text>
            {details.transactions.length === 0 ? (
              <Text style={{ fontSize: 14, color: theme.colors.text.secondary }}>{t('analytics.noData')}</Text>
            ) : (
              details.transactions.map((tx) => (
                <View
                  key={tx.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: theme.spacing.sm,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 14, color: theme.colors.text.primary }}>
                      {tx.note || 'No note'}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>
                      {formatDate(tx.transaction_date)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.expense }}>
                    -{formatAmount(Number(tx.amount), currency)}
                  </Text>
                </View>
              ))
            )}
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ minWidth: 120 }}>
      <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text.primary }}>{value}</Text>
    </View>
  );
}
