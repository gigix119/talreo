/**
 * Root route — auth-based redirect.
 * Not authenticated → welcome.
 * Authenticated + onboarding_completed → (tabs).
 * Authenticated + !onboarding_completed → onboarding.
 */
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { theme } from '@/constants/theme';

export default function Index() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.replace('/welcome');
      return;
    }
    if (profileLoading) return;
    if (profile?.onboarding_completed) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  }, [session, authLoading, profile?.onboarding_completed, profileLoading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{ marginTop: 16, color: theme.colors.text.secondary }}>Loading...</Text>
    </View>
  );
}
