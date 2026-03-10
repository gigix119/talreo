/**
 * WelcomePreview — product preview section with placeholder cards for future screenshots.
 */
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';

const PREVIEW_KEYS = [
  { id: 'dash', titleKey: 'welcome.dashboardPreview', labelKey: 'welcome.overview' },
  { id: 'analytics', titleKey: 'welcome.spendingAnalytics', labelKey: 'welcome.charts' },
  { id: 'goals', titleKey: 'welcome.savingsGoalsTitle', labelKey: 'welcome.goals' },
] as const;

function PreviewCard({ title, label }: { title: string; label: string }) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 160,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
      }}
    >
      <View
        style={{
          height: 120,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.background,
          marginBottom: theme.spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>{label}</Text>
      </View>
      <Text
        style={{
          fontSize: 15,
          fontWeight: '600',
          color: theme.colors.text.primary,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

export function WelcomePreview() {
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
        {t('welcome.seeTalreoInAction')}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
        }}
      >
        {PREVIEW_KEYS.map((item) => (
          <PreviewCard
            key={item.id}
            title={t(item.titleKey)}
            label={t(item.labelKey)}
          />
        ))}
      </View>
    </View>
  );
}
