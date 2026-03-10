/**
 * Profile screen — email, full name, currency, recurring, settings, sign out.
 */
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/theme';

function LabelValue({ label, value }: { label: string; value: string | null | undefined }) {
  if (value == null || value === '') return null;
  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      <Text style={{ fontSize: 12, fontWeight: '500', color: theme.colors.text.tertiary, marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 16, color: theme.colors.text.primary }}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const { t } = useI18n();

  async function handleSignOut() {
    await signOut();
    router.replace('/');
  }

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 48 }}>
          <Text style={{ color: theme.colors.text.secondary }}>{t('common.loading')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingTop: 48, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.text.primary }}>
          {t('profile.title')}
        </Text>
        <Card padding="lg" elevated style={{ marginTop: theme.spacing.lg }}>
          <LabelValue label={t('profile.email')} value={user?.email} />
          <LabelValue label={t('profile.name')} value={profile?.full_name ?? undefined} />
          <LabelValue label={t('profile.currency')} value={profile?.currency} />
        </Card>
        <Text
          onPress={() => router.push('/(modals)/recurring')}
          style={{
            fontSize: 16,
            color: theme.colors.primary,
            fontWeight: '500',
            marginTop: theme.spacing.lg,
            marginBottom: theme.spacing.sm,
          }}
        >
          {t('profile.recurringTransactions')} →
        </Text>
        <Text
          onPress={() => router.push('/(modals)/settings')}
          style={{
            fontSize: 16,
            color: theme.colors.primary,
            fontWeight: '500',
            marginBottom: theme.spacing.sm,
          }}
        >
          {t('profile.settings')} →
        </Text>
        <Text
          onPress={() => router.push('/(modals)/export')}
          style={{
            fontSize: 16,
            color: theme.colors.primary,
            fontWeight: '500',
            marginBottom: theme.spacing.sm,
          }}
        >
          {t('profile.export')} →
        </Text>
        <Button
          variant="secondary"
          onPress={handleSignOut}
          style={{ marginTop: theme.spacing.xl, alignSelf: 'flex-start' }}
        >
          {t('auth.signOut')}
        </Button>
      </View>
    </ScreenContainer>
  );
}
