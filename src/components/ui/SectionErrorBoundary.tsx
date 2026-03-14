/**
 * SectionErrorBoundary — catches errors in a single section without breaking the whole page.
 * Shows a compact fallback so other sections can still render.
 */
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text } from 'react-native';
import { theme } from '@/constants/theme';

interface Props {
  children: ReactNode;
  /** Optional section name for debugging */
  sectionName?: string;
}

interface State {
  hasError: boolean;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.warn('[SectionErrorBoundary]', this.props.sectionName ?? 'section', error.message, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.backgroundElevated,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ fontSize: 13, color: theme.colors.text.tertiary }}>
            Nie można załadować tej sekcji
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}
