/**
 * EmptySearchState — shown when search returns no results.
 */
import { View, Text, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';

interface EmptySearchStateProps {
  onAddPress: () => void;
}

export function EmptySearchState({ onAddPress }: EmptySearchStateProps) {
  const { t } = useI18n();

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.xxl,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.text.primary,
          textAlign: 'center',
        }}
      >
        {t('transactions.emptySearchTitle')}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          marginTop: theme.spacing.sm,
        }}
      >
        {t('transactions.emptySearchDesc')}
      </Text>
      <Pressable
        onPress={onAddPress}
        style={({ pressed }) => ({
          marginTop: theme.spacing.lg,
          paddingHorizontal: theme.spacing.lg,
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
