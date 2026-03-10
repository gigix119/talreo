/**
 * Add transaction modal — type, amount, category, date, note.
 */
import { useState, useEffect } from 'react';
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
import type { TransactionType } from '@/types/database';

export default function AddTransactionScreen() {
  const router = useRouter();
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCategoryId(null);
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
      setError('Please enter a valid amount.');
      return;
    }
    if (categories.length > 0 && !categoryId) {
      setError('Please select a category.');
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
      setError(e instanceof Error ? e.message : 'Could not save transaction.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer withPadding={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.text.primary }}>
            Add transaction
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
            ) : (
              <Text style={{ fontSize: 14, color: theme.colors.warning, marginTop: theme.spacing.md }}>
                No {type} categories. Using default categories.
              </Text>
            )}

            <Input
              label="Date"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />

            <Input
              label="Note (optional)"
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Groceries"
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
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
