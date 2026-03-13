/**
 * Profile screen — compact profile summary, recurring, export, settings, sign out.
 */
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/theme';
import { BOTTOM_CONTENT_PADDING } from '@/constants/layout';

function LabelValue({ label, value }: { label: string; value: string | null | undefined }) {
  if (value == null || value === '') return null;
  return (
    <View style={{ marginBottom: theme.spacing.sm }}>
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: BOTTOM_CONTENT_PADDING }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary }}>
          {t('profile.title')}
        </Text>
        <Card padding="md" elevated style={{ marginTop: theme.spacing.md }}>
          <LabelValue label={t('profile.email')} value={user?.email} />
          <LabelValue label={t('profile.name')} value={profile?.full_name ?? undefined} />
          <LabelValue label={t('profile.currency')} value={profile?.currency} />
        </Card>
        <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.xs }}>
          <Text
            onPress={() => router.push('/(modals)/recurring')}
            style={{ fontSize: 15, color: theme.colors.primary, fontWeight: '500' }}
          >
            {t('profile.recurringTransactions')} →
          </Text>
          <Text
            onPress={() => router.push('/(modals)/settings')}
            style={{ fontSize: 15, color: theme.colors.primary, fontWeight: '500' }}
          >
            {t('profile.settings')} →
          </Text>
          <Text
            onPress={() => router.push('/(modals)/export')}
            style={{ fontSize: 15, color: theme.colors.primary, fontWeight: '500' }}
          >
            {t('profile.export')} →
          </Text>
        </View>
        <Button
          variant="secondary"
          onPress={handleSignOut}
          style={{ marginTop: theme.spacing.lg, alignSelf: 'flex-start' }}
        >
          {t('auth.signOut')}
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
}
