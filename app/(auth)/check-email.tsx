/**
 * Check email screen — shown after sign-up when email confirmation is required.
 * Generic message to avoid leaking whether email exists.
 */
import { View, Text } from 'react-native';
import { theme } from '@/constants/theme';
import { useLocalSearchParams } from 'expo-router';
import { AuthScreen } from '@/components/auth/AuthScreen';

export default function CheckEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? '';

  return (
    <AuthScreen
      title="Check your email"
      subtitle={
        email
          ? `We sent a confirmation link to ${email}. Click the link to verify your account, then sign in.`
          : 'If an account was created, we sent a confirmation link. Check your inbox and click the link, then sign in.'
      }
      secondaryLink={{ label: 'Back to sign in', href: '/(auth)/sign-in' }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.success + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.md,
        }}
      >
        <Text style={{ fontSize: 28 }}>✓</Text>
      </View>
    </AuthScreen>
  );
}
