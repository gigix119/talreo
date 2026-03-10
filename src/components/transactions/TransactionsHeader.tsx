/**
 * TransactionsHeader — title and subtitle.
 */
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';

export function TransactionsHeader() {
  const { t } = useI18n();

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.text.primary, letterSpacing: -0.5 }}>
        {t('transactions.title')}
      </Text>
      <Text style={{ fontSize: 15, color: theme.colors.text.secondary, marginTop: 4 }}>
        {t('transactions.subtitle')}
      </Text>
    </View>
  );
}
