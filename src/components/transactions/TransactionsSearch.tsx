/**
 * TransactionsSearch — mobile-friendly search bar.
 */
import { View, TextInput } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';

interface TransactionsSearchProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function TransactionsSearch({ value, onChangeText }: TransactionsSearchProps) {
  const { t } = useI18n();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={t('transactions.searchPlaceholder')}
        placeholderTextColor={theme.colors.text.tertiary}
        style={{ fontSize: 15, color: theme.colors.text.primary, padding: 0 }}
      />
    </View>
  );
}
