/**
 * TransactionSection — date group header. Smaller caps, muted, clear spacing.
 */
import { memo } from 'react';
import { View, Text } from 'react-native';
import { theme } from '@/constants/theme';

interface TransactionSectionProps {
  title: string;
  children: React.ReactNode;
}

export const TransactionSection = memo(function TransactionSection({
  title,
  children,
}: TransactionSectionProps) {
  return (
    <View style={{ marginTop: theme.spacing.lg }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: theme.colors.text.tertiary,
          marginBottom: theme.spacing.sm,
          marginHorizontal: theme.spacing.lg,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
});
