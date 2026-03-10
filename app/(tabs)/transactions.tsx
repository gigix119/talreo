/**
 * Transactions tab — premium mobile-first fintech experience.
 * Sticky filters, summary bar, swipe actions.
 */
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useI18n } from '@/i18n';
import { useTransactionsList } from '@/hooks/useTransactionsList';
import {
  TransactionsHeader,
  TransactionsSearch,
  TransactionsFilters,
  TransactionSummaryCard,
  TransactionList,
  TransactionDetailSheet,
  EmptyTransactionsState,
} from '@/components/transactions';
import { theme } from '@/constants/theme';
import type { Transaction } from '@/types/database';

export default function TransactionsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

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

  const confirmDelete = useCallback(
    (tx: Transaction) => {
      Alert.alert(
        t('common.deleteTransaction'),
        t('common.confirmDelete'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: async () => {
              await deleteTransaction(tx.id);
              setDetailVisible(false);
              setSelectedTx(null);
            },
          },
        ]
      );
    },
    [deleteTransaction, t]
  );

  const handleDelete = useCallback(() => {
    if (!selectedTx) return;
    confirmDelete(selectedTx);
  }, [selectedTx, confirmDelete]);

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
          <EmptyTransactionsState onAddPress={() => router.push('/(modals)/add-transaction')} />
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
        onClose={() => {
          setDetailVisible(false);
          setSelectedTx(null);
        }}
        onEdit={() => handleEdit()}
        onDelete={handleDelete}
      />
    </View>
  );
}
