/**
 * Input — text input with consistent styling.
 * Placeholder for form screens (add-transaction, etc.).
 */
import { TextInput, View, Text, type TextInputProps } from 'react-native';
import { theme } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  style,
  ...props
}: InputProps) {
  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      {label ? (
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.sm,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[
          {
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: error ? theme.colors.error : theme.colors.border,
            borderRadius: theme.radius.md,
            paddingVertical: 14,
            paddingHorizontal: 16,
            fontSize: 16,
            color: theme.colors.text.primary,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.text.tertiary}
        {...props}
      />
      {error ? (
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.error,
            marginTop: theme.spacing.xs,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
