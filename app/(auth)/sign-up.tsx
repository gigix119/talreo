/**
 * Sign-up screen — email + password + optional full name.
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Input } from '@/components/ui/Input';

export default function SignUpScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    if (!email.trim() || !password) {
      setError(t('auth.emailRequired'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordMin'));
      return;
    }
    setLoading(true);
    try {
      const data = await signUp(email.trim(), password, fullName.trim() || undefined);
      // If session exists, email confirmation is disabled — go to app
      if (data?.session) {
        router.replace('/');
      } else {
        router.replace({ pathname: '/(auth)/check-email', params: { email: email.trim() } });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
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
          title={t('auth.createAccountTitle')}
          subtitle={t('auth.getStartedSubtitle')}
          primaryAction={{ label: t('auth.createAccount'), onPress: handleSubmit, loading, loadingLabel: t('auth.creatingAccount') }}
          footerText={t('auth.alreadyHaveAccountQuestion')}
          footerLink={{ label: t('auth.signIn'), href: '/(auth)/sign-in' }}
        >
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            error={error || undefined}
          />
          <Input
            label={t('auth.fullName')}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Jane Doe"
            autoCapitalize="words"
          />
        </AuthScreen>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
