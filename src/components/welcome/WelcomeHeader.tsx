/**
 * WelcomeHeader — top navigation with logo, language selector, auth actions.
 * Logo left; language flags + Sign In + Get Started right.
 */
import { View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

const FLAG_PL = 'https://flagcdn.com/w40/pl.png';
const FLAG_GB = 'https://flagcdn.com/w40/gb.png';

export function WelcomeHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: insets.top + theme.spacing.md,
        paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: theme.colors.text.primary,
          letterSpacing: -0.5,
        }}
      >
        Talreo
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Pressable
            onPress={() => setLocale('pl')}
            style={{
              padding: 4,
              borderRadius: 4,
              opacity: locale === 'pl' ? 1 : 0.5,
              borderWidth: locale === 'pl' ? 2 : 0,
              borderColor: theme.colors.primary,
            }}
            accessibilityLabel="Polski"
          >
            <Image source={{ uri: FLAG_PL }} style={{ width: 28, height: 20 }} resizeMode="cover" />
          </Pressable>
          <Pressable
            onPress={() => setLocale('en')}
            style={{
              padding: 4,
              borderRadius: 4,
              opacity: locale === 'en' ? 1 : 0.5,
              borderWidth: locale === 'en' ? 2 : 0,
              borderColor: theme.colors.primary,
            }}
            accessibilityLabel="English"
          >
            <Image source={{ uri: FLAG_GB }} style={{ width: 28, height: 20 }} resizeMode="cover" />
          </Pressable>
        </View>
        <Button
          variant="ghost"
          style={{ paddingHorizontal: 16 }}
          onPress={() => router.push('/(auth)/sign-in')}
        >
          {t('auth.signIn')}
        </Button>
        <Button
          variant="primary"
          style={{ paddingHorizontal: 20 }}
          onPress={() => router.push('/(auth)/sign-up')}
        >
          {t('auth.getStarted')}
        </Button>
      </View>
    </View>
  );
}
