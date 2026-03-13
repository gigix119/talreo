/**
 * Forgot password screen — request password reset email.
 * Generic success message to avoid leaking user existence.
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { theme } from '@/constants/theme';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    setError('');
    if (!email.trim()) {
      setError(t('auth.emailRequired'));
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthScreen
        title={t('auth.checkEmail')}
        subtitle={t('auth.checkEmailSubtitle')}
        secondaryLink={{ label: t('auth.backToSignIn'), href: '/(auth)/sign-in' }}
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
          title={t('auth.resetPassword')}
          subtitle={t('auth.resetPasswordSubtitle')}
          primaryAction={{ label: t('auth.sendResetLink'), onPress: handleSubmit, loading, loadingLabel: t('auth.sendingResetLink') }}
          secondaryLink={{ label: t('auth.backToSignIn'), href: '/(auth)/sign-in' }}
        >
          <Input
            label={t('auth.email')}
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
