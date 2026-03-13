/**
 * Card — base container for content blocks.
 * Consistent radius, padding, and shadow across dashboard, budgets, analytics, goals.
 */
import { View, type ViewProps } from 'react-native';
import { theme } from '@/constants/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  /** Padding size from theme.spacing */
  padding?: keyof typeof theme.spacing;
  /** Add subtle elevation (default: true) */
  elevated?: boolean;
}

export function Card({
  children,
  padding = 'md',
  elevated = true,
  style,
  ...props
}: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.md,
          padding: theme.spacing[padding],
          ...(elevated ? theme.shadows.sm : {}),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
