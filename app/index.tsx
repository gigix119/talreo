/**
 * Root route — auth-based content.
 * Not authenticated → welcome (at talreo.com/).
 * Authenticated + onboarding_completed → (tabs).
 * Authenticated + !onboarding_completed → onboarding.
 */
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { theme } from '@/constants/theme';
import {
  WelcomeHeader,
  WelcomeHero,
  WelcomeFeatures,
  WelcomePreview,
  WelcomeUseCases,
  WelcomeCTA,
} from '@/components/welcome';

export default function Index() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    if (authLoading) return;
    if (!session) return; // render welcome below
    if (profileLoading) return;
    if (profile?.onboarding_completed) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  }, [session, authLoading, profile?.onboarding_completed, profileLoading]);

  // Not authenticated — show welcome at talreo.com/
  if (!authLoading && !session) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <WelcomeHeader />
        <WelcomeHero />
        <WelcomeFeatures />
        <WelcomePreview />
        <WelcomeUseCases />
        <WelcomeCTA />
      </ScrollView>
    );
  }

  // Loading or redirecting
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{ marginTop: 16, color: theme.colors.text.secondary }}>Ładowanie...</Text>
    </View>
  );
}
