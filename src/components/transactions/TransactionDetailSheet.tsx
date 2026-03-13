/**
 * TransactionDetailSheet — clean detail modal with safe area handling.
 */
import { View, Text, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { TransactionDetailHeader } from './TransactionDetailHeader';
import { TransactionMetadata } from './TransactionMetadata';
import { TransactionInsightCard } from './TransactionInsightCard';
import { TransactionActionButtons } from './TransactionActionButtons';
import { DeleteTransactionDialog } from './DeleteTransactionDialog';
import type { Transaction } from '@/types/database';
import type { Currency } from '@/types/database';

interface TransactionDetailSheetProps {
  visible: boolean;
  transaction: Transaction | null;
  categoryName: string;
  currency: Currency;
  categorySpendingThisMonth?: number | null;
  totalExpensesThisMonth?: number;
  totalExpensesThisWeek?: number;
  totalExpensesLastMonth?: number;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleteDisabled?: boolean;
  deleteConfirmVisible?: boolean;
  onDeleteConfirm?: () => void;
  onDeleteCancel?: () => void;
  deleteLoading?: boolean;
}

export function TransactionDetailSheet({
  visible,
  transaction,
  categoryName,
  currency,
  categorySpendingThisMonth,
  totalExpensesThisMonth = 0,
  totalExpensesThisWeek = 0,
  totalExpensesLastMonth = 0,
  onClose,
  onEdit,
  onDelete,
  deleteDisabled = false,
  deleteConfirmVisible = false,
  onDeleteConfirm,
  onDeleteCancel,
  deleteLoading = false,
}: TransactionDetailSheetProps) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  if (!transaction) return null;

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
            paddingHorizontal: theme.spacing.lg,
            paddingTop: insets.top + theme.spacing.md,
            paddingBottom: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.text.primary }}>
            {t('transactions.detailTitle')}
          </Text>
          <Button variant="ghost" onPress={onClose}>
            {t('common.close')}
          </Button>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          <TransactionDetailHeader
            transaction={transaction}
            categoryName={categoryName}
            currency={currency}
          />

          <TransactionMetadata transaction={transaction} categoryName={categoryName} />

          {categorySpendingThisMonth != null && categorySpendingThisMonth >= 0 ? (
            <TransactionInsightCard
              categoryName={categoryName}
              amount={categorySpendingThisMonth}
              currency={currency}
              isExpense={transaction.type === 'expense'}
              totalExpensesThisMonth={totalExpensesThisMonth}
              totalExpensesThisWeek={totalExpensesThisWeek}
              totalExpensesLastMonth={totalExpensesLastMonth}
            />
          ) : null}

          <TransactionActionButtons
            onEdit={onEdit}
            onDelete={onDelete}
            deleteDisabled={deleteDisabled}
          />
        </ScrollView>

        {onDeleteConfirm && onDeleteCancel ? (
          <DeleteTransactionDialog
            visible={deleteConfirmVisible}
            onCancel={onDeleteCancel}
            onConfirm={onDeleteConfirm}
            loading={deleteLoading}
          />
        ) : null}
      </View>
    </Modal>
  );
}
