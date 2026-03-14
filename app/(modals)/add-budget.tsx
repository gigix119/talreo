/**
 * Add/Edit budget modal — category (expense only), month, amount.
 * Upserts; no duplicates for same category + month.
 */
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { useProfile } from '@/hooks/useProfile';
import { useCategories } from '@/hooks/useCategories';
import { useBudgets } from '@/hooks/useBudgets';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { theme } from '@/constants/theme';
import { getCurrentMonth, getFirstDayOfMonth, formatMonth } from '@/utils/date';

export default function AddBudgetScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useLocalSearchParams<{
    budgetId?: string;
    categoryId?: string;
    month?: string;
    amount?: string;
  }>();
  const { profile } = useProfile();
  const currency = profile?.currency ?? 'PLN';
  const expenseCategories = useCategories('expense');
  const categories = expenseCategories.categories;

  const [categoryId, setCategoryId] = useState<string | null>(params.categoryId ?? null);
  const [month, setMonth] = useState(params.month ?? getCurrentMonth());
  const [amount, setAmount] = useState(params.amount ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const monthLabel = formatMonth(month);

  const { upsertBudget } = useBudgets(month);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
    if (params.categoryId) setCategoryId(params.categoryId);
  }, [categories, categoryId, params.categoryId]);

  function prevMonth() {
    const d = new Date(month + 'T00:00:00');
    setMonth(getFirstDayOfMonth(d.getFullYear(), d.getMonth() - 1));
  }

  function nextMonth() {
    const d = new Date(month + 'T00:00:00');
    setMonth(getFirstDayOfMonth(d.getFullYear(), d.getMonth() + 1));
  }

  async function handleSave() {
    setError('');
    const amt = parseFloat(amount.replace(',', '.'));
    if (isNaN(amt) || amt <= 0) {
      setError('Podaj poprawną kwotę.');
      return;
    }
    if (categories.length > 0 && !categoryId) {
      setError('Wybierz kategorię.');
      return;
    }
    const cat = categories.find((c) => c.id === categoryId);
    if (cat && cat.type !== 'expense') {
      setError('Budżety tylko dla kategorii typu expense.');
      return;
    }
    setLoading(true);
    try {
      await upsertBudget({ category_id: categoryId!, month, amount: amt });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się zapisać budżetu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer withPadding={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.text.primary }}>
            {params.budgetId ? t('budgets.editBudget') : t('budgets.addBudget')}
          </Text>
          <Text
            onPress={() => router.back()}
            style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '500' }}
          >
            {t('common.cancel')}
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ marginTop: theme.spacing.xl }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>
                Kategoria (expense)
              </Text>
              {categories.length === 0 ? (
                <Text style={{ fontSize: 14, color: theme.colors.warning }}>
                  Brak kategorii expense. Utwórz najpierw kategorię.
                </Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                  {categories.map((c) => (
                    <Button
                      key={c.id}
                      variant={categoryId === c.id ? 'primary' : 'secondary'}
                      onPress={() => setCategoryId(c.id)}
                      style={{ paddingHorizontal: 12 }}
                    >
                      {c.name}
                    </Button>
                  ))}
                </View>
              )}
            </View>

            <View style={{ marginTop: theme.spacing.lg }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>
                Miesiąc
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <Pressable onPress={prevMonth} hitSlop={12} style={{ padding: 8 }}>
                  <Text style={{ fontSize: 20, color: theme.colors.primary }}>‹</Text>
                </Pressable>
                <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text.primary, flex: 1, textAlign: 'center' }}>
                  {monthLabel}
                </Text>
                <Pressable onPress={nextMonth} hitSlop={12} style={{ padding: 8 }}>
                  <Text style={{ fontSize: 20, color: theme.colors.primary }}>›</Text>
                </Pressable>
              </View>
            </View>

            <Input
              label="Kwota (limit)"
              value={amount}
              onChangeText={setAmount}
              placeholder={t('goals.placeholderAmount')}
              keyboardType="decimal-pad"
            />

            {error ? (
              <Text style={{ fontSize: 12, color: theme.colors.error, marginTop: theme.spacing.sm }}>
                {error}
              </Text>
            ) : null}

            <Button
              onPress={handleSave}
              disabled={loading || categories.length === 0}
              fullWidth
              style={{ marginTop: theme.spacing.xl }}
            >
              {loading ? t('common.saving') : t('common.save')}
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
