/**
 * WelcomeHero — hero section with headline, subheadline, CTAs, and visual preview placeholder.
 */
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

export function WelcomeHero() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xxl,
        paddingBottom: theme.spacing.xxl,
      }}
    >
      <Text
        style={{
          fontSize: 34,
          fontWeight: '700',
          color: theme.colors.text.primary,
          lineHeight: 42,
          letterSpacing: -0.8,
        }}
      >
        {t('welcome.heroHeadline')}
      </Text>
      <Text
        style={{
          fontSize: 17,
          color: theme.colors.text.secondary,
          lineHeight: 26,
          marginTop: theme.spacing.md,
          maxWidth: 400,
        }}
      >
        {t('welcome.heroSubheadline')}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
          marginTop: theme.spacing.xl,
        }}
      >
        <Button variant="primary" onPress={() => router.push('/(auth)/sign-up')}>
          {t('auth.getStarted')}
        </Button>
        <Button variant="secondary" onPress={() => router.push('/(auth)/sign-in')}>
          {t('auth.signIn')}
        </Button>
      </View>
      {/* Visual preview placeholder — polished card for future app screenshots */}
      <View
        style={{
          marginTop: theme.spacing.xxl,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          height: 240,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: theme.colors.border,
          ...theme.shadows.md,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.text.tertiary,
            letterSpacing: 0.5,
          }}
        >
          {t('welcome.appPreviewComingSoon')}
        </Text>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.background,
            marginTop: theme.spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 32 }}>📱</Text>
        </View>
      </View>
    </View>
  );
}
