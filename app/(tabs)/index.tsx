/**
 * Dashboard — summary, budget overview, goals preview, alerts preview, insights, transactions.
 */
import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
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
import { BOTTOM_CONTENT_PADDING } from '@/constants/layout';
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
    <View style={{ flex: 1, minWidth: 100 }}>
      <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>{label}</Text>
      <Text style={{ fontSize: 22, fontWeight: '700', color, marginTop: 4 }}>{amount}</Text>
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

        {/* Top money cards: Przychody, Wydatki, Saldo */}
        <Card padding="md" elevated style={{ marginTop: theme.spacing.lg }}>
          <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>
            {t('dashboard.thisMonth')}
          </Text>
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

        {/* Budget progress */}
        {budgetProgress.progress.length > 0 ? (
          <View style={{ marginTop: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
                {t('dashboard.budgetOverview')}
              </Text>
              <Text
                onPress={() => router.push('/(tabs)/budgets')}
                style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '500' }}
              >
                {t('dashboard.seeAll')}
              </Text>
            </View>
            {budgetProgress.progress
              .sort((a, b) => b.progressPercent - a.progressPercent)
              .slice(0, 5)
              .map((p) => (
                <Card key={p.budget.id} padding="md" elevated style={{ marginTop: theme.spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
                        {p.category_name}
                      </Text>
                      <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 }}>
                        {formatAmount(p.spentAmount, currency)} / {formatAmount(p.budgetAmount, currency)}
                        {' · '}{p.progressPercent.toFixed(0)}%
                      </Text>
                      <View
                        style={{
                          height: 4,
                          backgroundColor: theme.colors.border,
                          borderRadius: 2,
                          marginTop: 6,
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          style={{
                            width: `${Math.min(p.progressPercent, 100)}%`,
                            height: '100%',
                            backgroundColor:
                              p.status === 'exceeded'
                                ? theme.colors.error
                                : p.status === 'warning'
                                  ? theme.colors.warning
                                  : theme.colors.primary,
                            borderRadius: 2,
                          }}
                        />
                      </View>
                    </View>
                    {p.status === 'exceeded' ? (
                      <View
                        style={{
                          backgroundColor: theme.colors.error + '20',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: theme.radius.sm,
                          marginLeft: theme.spacing.sm,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.error }}>
                          {t('budgets.exceeded')}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Card>
              ))}
          </View>
        ) : null}

        {/* Recent transactions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.lg }}>
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
          <View style={{ marginTop: theme.spacing.md }}>
            <EmptyState
              title={t('dashboard.noTransactions')}
              actionLabel={t('dashboard.addFirstTransaction')}
              onAction={() => router.push('/(modals)/add-transaction')}
              variant="compact"
            />
          </View>
        ) : (
          <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
            {recent.transactions.map((t) => (
              <Card key={t.id} padding="md" elevated>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
                      {(t.note || t.type).replace(/^\[recurring:[^]+\]\s*/, '')}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: 2 }}>
                      {formatDate(t.transaction_date)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: t.type === 'income' ? theme.colors.income : theme.colors.expense,
                    }}
                  >
                    {t.type === 'income' ? '+' : '−'} {formatAmount(Number(t.amount), currency)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* AI insight card */}
        {insights.insights && insights.insights.insights.length > 0 ? (
          <View style={{ marginTop: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
                {t('dashboard.insights')}
              </Text>
              <Text
                onPress={() => router.push('/(tabs)/analytics')}
                style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '500' }}
              >
                {t('dashboard.analytics')}
              </Text>
            </View>
            <Card padding="md" elevated style={{ marginTop: theme.spacing.sm }}>
              {insights.insights.insights.slice(0, 4).map((i, idx, arr) => (
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
            </Card>
          </View>
        ) : null}

        {/* Goals & alerts previews remain below main content */}
        {goals.length > 0 ? (
          <View style={{ marginTop: theme.spacing.lg }}>
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
                <Card key={g.id} padding="md" elevated style={{ marginTop: theme.spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
                        {g.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 }}>
                        {formatAmount(g.current_amount, currency)} / {formatAmount(g.target_amount, currency)}
                        {' · '}{g.progressPercent.toFixed(0)}%
                      </Text>
                      <View
                        style={{
                          height: 4,
                          backgroundColor: theme.colors.border,
                          borderRadius: 2,
                          marginTop: 6,
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          style={{
                            width: `${Math.min(g.progressPercent, 100)}%`,
                            height: '100%',
                            backgroundColor: theme.colors.primary,
                            borderRadius: 2,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
          </View>
        ) : null}

        {alerts.length > 0 ? (
          <View style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
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
            {alerts.slice(0, 3).map((a) => (
              <Card
                key={a.id}
                padding="md"
                elevated
                style={{
                  marginTop: theme.spacing.sm,
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
