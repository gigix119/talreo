/**
 * Auth loading screen — shown while checking session.
 * Redirects based on auth state.
 */
import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/constants/theme';
import { ScreenContainer } from '@/components/layout/ScreenContainer';

export default function AuthLoadingScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (session) {
      router.replace('/(tabs)');
    } else {
      router.replace('/welcome');
    }
  }, [session, loading]);

  return (
    <ScreenContainer>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.text.secondary }}>Loading...</Text>
      </View>
    </ScreenContainer>
  );
}
