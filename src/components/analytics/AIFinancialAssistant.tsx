/**
 * AI Financial Assistant — ChatGPT/Copilot-style intelligence layer.
 * Summary card, rich insight cards, actionable recommendations.
 */
import { useState, useMemo } from 'react';
import { View, Text, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsColors, analyticsShadows, analyticsRadius } from '@/constants/analyticsTheme';
import type { SmartInsight } from '@/types/analytics';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AIFinancialAssistantProps {
  insights: SmartInsight[];
}

const TYPE_CONFIG: Record<string, { icon: string; badgeKey: string; bg: string; accent: string }> = {
  warning: { icon: '⚠', badgeKey: 'aiBadgeWarning', bg: 'rgba(245, 158, 11, 0.1)', accent: analyticsColors.warning },
  success: { icon: '✓', badgeKey: 'aiBadgeSuccess', bg: analyticsColors.incomeMuted, accent: analyticsColors.success },
  info: { icon: 'ℹ', badgeKey: 'aiBadgeTrend', bg: analyticsColors.balanceMuted, accent: analyticsColors.balance },
  highlight: { icon: '◆', badgeKey: 'aiBadgeOpportunity', bg: analyticsColors.analyticsMuted, accent: analyticsColors.analytics },
};

function getConfig(insight: SmartInsight) {
  return TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.info;
}

function buildSummaryKeys(insights: SmartInsight[]): string {
  if (insights.length === 0) return '';
  const warnings = insights.filter((i) => i.type === 'warning').length;
  const successes = insights.filter((i) => i.type === 'success').length;
  if (warnings > 0 && successes > 0) return 'aiSummaryMix';
  if (warnings > 0) return 'aiSummaryWarnings';
  if (successes > 0) return 'aiSummarySuccess';
  return 'aiSummaryDefault';
}

export function AIFinancialAssistant({ insights }: AIFinancialAssistantProps) {
  const { t } = useI18n();
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const visibleInsights = useMemo(
    () => insights.filter((i) => !hiddenIds.has(i.id)),
    [insights, hiddenIds]
  );

  const summaryKey = useMemo(() => buildSummaryKeys(insights), [insights]);

  const hideInsight = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHiddenIds((prev) => new Set([...prev, id]));
  };

  if (insights.length === 0) {
    return (
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: analyticsRadius.card,
          padding: theme.spacing.xl,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'rgba(99, 102, 241, 0.15)',
          ...analyticsShadows.card,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: analyticsColors.insightMuted,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 24 }}>✨</Text>
        </View>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '600',
            color: theme.colors.text.primary,
            textAlign: 'center',
          }}
        >
          {t('analytics.aiEmptyTitle')}
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: theme.colors.text.tertiary,
            marginTop: 8,
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          {t('analytics.aiEmptySubtitle')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {/* AI Summary Card */}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: analyticsRadius.card,
          padding: theme.spacing.lg,
          borderWidth: 1,
          borderColor: 'rgba(99, 102, 241, 0.2)',
          ...analyticsShadows.card,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: analyticsColors.insightMuted,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
          >
            <Text style={{ fontSize: 16 }}>◇</Text>
          </View>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: analyticsColors.insight,
              letterSpacing: 0.5,
            }}
          >
            {t('analytics.aiSummaryLabel')}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: theme.colors.text.primary,
            lineHeight: 24,
          }}
        >
          {t(`analytics.${summaryKey}`)}
        </Text>
      </View>

      {/* Insight Cards */}
      {visibleInsights.filter((i) => i && typeof i === 'object').map((insight, idx) => {
        const cfg = getConfig(insight);
        const text = insight?.text ?? '';
        const parts = text.split('.');
        const title = insight?.title ?? (parts[0] ?? '');
        const explanation = insight?.title ? text : parts.slice(1).join('.').trim();

        return (
          <View
            key={insight?.id ?? `insight-${idx}`}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: analyticsRadius.card,
              overflow: 'hidden',
              borderLeftWidth: 4,
              borderLeftColor: cfg.accent,
              ...analyticsShadows.subtle,
            }}
          >
            <Pressable
              style={({ pressed }) => ({
                padding: theme.spacing.lg,
                opacity: pressed ? 0.95 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: cfg.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{cfg.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: analyticsRadius.badge,
                        backgroundColor: cfg.bg,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: cfg.accent,
                          letterSpacing: 0.5,
                        }}
                      >
                        {t(`analytics.${cfg.badgeKey}`)}
                      </Text>
                    </View>
                    {insight.value != null && (
                      <Text style={{ fontSize: 13, fontWeight: '700', color: cfg.accent }}>
                        {insight.value}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: theme.colors.text.primary,
                    }}
                  >
                    {title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.colors.text.secondary,
                      marginTop: 6,
                      lineHeight: 20,
                    }}
                  >
                    {explanation || text}
                  </Text>

                  {insight.recommendation && (
                    <View
                      style={{
                        marginTop: 12,
                        padding: 12,
                        backgroundColor: theme.colors.background,
                        borderRadius: analyticsRadius.badge,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '600',
                          color: theme.colors.text.tertiary,
                          marginBottom: 4,
                          letterSpacing: 0.5,
                        }}
                      >
                        {t('analytics.aiRecommendation')}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: theme.colors.text.primary,
                          lineHeight: 20,
                        }}
                      >
                        {insight.recommendation}
                      </Text>
                    </View>
                  )}

                  {/* Actions */}
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    <Pressable
                      onPress={() => {}}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: theme.colors.background,
                        borderRadius: analyticsRadius.badge,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.primary }}>
                        {t('analytics.aiViewTransactions')}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {}}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: theme.colors.background,
                        borderRadius: analyticsRadius.badge,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.text.secondary }}>
                        {t('analytics.aiCompareMonth')}
                      </Text>
                    </Pressable>
                    {insight?.id?.startsWith('budget') && (
                      <Pressable
                        onPress={() => {}}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          backgroundColor: theme.colors.background,
                          borderRadius: analyticsRadius.badge,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.text.secondary }}>
                          {t('analytics.aiAdjustBudget')}
                        </Text>
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => hideInsight(insight?.id ?? `insight-${idx}`)}
                      style={({ pressed }) => ({
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: theme.colors.background,
                        borderRadius: analyticsRadius.badge,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '500', color: theme.colors.text.tertiary }}>
                        {t('analytics.aiDismiss')}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
