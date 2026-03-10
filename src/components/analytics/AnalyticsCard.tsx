/**
 * AnalyticsCard — premium fintech card with soft shadow, rounded corners, touch-friendly padding.
 */
import { View, Pressable, type ViewProps } from 'react-native';
import { theme } from '@/constants/theme';
import { analyticsShadows, analyticsRadius } from '@/constants/analyticsTheme';

interface AnalyticsCardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  padding?: keyof typeof theme.spacing;
}

export function AnalyticsCard({
  children,
  onPress,
  padding = 'lg',
  style,
  ...props
}: AnalyticsCardProps) {
  const cardStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: analyticsRadius.card,
    padding: theme.spacing[padding],
    ...analyticsShadows.card,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && { ...analyticsShadows.cardHover, opacity: 0.98 },
          style as object,
        ]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]} {...props}>{children}</View>;
}
