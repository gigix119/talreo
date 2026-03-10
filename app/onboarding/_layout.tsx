/**
 * Onboarding layout — protected, redirects if not logged in or onboarding completed.
 */
import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export default function OnboardingLayout() {
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
    if (profile?.onboarding_completed) router.replace('/(tabs)');
  }, [session, authLoading, profile?.onboarding_completed, profileLoading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F2F2F7' },
      }}
    />
  );
}
