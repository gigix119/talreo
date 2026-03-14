/**
 * Add transaction modal — quick add parser, smart category, type, amount, category, date, note.
 */
import { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { theme } from '@/constants/theme';
import { suggestCategory } from '@/utils/categorySuggestion';
import { parseQuickAdd } from '@/utils/transactionParser';
import { useI18n } from '@/i18n';
import type { TransactionType } from '@/types/database';
import type { Category } from '@/types/database';

function findCategoryByName(categories: Category[], name: string): Category | undefined {
  const n = name.toLowerCase().trim();
  return categories.find((c) => c.name.toLowerCase() === n || c.name.toLowerCase().includes(n));
}

export default function AddTransactionScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { profile } = useProfile();
  const currency = profile?.currency ?? 'PLN';
  const [type, setType] = useState<TransactionType>('expense');
  const expenseCategories = useCategories('expense');
  const incomeCategories = useCategories('income');
  const categories = type === 'expense' ? expenseCategories.categories : incomeCategories.categories;
  const { createTransaction } = useTransactions();

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [quickAdd, setQuickAdd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const applySmartCategory = useCallback(
    (noteText: string) => {
      const suggestion = suggestCategory(noteText);
      if (suggestion && suggestion.type === type) {
        const cat = findCategoryByName(categories, suggestion.categoryName);
        if (cat) setCategoryId(cat.id);
      }
    },
    [type, categories]
  );

  const handleQuickAddSubmit = useCallback(() => {
    const parsed = parseQuickAdd(quickAdd);
    if (parsed) {
      setAmount(String(parsed.amount));
      setNote(parsed.note);
      setType(parsed.type);
      if (parsed.categoryName) {
        const allCats = [...expenseCategories.categories, ...incomeCategories.categories];
        const cat = findCategoryByName(allCats, parsed.categoryName);
        if (cat) setCategoryId(cat.id);
      }
      setQuickAdd('');
    }
  }, [quickAdd, expenseCategories.categories, incomeCategories.categories]);

  useEffect(() => {
    setCategoryId((prev) => (categories.some((c) => c.id === prev) ? prev : categories[0]?.id ?? null));
  }, [type, categories]);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleNoteChange = useCallback(
    (text: string) => {
      setNote(text);
      applySmartCategory(text);
    },
    [applySmartCategory]
  );

  async function handleSave() {
    setError('');
    const amt = parseFloat(amount.replace(',', '.'));
    if (isNaN(amt) || amt <= 0) {
      setError(t('validation.invalidAmount'));
      return;
    }
    if (categories.length > 0 && !categoryId) {
      setError(t('validation.selectCategory'));
      return;
    }
    setLoading(true);
    try {
      await createTransaction({
        type,
        amount: amt,
        category_id: categoryId,
        note: note.trim() || null,
        transaction_date: date,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.saveFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer withPadding={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.text.primary }}>
            {t('transactions.addTransaction')}
          </Text>
          <Text onPress={() => router.back()} style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '500' }}>
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
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
              <Input
                label={t('transactions.quickAddLabel')}
                value={quickAdd}
                onChangeText={setQuickAdd}
                placeholder={t('transactions.quickAddPlaceholder')}
                onSubmitEditing={handleQuickAddSubmit}
                returnKeyType="done"
                style={{ flex: 1, marginBottom: 0 }}
              />
              <Button variant="secondary" onPress={handleQuickAddSubmit} style={{ marginBottom: theme.spacing.md }}>
                ✓
              </Button>
            </View>
            <View style={{ marginTop: theme.spacing.lg }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>
                {t('transactions.labelType')}
              </Text>
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <Button
                  variant={type === 'expense' ? 'primary' : 'secondary'}
                  onPress={() => setType('expense')}
                  style={{ flex: 1 }}
                >
                  {t('transactions.filterTypeExpense')}
                </Button>
                <Button
                  variant={type === 'income' ? 'primary' : 'secondary'}
                  onPress={() => setType('income')}
                  style={{ flex: 1 }}
                >
                  {t('transactions.filterTypeIncome')}
                </Button>
              </View>
            </View>

            <Input
              label={t('transactions.labelAmount')}
              value={amount}
              onChangeText={setAmount}
              placeholder={`0.00 ${currency}`}
              keyboardType="decimal-pad"
            />

            {categories.length > 0 ? (
              <View style={{ marginTop: theme.spacing.md }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>
                  {t('transactions.labelCategory')}
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
            ) : (
              <Text style={{ fontSize: 14, color: theme.colors.warning, marginTop: theme.spacing.md }}>
                {t('transactions.noCategoriesFallback')}
              </Text>
            )}

            <Input
              label={t('transactions.labelDate')}
              value={date}
              onChangeText={setDate}
              placeholder={t('goals.placeholderDate')}
            />

            <Input
              label={t('transactions.labelNote')}
              value={note}
              onChangeText={handleNoteChange}
              placeholder={t('transactions.quickAddPlaceholder')}
            />

            {error ? (
              <Text style={{ fontSize: 12, color: theme.colors.error, marginTop: theme.spacing.sm }}>
                {error}
              </Text>
            ) : null}

            <Button
              onPress={handleSave}
              disabled={loading}
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
