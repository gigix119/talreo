/**
 * Transactions tab — premium mobile-first fintech experience.
 * Sticky filters, summary bar, delete confirmation, success toast.
 */
import { useCallback, useState, useMemo } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { useTransactionsList } from '@/hooks/useTransactionsList';
import {
  TransactionsHeader,
  TransactionsSearch,
  TransactionsFilters,
  TransactionSummaryCard,
  TransactionList,
  TransactionDetailSheet,
  SelectionBar,
  EmptyTransactionsState,
  EmptySearchState,
} from '@/components/transactions';
import { Toast } from '@/components/ui/Toast';
import { theme } from '@/constants/theme';
import { useMultiSelectManager } from '@/hooks/useMultiSelectManager';
import type { Transaction } from '@/types/database';

export default function TransactionsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const multiSelect = useMultiSelectManager();

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
    totalExpensesThisWeek,
    totalExpensesLastMonth,
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
    setPendingDeleteId(selectedTx.id);
    setDeleteConfirmVisible(true);
  }, [selectedTx]);

  const handleDeleteConfirm = useCallback(async () => {
    const id = pendingDeleteId;
    if (!id) return;
    setDeleting(true);
    try {
      await deleteTransaction(id);
      setDetailVisible(false);
      setDeleteConfirmVisible(false);
      setPendingDeleteId(null);
      setSelectedTx(null);
      await refetch();
      setToast({ message: t('transactions.toastDeleted'), variant: 'success' });
    } catch (err) {
      if (__DEV__) console.error('[DeleteTransaction] Failed:', err);
      setToast({ message: t('transactions.toastDeleteFailed'), variant: 'error' });
    } finally {
      setDeleting(false);
    }
  }, [pendingDeleteId, deleteTransaction, refetch, t]);

  const handleDeleteCancel = useCallback(() => {
    if (!deleting) {
      setDeleteConfirmVisible(false);
      setPendingDeleteId(null);
    }
  }, [deleting]);

  const handleLongPress = useCallback(
    (tx: Transaction) => {
      if (!multiSelect.isSelectionMode) {
        multiSelect.enterSelectionMode(tx.id);
      }
    },
    [multiSelect]
  );

  const handleBulkDelete = useCallback(async () => {
    const ids = multiSelect.selectedIds;
    if (ids.length === 0) return;
    try {
      for (const id of ids) await deleteTransaction(id);
      multiSelect.exitSelectionMode();
      await refetch();
      setToast({ message: t('transactions.toastDeleted'), variant: 'success' });
    } catch {
      setToast({ message: t('transactions.toastDeleteFailed'), variant: 'error' });
    }
  }, [multiSelect.selectedIds, deleteTransaction, multiSelect.exitSelectionMode, refetch, t]);

  const selectedIdsSet = useMemo(() => new Set(multiSelect.selectedIds), [multiSelect.selectedIds]);

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
      {/* Sticky: header + search + filters — compact to maximize list viewport */}
      <View
        style={{
          flexShrink: 0,
          paddingTop: 8,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: 4,
          backgroundColor: theme.colors.background,
        }}
      >
        <TransactionsHeader />
        {multiSelect.isSelectionMode ? (
          <SelectionBar
            selectedCount={multiSelect.selectedCount}
            onDelete={handleBulkDelete}
            onChangeCategory={() => {}}
            onCancel={multiSelect.exitSelectionMode}
          />
        ) : null}
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

      {error ? (
        <View style={{ paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm }}>
          <Text style={{ color: theme.colors.error }}>{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', padding: theme.spacing.xl, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text.secondary }}>{t('common.loading')}</Text>
        </View>
      ) : transactions.length === 0 ? (
        <View style={{ flex: 1 }}>
          {search.trim() ? (
            <EmptySearchState onAddPress={() => router.push('/(modals)/add-transaction')} />
          ) : (
            <EmptyTransactionsState onAddPress={() => router.push('/(modals)/add-transaction')} />
          )}
        </View>
      ) : (
        <View style={{ flex: 1, minHeight: 0 }}>
          <TransactionList
            transactions={transactions}
            currency={currency}
            recurringNoteSet={recurringNoteSet}
            onTransactionPress={(tx) => {
              if (multiSelect.isSelectionMode) return;
              setSelectedTx(tx);
              setDetailVisible(true);
            }}
            isSelectionMode={multiSelect.isSelectionMode}
            selectedIds={selectedIdsSet}
            onToggleSelect={multiSelect.toggleSelect}
            onLongPress={handleLongPress}
            ListHeaderComponent={
              <TransactionSummaryCard
                income={summary.income}
                expense={summary.expense}
                currency={currency}
                periodLabel={t(periodLabel)}
              />
            }
          />
        </View>
      )}

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
        totalExpensesThisWeek={totalExpensesThisWeek}
        totalExpensesLastMonth={totalExpensesLastMonth}
        onClose={() => {
          setDetailVisible(false);
          setSelectedTx(null);
          setDeleteConfirmVisible(false);
          setPendingDeleteId(null);
        }}
        onEdit={() => handleEdit()}
        onDelete={handleDeletePress}
        deleteDisabled={deleting}
        deleteConfirmVisible={deleteConfirmVisible}
        onDeleteConfirm={handleDeleteConfirm}
        onDeleteCancel={handleDeleteCancel}
        deleteLoading={deleting}
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
