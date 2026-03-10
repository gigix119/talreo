/**
 * WelcomeCTA — final call-to-action section.
 */
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

export function WelcomeCTA() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <View
      style={{
        marginHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xxl,
        paddingVertical: theme.spacing.xxl,
        paddingHorizontal: theme.spacing.xl,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: theme.colors.text.primary,
          textAlign: 'center',
          lineHeight: 30,
        }}
      >
        {t('welcome.ctaHeadline')}
      </Text>
      <Button
        variant="primary"
        fullWidth
        style={{ marginTop: theme.spacing.xl }}
        onPress={() => router.push('/(auth)/sign-up')}
      >
        {t('welcome.createAccount')}
      </Button>
      <Pressable
        onPress={() => router.push('/(auth)/sign-in')}
        style={{ marginTop: theme.spacing.md }}
      >
        <Text
          style={{
            fontSize: 15,
            color: theme.colors.text.secondary,
            textDecorationLine: 'underline',
          }}
        >
          {t('welcome.alreadyHaveAccount')}
        </Text>
      </Pressable>
    </View>
  );
}
