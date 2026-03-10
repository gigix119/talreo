/**
 * TransactionDetailSheet — premium detail modal with modular components.
 */
import { View, Text, Modal, ScrollView } from 'react-native';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { TransactionDetailHeader } from './TransactionDetailHeader';
import { TransactionMetadata } from './TransactionMetadata';
import { TransactionInsightCard } from './TransactionInsightCard';
import { TransactionActionButtons } from './TransactionActionButtons';
import type { Transaction } from '@/types/database';
import type { Currency } from '@/types/database';

interface TransactionDetailSheetProps {
  visible: boolean;
  transaction: Transaction | null;
  categoryName: string;
  currency: Currency;
  categorySpendingThisMonth?: number | null;
  totalExpensesThisMonth?: number;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleteDisabled?: boolean;
}

export function TransactionDetailSheet({
  visible,
  transaction,
  categoryName,
  currency,
  categorySpendingThisMonth,
  totalExpensesThisMonth = 0,
  onClose,
  onEdit,
  onDelete,
  deleteDisabled = false,
}: TransactionDetailSheetProps) {
  const { t } = useI18n();

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
            padding: theme.spacing.lg,
            paddingTop: theme.spacing.xl,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text.primary }}>
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
            paddingBottom: theme.spacing.xxl,
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
            />
          ) : null}

          <TransactionActionButtons
            onEdit={onEdit}
            onDelete={onDelete}
            deleteDisabled={deleteDisabled}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}
