/**
 * EmptyState — consistent empty state with title, description, CTA.
 */
import { View, Text } from 'react-native';
import { Button } from './Button';
import { Card } from './Card';
import { theme } from '@/constants/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
  variant?: 'card' | 'compact';
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  variant = 'card',
}: EmptyStateProps) {
  const content = (
    <>
      <Text style={{ fontSize: 16, color: theme.colors.text.secondary, textAlign: 'center' }}>
        {title}
      </Text>
      {description ? (
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.text.tertiary,
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          {description}
        </Text>
      ) : null}
      <Button
        variant={variant === 'card' ? 'primary' : 'secondary'}
        onPress={onAction}
        style={{ marginTop: theme.spacing.lg }}
      >
        {actionLabel}
      </Button>
    </>
  );

  if (variant === 'card') {
    return (
      <Card padding="xl" elevated style={{ alignItems: 'center' }}>
        {content}
      </Card>
    );
  }
  return (
    <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
      {content}
    </View>
  );
}
