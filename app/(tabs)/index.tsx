/**
 * Dashboard — mobile-first: Header → Key metrics → Insight → Budget → Recent tx → Goals → Alerts
 */
import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgetProgress } from '@/hooks/useBudgetProgress';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { useInsights } from '@/hooks/useInsights';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useAlerts } from '@/hooks/useAlerts';
import { useI18n } from '@/i18n';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { theme } from '@/constants/theme';
import { BOTTOM_CONTENT_PADDING, SECTION_GAP, CARD_GAP } from '@/constants/layout';
import { formatAmount, formatAmountSigned } from '@/utils/currency';
import { getCurrentMonthRange, formatDate, getCurrentMonth } from '@/utils/date';
import { alertsService } from '@/services/alerts';

function SummaryCard({
  label,
  amount,
  isPositive,
}: {
  label: string;
  amount: string;
  isPositive?: boolean;
}) {
  const color =
    isPositive === undefined ? theme.colors.text.primary : isPositive ? theme.colors.income : theme.colors.expense;
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text style={{ fontSize: 11, color: theme.colors.text.tertiary, fontWeight: '500' }}>{label}</Text>
      <Text style={{ fontSize: 20, fontWeight: '800', color, marginTop: 4, letterSpacing: -0.3 }} numberOfLines={1} adjustsFontSizeToFit>
        {amount}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { t } = useI18n();
  const currency = profile?.currency ?? 'PLN';
  const { fromDate, toDate } = getCurrentMonthRange();
  const month = getCurrentMonth();
  const monthly = useTransactions({ fromDate, toDate });
  const recent = useTransactions({ limit: 5 });
  const budgetProgress = useBudgetProgress(month);
  const { runRecurringCatchup } = useRecurringTransactions();
  const insights = useInsights(month);
  const { goals, refetch: refetchGoals } = useSavingsGoals();
  const { alerts, unreadCount, refetch: refetchAlerts } = useAlerts(10);

  useFocusEffect(
    useCallback(() => {
      runRecurringCatchup().then(() => {
        monthly.refetch();
        recent.refetch();
      });
      budgetProgress.refetch();
      insights.refetch();
      refetchGoals();
      refetchAlerts();
      if (user?.id) {
        alertsService.generateSystemAlerts(user.id, month).then(() => refetchAlerts());
      }
    }, [])
  );

  const loading = monthly.loading || recent.loading || budgetProgress.loading || insights.loading;

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 48 }}>
          <Text style={{ color: theme.colors.text.secondary }}>{t('common.loading')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  const incomeStr = formatAmount(monthly.income, currency);
  const expenseStr = formatAmount(monthly.expense, currency);
  const balanceStr = formatAmountSigned(monthly.balance, currency);

  return (
    <ScreenContainer>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: BOTTOM_CONTENT_PADDING }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary }}>
            {t('dashboard.title')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <View style={{ position: 'relative' }}>
              <Button
                variant="ghost"
                onPress={() => router.push('/(modals)/alerts')}
                style={{ paddingHorizontal: 12 }}
              >
                🔔
              </Button>
              {unreadCount > 0 ? (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: theme.colors.error,
                    borderRadius: 10,
                    minWidth: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              ) : null}
            </View>
            <Button
              variant="primary"
              onPress={() => router.push('/(modals)/add-transaction')}
              style={{ paddingHorizontal: 16 }}
            >
              {t('dashboard.add')}
            </Button>
          </View>
        </View>

        {/* Key metrics */}
        <Card padding="md" elevated style={{ marginTop: SECTION_GAP }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: theme.spacing.md,
              flexWrap: 'wrap',
              gap: theme.spacing.md,
            }}
          >
            <SummaryCard label={t('dashboard.income')} amount={incomeStr} isPositive={true} />
            <SummaryCard label={t('dashboard.expense')} amount={expenseStr} isPositive={false} />
            <SummaryCard label={t('dashboard.balance')} amount={balanceStr} />
          </View>
        </Card>

        {/* Insight / warning */}
        {insights.insights && insights.insights.insights.length > 0 ? (
          <View style={{ marginTop: SECTION_GAP }}>
            <View
              style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.md,
                borderLeftWidth: 3,
                borderLeftColor:
                  insights.insights.insights[0].type === 'warning'
                    ? theme.colors.warning
                    : insights.insights.insights[0].type === 'success'
                      ? theme.colors.success
                      : theme.colors.primary,
              }}
            >
              {insights.insights.insights.slice(0, 2).map((i, idx, arr) => (
                <View
                  key={i.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: theme.spacing.sm,
                    ...(idx < arr.length - 1
                      ? {
                          borderBottomWidth: 1,
                          borderBottomColor: theme.colors.border,
                        }
                      : {}),
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor:
                        i.type === 'success'
                          ? theme.colors.success
                          : i.type === 'warning'
                            ? theme.colors.warning
                            : i.type === 'highlight'
                              ? theme.colors.primary
                              : theme.colors.text.tertiary,
                      marginRight: theme.spacing.sm,
                    }}
                  />
                  <Text style={{ fontSize: 14, color: theme.colors.text.primary, flex: 1 }}>
                    {i.text}
                  </Text>
                  {i.value != null && typeof i.value === 'number' ? (
                    <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text.secondary }}>
                      {formatAmount(i.value, currency)}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
            <Text
              onPress={() => router.push('/(tabs)/analytics')}
              style={{ fontSize: 13, color: theme.colors.primary, fontWeight: '500', marginTop: theme.spacing.sm }}
            >
              {t('dashboard.analytics')} →
            </Text>
          </View>
        ) : null}

        {/* Budget strip */}
        {budgetProgress.progress.length > 0 ? (
          <Pressable
            onPress={() => router.push('/(tabs)/budgets')}
            style={({ pressed }) => ({
              marginTop: SECTION_GAP,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: theme.spacing.sm + 4,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.sm,
              opacity: pressed ? 0.95 : 1,
            })}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text.secondary }}>
              {t('dashboard.budgetOverview')}
            </Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              {(() => {
                const ok = budgetProgress.progress.filter((p) => p.status === 'ok').length;
                const warning = budgetProgress.progress.filter((p) => p.status === 'warning').length;
                const exceeded = budgetProgress.progress.filter((p) => p.status === 'exceeded').length;
                const parts: string[] = [];
                if (ok) parts.push(`${ok} ${t('budgets.ok')}`);
                if (warning) parts.push(`${warning} ${t('budgets.warning')}`);
                if (exceeded) parts.push(`${exceeded} ${t('budgets.exceeded')}`);
                return (
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>
                    {parts.join(' · ')}
                  </Text>
                );
              })()}
            </View>
            <Text style={{ fontSize: 13, color: theme.colors.primary }}>→</Text>
          </Pressable>
        ) : null}

        {/* Recent transactions (secondary) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SECTION_GAP }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
            {t('dashboard.recentTransactions')}
          </Text>
          <Text
            onPress={() => router.push('/(tabs)/transactions')}
            style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '500' }}
          >
            {t('dashboard.seeAll')}
          </Text>
        </View>

        {recent.transactions.length === 0 ? (
          <View style={{ marginTop: CARD_GAP }}>
            <EmptyState
              title={t('dashboard.noTransactions')}
              actionLabel={t('dashboard.addFirstTransaction')}
              onAction={() => router.push('/(modals)/add-transaction')}
              variant="compact"
            />
          </View>
        ) : (
          <View style={{ marginTop: CARD_GAP, gap: CARD_GAP }}>
            {recent.transactions.map((tx) => (
              <Card key={tx.id} padding="md" elevated>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, minWidth: 0, marginRight: theme.spacing.sm }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }} numberOfLines={1}>
                      {(tx.note || (tx.type === 'income' ? t('common.typeIncome') : t('common.typeExpense'))).replace(/^\[recurring:[^]+\]\s*/, '')}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: 2 }}>
                      {formatDate(tx.transaction_date)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: tx.type === 'income' ? theme.colors.income : theme.colors.expense,
                      flexShrink: 0,
                    }}
                    numberOfLines={1}
                  >
                    {tx.type === 'income' ? '+' : '−'} {formatAmount(Number(tx.amount), currency)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Goals (secondary) */}
        {goals.length > 0 ? (
          <View style={{ marginTop: SECTION_GAP }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
                {t('dashboard.goalsPreview')}
              </Text>
              <Text
                onPress={() => router.push('/(tabs)/goals')}
                style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '500' }}
              >
                {t('dashboard.seeAll')}
              </Text>
            </View>
            {[...goals]
              .filter((g) => g.status !== 'completed')
              .sort((a, b) => (a.target_date ?? '9999').localeCompare(b.target_date ?? '9999'))
              .slice(0, 3)
              .map((g) => (
                <Pressable
                  key={g.id}
                  onPress={() => router.push('/(tabs)/goals')}
                  style={({ pressed }) => ({
                    marginTop: CARD_GAP,
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.radius.sm,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    opacity: pressed ? 0.95 : 1,
                  })}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }} numberOfLines={1}>
                    {g.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 }}>
                    {formatAmount(g.current_amount, currency)} / {formatAmount(g.target_amount, currency)} · {g.progressPercent.toFixed(0)}%
                  </Text>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: theme.colors.border,
                      borderRadius: theme.radius.full,
                      marginTop: 6,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${Math.min(g.progressPercent, 100)}%`,
                        height: '100%',
                        backgroundColor: theme.colors.primary,
                        borderRadius: theme.radius.full,
                      }}
                    />
                  </View>
                </Pressable>
              ))}
          </View>
        ) : null}

        {/* Alerts (secondary) */}
        {alerts.length > 0 ? (
          <View style={{ marginTop: SECTION_GAP, marginBottom: SECTION_GAP }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
                {t('dashboard.alertsPreview')}
              </Text>
              <Text
                onPress={() => router.push('/(modals)/alerts')}
                style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '500' }}
              >
                {t('dashboard.viewAllAlerts')}
              </Text>
            </View>
            {alerts.slice(0, 2).map((a) => (
              <Card
                key={a.id}
                padding="md"
                elevated
                style={{
                  marginTop: CARD_GAP,
                  borderLeftWidth: a.is_read ? 0 : 4,
                  borderLeftColor: theme.colors.primary,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>
                  {a.title}
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 4 }}>
                  {a.message}
                </Text>
              </Card>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}
