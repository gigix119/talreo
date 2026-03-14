/**
 * Tabs layout — bottom tab bar for main app.
 * Mobile-first: safe area insets for tab bar visibility.
 */
import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n';
import { LanguageSync } from '@/components/providers/LanguageSync';
import { theme } from '@/constants/theme';

function TabIcon({ name }: { name: string }) {
  return <Text style={{ fontSize: 18 }}>{name}</Text>;
}

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.replace('/');
      return;
    }
    if (profileLoading) return;
    if (!profile?.onboarding_completed) router.replace('/onboarding');
  }, [session, authLoading, profile?.onboarding_completed, profileLoading]);

  // Show loading instead of null to prevent white screen while auth/profile resolve
  const waitingForAuth = authLoading || !session;
  const waitingForProfile = profileLoading || !profile?.onboarding_completed;
  if (waitingForAuth || waitingForProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.text.secondary }}>{t('common.loading')}</Text>
      </View>
    );
  }
  const tabBarPaddingBottom = Math.max(insets.bottom, 12);
  const tabBarHeight = 52;

  return (
    <LanguageSync>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0A84FF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: tabBarHeight + tabBarPaddingBottom,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          minHeight: tabBarHeight + tabBarPaddingBottom,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginTop: 2 },
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarIconStyle: { marginBottom: 0 },
        tabBarAllowFontScaling: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: () => <TabIcon name="🏠" />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t('tabs.transactions'),
          tabBarIcon: () => <TabIcon name="📋" />,
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: t('tabs.budgets'),
          tabBarIcon: () => <TabIcon name="💰" />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('tabs.analytics'),
          tabBarIcon: () => <TabIcon name="📊" />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: t('tabs.goals'),
          tabBarIcon: () => <TabIcon name="🎯" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: () => <TabIcon name="👤" />,
        }}
      />
    </Tabs>
    </LanguageSync>
  );
}
