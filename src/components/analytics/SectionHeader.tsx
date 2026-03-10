/**
 * Section header — premium hierarchy for analytics narrative.
 */
import { View, Text } from 'react-native';
import { theme } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.text.tertiary,
          letterSpacing: 0.8,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: 2 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
