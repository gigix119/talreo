/**
 * TransactionDetailSheet — detail modal with Edit / Delete actions.
 */
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { formatAmount } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { getTransactionTitle, formatTransactionNote } from '@/utils/transactionDisplay';
import type { Transaction } from '@/types/database';
import type { Currency } from '@/types/database';

interface TransactionDetailSheetProps {
  visible: boolean;
  transaction: Transaction | null;
  categoryName: string;
  currency: Currency;
  categorySpendingThisMonth?: number | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionDetailSheet({
  visible,
  transaction,
  categoryName,
  currency,
  categorySpendingThisMonth,
  onClose,
  onEdit,
  onDelete,
}: TransactionDetailSheetProps) {
  const { t } = useI18n();

  if (!transaction) return null;

  const amount = Number(transaction.amount);
  const isIncome = transaction.type === 'income';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.lg,
            paddingTop: theme.spacing.xl,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text.primary }}>
            {t('transactions.detailTitle')}
          </Text>
          <Button variant="ghost" onPress={onClose}>
            {t('common.close')}
          </Button>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.xl,
              padding: theme.spacing.xl,
              marginBottom: theme.spacing.lg,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: isIncome ? theme.colors.income : theme.colors.expense,
              }}
            >
              {isIncome ? '+' : '−'}{formatAmount(amount, currency)}
            </Text>
            <Text style={{ fontSize: 14, color: theme.colors.text.secondary, marginTop: 4 }}>
              {getTransactionTitle(transaction.note, categoryName)}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            <Row label={t('transactions.detailType')} value={isIncome ? t('transactions.filterTypeIncome') : t('transactions.filterTypeExpense')} />
            <Row label={t('transactions.detailCategory')} value={categoryName} />
            <Row label={t('transactions.detailDate')} value={formatDate(transaction.transaction_date)} />
            {categorySpendingThisMonth != null ? (
              <View style={{ marginTop: theme.spacing.md, padding: theme.spacing.md, backgroundColor: theme.colors.background, borderRadius: theme.radius.md }}>
                <Text style={{ fontSize: 13, color: theme.colors.text.secondary }}>{categoryName} {t('transactions.insightCategorySpending')}</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text.primary, marginTop: 4 }}>{formatAmount(categorySpendingThisMonth, currency)}</Text>
              </View>
            ) : null}
            {formatTransactionNote(transaction.note) ? (
              <Row label={t('transactions.detailNote')} value={getTransactionTitle(transaction.note, categoryName)} />
            ) : null}
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <Pressable
              onPress={onEdit}
              style={({ pressed }) => ({
                padding: theme.spacing.lg,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.lg,
                opacity: pressed ? 0.95 : 1,
              })}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.primary }}>
                {t('transactions.detailEdit')}
              </Text>
            </Pressable>
            <Pressable
              onPress={onDelete}
              style={({ pressed }) => ({
                padding: theme.spacing.lg,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.lg,
                opacity: pressed ? 0.95 : 1,
              })}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.expense }}>
                {t('transactions.detailDelete')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
      <Text style={{ fontSize: 14, color: theme.colors.text.secondary }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>{value}</Text>
    </View>
  );
}
