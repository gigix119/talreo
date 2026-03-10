/**
 * Card — base container for content blocks.
 * Clean, rounded, with optional shadow.
 */
import { View, type ViewProps } from 'react-native';
import { theme } from '@/constants/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: keyof typeof theme.spacing;
  /** Add subtle shadow */
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
          borderRadius: theme.radius.lg,
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
