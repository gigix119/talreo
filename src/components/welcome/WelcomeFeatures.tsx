/**
 * WelcomeFeatures — 3 premium feature cards with icons and descriptions.
 */
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { Card } from '@/components/ui/Card';

const FEATURE_KEYS = [
  { id: 'budget', icon: '📊', titleKey: 'welcome.budgetTracking', descKey: 'welcome.budgetTrackingDesc' },
  { id: 'visual', icon: '📈', titleKey: 'welcome.visualAnalytics', descKey: 'welcome.visualAnalyticsDesc' },
  { id: 'ai', icon: '✨', titleKey: 'welcome.aiInsights', descKey: 'welcome.aiInsightsDesc' },
] as const;

export function WelcomeFeatures() {
  const { t } = useI18n();

  return (
    <View style={{ paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.xxl }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.xl,
        }}
      >
        {t('welcome.everythingYouNeed')}
      </Text>
      <View style={{ gap: theme.spacing.md }}>
        {FEATURE_KEYS.map(({ id, icon, titleKey, descKey }) => (
          <Card key={id} padding="lg" elevated>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: theme.radius.md,
                  backgroundColor: theme.colors.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 22 }}>{icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '600',
                    color: theme.colors.text.primary,
                  }}
                >
                  {t(titleKey)}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: theme.colors.text.secondary,
                    lineHeight: 22,
                    marginTop: theme.spacing.xs,
                  }}
                >
                  {t(descKey)}
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}
