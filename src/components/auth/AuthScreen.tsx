/**
 * AuthScreen — shared layout for auth screens (sign-in, sign-up, forgot-password).
 * Premium fintech styling, clean and minimal.
 */
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/layout/ScreenContainer';

interface AuthScreenProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onPress: () => void;
    loading?: boolean;
    loadingLabel?: string;
  };
  secondaryLink?: { label: string; href: string };
  footerText?: string;
  footerLink?: { label: string; href: string };
}

export function AuthScreen({
  title,
  subtitle,
  children,
  primaryAction,
  secondaryLink,
  footerText,
  footerLink,
}: AuthScreenProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.xl }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: theme.colors.text.primary,
            letterSpacing: -0.5,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.text.secondary,
              marginTop: theme.spacing.sm,
              lineHeight: 24,
            }}
          >
            {subtitle}
          </Text>
        ) : null}

        <View style={{ marginTop: theme.spacing.xl }}>{children}</View>

        {primaryAction ? (
          <Button
            onPress={primaryAction.onPress}
            disabled={primaryAction.loading}
            fullWidth
            style={{ marginTop: theme.spacing.lg }}
          >
            {primaryAction.loading ? (primaryAction.loadingLabel ?? t('common.pleaseWait')) : primaryAction.label}
          </Button>
        ) : null}

        {secondaryLink ? (
          <Button
            variant="ghost"
            onPress={() => router.push(secondaryLink.href as never)}
            style={{ marginTop: theme.spacing.md, alignSelf: 'center' }}
          >
            {secondaryLink.label}
          </Button>
        ) : null}

        {footerText && footerLink ? (
          <View style={{ flex: 1, justifyContent: 'flex-end', marginTop: theme.spacing.xl }}>
            <Text
              style={{ fontSize: 14, color: theme.colors.text.secondary, textAlign: 'center' }}
            >
              {footerText}{' '}
              <Text
                onPress={() => router.push(footerLink.href as never)}
                style={{ color: theme.colors.primary, fontWeight: '600' }}
              >
                {footerLink.label}
              </Text>
            </Text>
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
}
