/**
 * Tabs layout — bottom tab bar for main app.
 * Protected: redirects to welcome if not authenticated, to onboarding if not completed.
 */
import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n';
import { LanguageSync } from '@/components/providers/LanguageSync';

function TabIcon({ name }: { name: string }) {
  return <Text style={{ fontSize: 18 }}>{name}</Text>;
}

export default function TabsLayout() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.replace('/welcome');
      return;
    }
    if (profileLoading) return;
    if (!profile?.onboarding_completed) router.replace('/onboarding');
  }, [session, authLoading, profile?.onboarding_completed, profileLoading]);

  if (!session || !profile?.onboarding_completed) return null;

  const { t } = useI18n();

  return (
    <LanguageSync>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0A84FF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: { backgroundColor: '#FFFFFF' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('dashboard.title'),
          tabBarIcon: () => <TabIcon name="🏠" />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t('transactions.title'),
          tabBarIcon: () => <TabIcon name="📋" />,
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: t('budgets.title'),
          tabBarIcon: () => <TabIcon name="💰" />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('analytics.title'),
          tabBarIcon: () => <TabIcon name="📊" />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: t('goals.title'),
          tabBarIcon: () => <TabIcon name="🎯" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          tabBarIcon: () => <TabIcon name="👤" />,
        }}
      />
    </Tabs>
    </LanguageSync>
  );
}
