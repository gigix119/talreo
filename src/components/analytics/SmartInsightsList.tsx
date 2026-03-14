/**
 * Smart insights — premium AI assistant cards.
 */
import { View, Text, Pressable } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsColors, analyticsShadows, analyticsRadius } from '@/constants/analyticsTheme';
import type { SmartInsight } from '@/types/analytics';

interface SmartInsightsListProps {
  insights: SmartInsight[];
  title?: string;
}

const typeConfig = {
  success: { bg: analyticsColors.incomeMuted, accent: analyticsColors.success },
  warning: { bg: 'rgba(245, 158, 11, 0.12)', accent: analyticsColors.warning },
  info: { bg: analyticsColors.balanceMuted, accent: analyticsColors.balance },
  highlight: { bg: analyticsColors.analyticsMuted, accent: analyticsColors.analytics },
};

export function SmartInsightsList({ insights, title }: SmartInsightsListProps) {
  const { t } = useI18n();
  const sectionTitle = title ?? t('analytics.aiInsights');

  if (insights.length === 0) {
    return (
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: analyticsRadius.card,
          padding: theme.spacing.xl,
          alignItems: 'center',
          ...analyticsShadows.card,
        }}
      >
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: analyticsColors.insightMuted, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 18 }}>✨</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.secondary }}>{sectionTitle}</Text>
        <Text style={{ fontSize: 14, color: theme.colors.text.tertiary, marginTop: 4, textAlign: 'center' }}>
          {t('analytics.emptyInsights')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {insights.map((insight) => {
        const cfg = typeConfig[insight.type];
        return (
          <Pressable
            key={insight.id}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'flex-start',
              backgroundColor: theme.colors.surface,
              borderRadius: analyticsRadius.card,
              padding: theme.spacing.lg,
              borderLeftWidth: 4,
              borderLeftColor: cfg.accent,
              ...analyticsShadows.subtle,
              opacity: pressed ? 0.95 : 1,
            })}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
                {insight.text}
              </Text>
              {insight.value != null && (
                <View
                  style={{
                    marginTop: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: cfg.bg,
                    borderRadius: analyticsRadius.badge,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: cfg.accent }}>
                    {insight.value}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
