/**
 * Forgot password screen — request password reset email.
 * Generic success message to avoid leaking user existence.
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { theme } from '@/constants/theme';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setError('');
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthScreen
        title="Check your email"
        subtitle="If an account exists with that email, you will receive a link to reset your password. Check your inbox and click the link."
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
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 28, color: theme.colors.success }}>✓</Text>
        </View>
      </AuthScreen>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthScreen
          title="Reset password"
          subtitle="Enter your email and we'll send you a link to reset your password."
          primaryAction={{ label: 'Send reset link', onPress: handleSubmit, loading, loadingLabel: 'Sending...' }}
          secondaryLink={{ label: 'Back to sign in', href: '/(auth)/sign-in' }}
        >
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={error || undefined}
          />
        </AuthScreen>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
