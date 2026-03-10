/**
 * Auth callback — handles deep link from password reset / magic link.
 * Supabase redirects to talreo://auth/callback#access_token=...&refresh_token=...
 * Route: /auth/callback (matches talreo://auth/callback)
 */
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/services/supabase';
import { parseAuthUrl } from '@/utils/auth-url';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { theme } from '@/constants/theme';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleUrl(url: string | null) {
      if (!url || !supabase) {
        router.replace('/');
        return;
      }
      const tokens = parseAuthUrl(url);
      if (!tokens) {
        router.replace('/');
        return;
      }
      try {
        const { error: err } = await supabase.auth.setSession({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        });
        if (err) throw err;
        if (mounted) router.replace('/');
      } catch {
        if (mounted) setError('Could not complete sign in.');
      }
    }

    Linking.getInitialURL().then((url) => {
      if (mounted) handleUrl(url);
    });

    const sub = Linking.addEventListener('url', ({ url }) => {
      if (mounted) handleUrl(url);
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  if (error) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.error, marginBottom: 16 }}>{error}</Text>
          <Text style={{ color: theme.colors.primary }} onPress={() => router.replace('/')}>
            Back to Welcome
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.text.secondary }}>Signing you in...</Text>
      </View>
    </ScreenContainer>
  );
}
