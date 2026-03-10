/**
 * AIInsightWidget — premium AI Financial Copilot card.
 */
import { View, Text } from 'react-native';
import { useI18n } from '@/i18n';
import { theme } from '@/constants/theme';
import { analyticsColors, analyticsRadius } from '@/constants/analyticsTheme';
import { AIFinancialAssistant } from './AIFinancialAssistant';
import type { SmartInsight } from '@/types/analytics';

interface AIInsightWidgetProps {
  insights: SmartInsight[];
}

export function AIInsightWidget({ insights }: AIInsightWidgetProps) {
  const { t } = useI18n();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: analyticsRadius.card,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.sm,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: analyticsColors.insightMuted,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.sm,
          }}
        >
          <Text style={{ fontSize: 20 }}>✨</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text.primary }}>
          {t('analytics.aiFinancialCopilot')}
        </Text>
      </View>
      <View style={{ paddingBottom: theme.spacing.md }}>
        <AIFinancialAssistant insights={insights} />
      </View>
    </View>
  );
}
