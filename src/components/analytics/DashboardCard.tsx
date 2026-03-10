/**
 * Dashboard card — fintech-grade, large rounded, soft shadow.
 */
import { View, type ViewProps } from 'react-native';
import { theme } from '@/constants/theme';
import { analyticsShadows } from '@/constants/analyticsTheme';

interface DashboardCardProps extends ViewProps {
  children: React.ReactNode;
  padding?: keyof typeof theme.spacing;
}

export function DashboardCard({ children, padding = 'lg', style, ...props }: DashboardCardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          padding: theme.spacing[padding],
          ...analyticsShadows.card,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
