/**
 * Edit transaction modal — pre-filled form, smart category, update on save.
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { transactionsService } from '@/services/transactions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { theme } from '@/constants/theme';
import { suggestCategory } from '@/utils/categorySuggestion';
import { useI18n } from '@/i18n';
import type { Transaction } from '@/types/database';
import type { Category } from '@/types/database';

function findCategoryByName(categories: Category[], name: string): Category | undefined {
  const n = name.toLowerCase().trim();
  return categories.find((c) => c.name.toLowerCase() === n || c.name.toLowerCase().includes(n));
}

export default function EditTransactionScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { profile } = useProfile();
  const currency = profile?.currency ?? 'PLN';

  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const expenseCategories = useCategories('expense');
  const incomeCategories = useCategories('income');
  const categories = type === 'expense' ? expenseCategories.categories : incomeCategories.categories;

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id || !id) return;
    (async () => {
      try {
        const found = await transactionsService.getTransactionById(user.id, id);
        if (found) {
          setTx(found);
          setType(found.type as 'expense' | 'income');
          setAmount(String(found.amount));
          setCategoryId(found.category_id);
          setNote(found.note ?? '');
          setDate(found.transaction_date ?? '');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, id]);

  useEffect(() => {
    setCategoryId((prev) => (categories.some((c) => c.id === prev) ? prev : categories[0]?.id ?? null));
  }, [type, categories]);

  const handleNoteChange = useCallback(
    (text: string) => {
      setNote(text);
      const suggestion = suggestCategory(text);
      if (suggestion && suggestion.type === type) {
        const cat = findCategoryByName(categories, suggestion.categoryName);
        if (cat) setCategoryId(cat.id);
      }
    },
    [type, categories]
  );

  async function handleSave() {
    if (!user?.id || !id) return;
    setError('');
    const amt = parseFloat(amount.replace(',', '.'));
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setSaving(true);
    try {
      await transactionsService.updateTransaction(user.id, id, {
        type,
        amount: amt,
        category_id: categoryId,
        note: note.trim() || null,
        transaction_date: date,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !tx) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text.secondary }}>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer withPadding={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.text.primary }}>
            Edit transaction
          </Text>
          <Text onPress={() => router.back()} style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '500' }}>
            Cancel
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

            <Input label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

            <Input
              label="Note (optional)"
              value={note}
              onChangeText={handleNoteChange}
              placeholder="e.g. Groceries"
            />

            {error ? (
              <Text style={{ fontSize: 12, color: theme.colors.error, marginTop: theme.spacing.sm }}>
                {error}
              </Text>
            ) : null}

            <Button onPress={handleSave} disabled={saving} fullWidth style={{ marginTop: theme.spacing.xl }}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
