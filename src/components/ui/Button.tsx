/**
 * Button — primary reusable button.
 * Variants: primary, secondary, ghost.
 */
import { Pressable, Text, type PressableProps } from 'react-native';
import { theme } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const base = {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: theme.radius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.5 : 1,
  };

  const variants = {
    primary: {
      backgroundColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  const textColor = {
    primary: '#FFFFFF',
    secondary: theme.colors.text.primary,
    ghost: theme.colors.primary,
  };

  return (
    <Pressable
      style={({ pressed }) => [
        base,
        variants[variant],
        pressed && { opacity: 0.8 },
        Array.isArray(style) ? style : style,
      ]}
      disabled={disabled}
      {...props}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: textColor[variant],
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
