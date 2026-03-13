/**
 * Sign-in screen — email + password.
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Input } from '@/components/ui/Input';

export default function SignInScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    if (!email.trim() || !password) {
      setError(t('auth.emailRequired'));
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/');
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
          title={t('auth.signIn')}
          subtitle={t('auth.welcomeBack')}
          primaryAction={{ label: t('auth.signIn'), onPress: handleSubmit, loading, loadingLabel: t('auth.signingIn') }}
          footerText={t('auth.noAccount')}
          footerLink={{ label: t('auth.createAccount'), href: '/(auth)/sign-up' }}
          secondaryLink={{ label: t('auth.forgotPassword'), href: '/(auth)/forgot-password' }}
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
            placeholder="••••••••"
            secureTextEntry
            error={error || undefined}
          />
        </AuthScreen>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
