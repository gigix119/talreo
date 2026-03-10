/**
 * Transactions tab — premium mobile-first fintech experience.
 * Sticky filters, summary bar, delete confirmation, success toast.
 */
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { useTransactionsList } from '@/hooks/useTransactionsList';
import {
  TransactionsHeader,
  TransactionsSearch,
  TransactionsFilters,
  TransactionSummaryCard,
  TransactionList,
  TransactionDetailSheet,
  DeleteTransactionDialog,
  EmptyTransactionsState,
  EmptySearchState,
} from '@/components/transactions';
import { Toast } from '@/components/ui/Toast';
import { theme } from '@/constants/theme';
import type { Transaction } from '@/types/database';

export default function TransactionsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const {
    transactions,
    loading,
    error,
    refetch,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    dateFilter,
    setDateFilter,
    categoryId,
    setCategoryId,
    categories,
    currency,
    summary,
    periodLabel,
    recurringNoteSet,
    categoryTotalsThisMonth,
    totalExpensesThisMonth,
    deleteTransaction,
  } = useTransactionsList();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const categoryName = selectedTx
    ? categories.find((c) => c.id === selectedTx.category_id)?.name ?? '—'
    : '—';

  const handleDeletePress = useCallback(() => {
    if (!selectedTx) return;
    setDeleteConfirmVisible(true);
  }, [selectedTx]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedTx) return;
    setDeleting(true);
    try {
      await deleteTransaction(selectedTx.id);
      setDetailVisible(false);
      setDeleteConfirmVisible(false);
      setSelectedTx(null);
      await refetch();
      setToast({ message: t('transactions.toastDeleted'), variant: 'success' });
    } catch {
      setToast({ message: t('transactions.toastDeleteFailed'), variant: 'error' });
    } finally {
      setDeleting(false);
    }
  }, [selectedTx, deleteTransaction, refetch, t]);

  const handleDeleteCancel = useCallback(() => {
    if (!deleting) setDeleteConfirmVisible(false);
  }, [deleting]);

  const handleEdit = useCallback(
    (tx?: Transaction) => {
      const target = tx ?? selectedTx;
      if (!target) return;
      setDetailVisible(false);
      router.push(`/(modals)/edit-transaction?id=${target.id}`);
      setSelectedTx(null);
    },
    [selectedTx, router]
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Sticky: header + search + filters */}
      <View
        style={{
          paddingTop: 48,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
          backgroundColor: theme.colors.background,
        }}
      >
        <TransactionsHeader />
        <TransactionsSearch value={search} onChangeText={setSearch} />
        <TransactionsFilters
          typeFilter={typeFilter}
          dateFilter={dateFilter}
          categoryId={categoryId}
          categories={categories}
          onTypeChange={setTypeFilter}
          onDateChange={setDateFilter}
          onCategoryChange={setCategoryId}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <Text style={{ color: theme.colors.error, marginBottom: theme.spacing.md }}>{error}</Text>
        ) : null}

        {loading ? (
          <View style={{ padding: theme.spacing.xl, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.text.secondary }}>Loading...</Text>
          </View>
        ) : transactions.length === 0 ? (
          search.trim() ? (
            <EmptySearchState onAddPress={() => router.push('/(modals)/add-transaction')} />
          ) : (
            <EmptyTransactionsState onAddPress={() => router.push('/(modals)/add-transaction')} />
          )
        ) : (
          <>
            <TransactionSummaryCard
              income={summary.income}
              expense={summary.expense}
              currency={currency}
              periodLabel={t(periodLabel)}
            />
            <TransactionList
              transactions={transactions}
              currency={currency}
              recurringNoteSet={recurringNoteSet}
              onTransactionPress={(tx) => {
                setSelectedTx(tx);
                setDetailVisible(true);
              }}
            />
          </>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/(modals)/add-transaction')}
        style={({ pressed }) => ({
          position: 'absolute',
          bottom: 24,
          right: theme.spacing.lg,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Text style={{ fontSize: 28, color: '#FFFFFF', fontWeight: '300' }}>+</Text>
      </Pressable>

      <TransactionDetailSheet
        visible={detailVisible}
        transaction={selectedTx}
        categoryName={categoryName}
        currency={currency}
        categorySpendingThisMonth={selectedTx ? (categoryTotalsThisMonth.get(selectedTx.category_id ?? '') ?? null) : null}
        totalExpensesThisMonth={totalExpensesThisMonth}
        onClose={() => {
          setDetailVisible(false);
          setSelectedTx(null);
          setDeleteConfirmVisible(false);
        }}
        onEdit={() => handleEdit()}
        onDelete={handleDeletePress}
        deleteDisabled={deleting}
      />

      <DeleteTransactionDialog
        visible={deleteConfirmVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />

      {toast ? (
        <Toast
          message={toast.message}
          variant={toast.variant}
          visible={!!toast}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </View>
  );
}
