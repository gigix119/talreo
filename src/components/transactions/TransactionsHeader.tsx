/**
 * TransactionsHeader — title and subtitle.
 */
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';

export function TransactionsHeader() {
  const { t } = useI18n();

  return (
    <View style={{ marginBottom: theme.spacing.xs, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text
        style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary, letterSpacing: -0.3 }}
        numberOfLines={1}
      >
        {t('transactions.title')}
      </Text>
    </View>
  );
}
