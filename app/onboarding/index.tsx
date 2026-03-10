/**
 * Onboarding — name + currency, then choice: empty or demo data.
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { CURRENCIES, type Currency } from '@/types/database';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { createDemoData } from '@/services/demoData';

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { t } = useI18n();
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [currency, setCurrency] = useState<Currency>('PLN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setCurrency(profile.currency ?? 'PLN');
    }
  }, [profile]);

  async function handleContinue() {
    setError('');
    const name = fullName.trim();
    if (!name) {
      setError(t('onboarding.nameRequired'));
      return;
    }
    if (name.length < 2) {
      setError(t('onboarding.nameMin'));
      return;
    }
    setStep(2);
  }

  async function handleStartEmpty() {
    setError('');
    setLoading(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        currency,
        onboarding_completed: true,
      });
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadDemo() {
    setError('');
    setLoading(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        currency,
        onboarding_completed: true,
      });
      if (user?.id) {
        try {
          await createDemoData(user.id, currency);
        } catch (demoErr) {
          console.warn('Demo data failed, continuing with empty account:', demoErr);
        }
      }
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  if (step === 2) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, paddingTop: theme.spacing.xxl, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.text.primary }}>
            {t('onboarding.chooseStart')}
          </Text>
          <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.md }}>
            <Card
              padding="lg"
              elevated
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text.primary }}>
                {t('onboarding.startEmpty')}
              </Text>
              <Text style={{ fontSize: 14, color: theme.colors.text.secondary, marginTop: 8 }}>
                {t('onboarding.startEmptyDesc')}
              </Text>
              <Button
                variant="secondary"
                onPress={handleStartEmpty}
                disabled={loading}
                style={{ marginTop: theme.spacing.md }}
              >
                {t('onboarding.startEmpty')}
              </Button>
            </Card>
            <Card
              padding="lg"
              elevated
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text.primary }}>
                {t('onboarding.loadDemo')}
              </Text>
              <Text style={{ fontSize: 14, color: theme.colors.text.secondary, marginTop: 8 }}>
                {t('onboarding.loadDemoDesc')}
              </Text>
              <Button
                variant="primary"
                onPress={handleLoadDemo}
                disabled={loading}
                style={{ marginTop: theme.spacing.md }}
              >
                {loading ? t('onboarding.loadingDemo') : t('onboarding.loadDemo')}
              </Button>
            </Card>
          </View>
          {error ? (
            <Text style={{ fontSize: 12, color: theme.colors.error, marginTop: theme.spacing.md }}>
              {error}
            </Text>
          ) : null}
          <Button
            variant="ghost"
            onPress={() => setStep(1)}
            disabled={loading}
            style={{ marginTop: theme.spacing.xl, alignSelf: 'center' }}
          >
            {t('common.cancel')}
          </Button>
        </View>
      </ScreenContainer>
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
        <ScreenContainer>
          <View style={{ flex: 1, paddingTop: theme.spacing.xxl, paddingBottom: theme.spacing.xl }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: theme.colors.text.primary,
                letterSpacing: -0.5,
              }}
            >
              {t('auth.welcome')}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.text.secondary,
                marginTop: theme.spacing.sm,
                lineHeight: 24,
              }}
            >
              {t('onboarding.title')}
            </Text>

            <View style={{ marginTop: theme.spacing.xl }}>
              <Input
                label={t('auth.fullName')}
                value={fullName}
                onChangeText={setFullName}
                placeholder={t('onboarding.namePlaceholder')}
                autoCapitalize="words"
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.sm,
                  marginTop: theme.spacing.md,
                }}
              >
                {t('onboarding.selectCurrency')}
              </Text>
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                {CURRENCIES.map((c) => (
                  <Button
                    key={c}
                    variant={currency === c ? 'primary' : 'secondary'}
                    onPress={() => setCurrency(c)}
                    style={{ minWidth: 80 }}
                  >
                    {c}
                  </Button>
                ))}
              </View>
              {error ? (
                <Text style={{ fontSize: 12, color: theme.colors.error, marginTop: theme.spacing.sm }}>
                  {error}
                </Text>
              ) : null}
            </View>

            <Button
              onPress={handleContinue}
              disabled={loading}
              fullWidth
              style={{ marginTop: theme.spacing.xl }}
            >
              {t('onboarding.continue')}
            </Button>
          </View>
        </ScreenContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
