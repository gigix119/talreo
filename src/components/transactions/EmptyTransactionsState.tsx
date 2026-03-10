/**
 * EmptyTransactionsState — polished empty state with CTA.
 */
import { View, Text, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';

interface EmptyTransactionsStateProps {
  onAddPress: () => void;
}

export function EmptyTransactionsState({ onAddPress }: EmptyTransactionsStateProps) {
  const { t } = useI18n();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.xxl,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: theme.colors.background,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.xl,
        }}
      >
        <Text style={{ fontSize: 40 }}>📋</Text>
      </View>
      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: theme.colors.text.primary,
          textAlign: 'center',
        }}
      >
        {t('transactions.emptyTitle')}
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          marginTop: theme.spacing.sm,
          lineHeight: 24,
        }}
      >
        {t('transactions.emptyDesc')}
      </Text>
      <Pressable
        onPress={onAddPress}
        style={({ pressed }) => ({
          marginTop: theme.spacing.xl,
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.md,
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.lg,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
          {t('transactions.addTransaction')}
        </Text>
      </Pressable>
    </View>
  );
}
