/**
 * Add/Edit recurring transaction — type, amount, category, frequency, dates, active.
 */
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Switch } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useCategories } from '@/hooks/useCategories';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { theme } from '@/constants/theme';
import { useI18n } from '@/i18n';
import type { TransactionType, RecurringFrequency } from '@/types/database';

const FREQUENCIES: RecurringFrequency[] = ['daily', 'weekly', 'monthly'];

export default function AddRecurringScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useLocalSearchParams<{
    id?: string;
    type?: string;
    amount?: string;
    categoryId?: string;
    note?: string;
    frequency?: string;
    startDate?: string;
    endDate?: string;
    isActive?: string;
  }>();
  const { profile } = useProfile();
  const currency = profile?.currency ?? 'PLN';
  const expenseCategories = useCategories('expense');
  const incomeCategories = useCategories('income');
  const [type, setType] = useState<TransactionType>((params.type as TransactionType) ?? 'expense');
  const categories = type === 'expense' ? expenseCategories.categories : incomeCategories.categories;
  const {
    createRecurringTransaction,
    updateRecurringTransaction,
  } = useRecurringTransactions();

  const [amount, setAmount] = useState(params.amount ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(params.categoryId || null);
  const [note, setNote] = useState(params.note ?? '');
  const [frequency, setFrequency] = useState<RecurringFrequency>(
    (params.frequency as RecurringFrequency) ?? 'monthly'
  );
  const [startDate, setStartDate] = useState(
    params.startDate ?? new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(params.endDate ?? '');
  const [isActive, setIsActive] = useState(params.isActive !== '0');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEdit = !!params.id;

  useEffect(() => {
    setCategoryId(params.categoryId || null);
  }, [params.categoryId]);

  useEffect(() => {
    if (type !== (params.type as TransactionType)) {
      setCategoryId(null);
    }
  }, [type]);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

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
    if (!startDate) {
      setError('Podaj datę rozpoczęcia.');
      return;
    }
    if (endDate && endDate < startDate) {
      setError('Data zakończenia nie może być wcześniejsza niż rozpoczęcia.');
      return;
    }
    setLoading(true);
    try {
      if (isEdit && params.id) {
        await updateRecurringTransaction(params.id, {
          type,
          amount: amt,
          category_id: categoryId,
          note: note.trim() || null,
          frequency,
          start_date: startDate,
          end_date: endDate || null,
          is_active: isActive,
        });
      } else {
        await createRecurringTransaction({
          type,
          amount: amt,
          category_id: categoryId,
          note: note.trim() || null,
          frequency,
          start_date: startDate,
          end_date: endDate || null,
        });
      }
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się zapisać.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer withPadding={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.text.primary }}>
            {isEdit ? 'Edit recurring' : 'Add recurring'}
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
                Type
              </Text>
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <Button
                  variant={type === 'expense' ? 'primary' : 'secondary'}
                  onPress={() => setType('expense')}
                  style={{ flex: 1 }}
                >
                  Expense
                </Button>
                <Button
                  variant={type === 'income' ? 'primary' : 'secondary'}
                  onPress={() => setType('income')}
                  style={{ flex: 1 }}
                >
                  Income
                </Button>
              </View>
            </View>

            <Input
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              placeholder={`0.00 ${currency}`}
              keyboardType="decimal-pad"
            />

            {categories.length > 0 ? (
              <View style={{ marginTop: theme.spacing.md }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>
                  Category
                </Text>
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
              </View>
            ) : null}

            <Input
              label="Note (optional)"
              value={note}
              onChangeText={setNote}
              placeholder={t('recurring.placeholderNote')}
            />

            <View style={{ marginTop: theme.spacing.md }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>
                Frequency
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                {FREQUENCIES.map((f) => (
                  <Button
                    key={f}
                    variant={frequency === f ? 'primary' : 'secondary'}
                    onPress={() => setFrequency(f)}
                    style={{ paddingHorizontal: 12 }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Button>
                ))}
              </View>
            </View>

            <Input
              label="Start date"
              value={startDate}
              onChangeText={setStartDate}
              placeholder={t('recurring.placeholderDate')}
            />

            <Input
              label="End date (optional)"
              value={endDate}
              onChangeText={setEndDate}
              placeholder={t('recurring.placeholderDate')}
            />

            {isEdit ? (
              <View style={{ marginTop: theme.spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.text.secondary }}>
                  Active
                </Text>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                  thumbColor={isActive ? theme.colors.primary : theme.colors.text.tertiary}
                />
              </View>
            ) : null}

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
              {loading ? t('common.loading') : t('common.save')}
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
