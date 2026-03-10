/**
 * InteractiveWidget — base for expandable, tappable analytics cards.
 * Elevation on press, smooth transitions.
 */
import { useState } from 'react';
import { View, Text, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { theme } from '@/constants/theme';
import { analyticsShadows, analyticsRadius } from '@/constants/analyticsTheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface InteractiveWidgetProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
  defaultExpanded?: boolean;
}

export function InteractiveWidget({
  title,
  icon,
  children,
  expandedContent,
  defaultExpanded = false,
}: InteractiveWidgetProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = () => {
    if (!expandedContent) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((e) => !e);
  };

  return (
    <Pressable
      onPress={expandedContent ? toggle : undefined}
      style={({ pressed }) => ({
        backgroundColor: theme.colors.surface,
        borderRadius: analyticsRadius.card,
        padding: theme.spacing.lg,
        ...(pressed ? analyticsShadows.cardHover : analyticsShadows.card),
        opacity: pressed ? 0.98 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: expandedContent ? theme.spacing.sm : 0 }}>
        {icon ? (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: theme.colors.background,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: theme.spacing.sm,
            }}
          >
            <Text style={{ fontSize: 18 }}>{icon}</Text>
          </View>
        ) : null}
        <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.text.primary, flex: 1 }}>
          {title}
        </Text>
        {expandedContent ? (
          <Text style={{ fontSize: 20, color: theme.colors.text.tertiary }}>{expanded ? '−' : '+'}</Text>
        ) : null}
      </View>
      {children}
      {expandedContent && expanded ? (
        <View style={{ marginTop: theme.spacing.md, paddingTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
          {expandedContent}
        </View>
      ) : null}
    </Pressable>
  );
}
