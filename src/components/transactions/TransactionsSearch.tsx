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
        borderRadius: theme.radius.lg,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm + 4,
        marginBottom: theme.spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={t('transactions.searchPlaceholder')}
        placeholderTextColor={theme.colors.text.tertiary}
        style={{
          fontSize: 16,
          color: theme.colors.text.primary,
          padding: 0,
        }}
      />
    </View>
  );
}
