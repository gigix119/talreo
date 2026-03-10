/**
 * TransactionMetadata — type, category, date, note (only if present).
 */
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { formatDate } from '@/utils/date';
import { getTransactionTitle, formatTransactionNote } from '@/utils/transactionDisplay';
import type { Transaction } from '@/types/database';

interface TransactionMetadataProps {
  transaction: Transaction;
  categoryName: string;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Text style={{ fontSize: 14, color: theme.colors.text.secondary }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>{value}</Text>
    </View>
  );
}

export function TransactionMetadata({ transaction, categoryName }: TransactionMetadataProps) {
  const { t } = useI18n();
  const isIncome = transaction.type === 'income';
  const noteDisplay = formatTransactionNote(transaction.note);

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
      }}
    >
      <Row
        label={t('transactions.detailType')}
        value={isIncome ? t('transactions.filterTypeIncome') : t('transactions.filterTypeExpense')}
      />
      <Row label={t('transactions.detailCategory')} value={categoryName} />
      <Row label={t('transactions.detailDate')} value={formatDate(transaction.transaction_date)} />
      {noteDisplay ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: theme.spacing.md,
          }}
        >
          <Text style={{ fontSize: 14, color: theme.colors.text.secondary }}>{t('transactions.detailNote')}</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }} numberOfLines={2}>
            {getTransactionTitle(transaction.note, categoryName)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
