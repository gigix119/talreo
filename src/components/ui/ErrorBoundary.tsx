/**
 * ErrorBoundary — catches render crashes and shows fallback UI.
 * Prevents white screen from uncaught errors.
 */
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { theme } from '@/constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
            padding: theme.spacing.lg,
          }}
        >
          <Text style={{ fontSize: 16, color: theme.colors.text.primary, textAlign: 'center', marginBottom: 16 }}>
            Coś poszło nie tak
          </Text>
          <Pressable
            onPress={() => this.setState({ hasError: false })}
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.md,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>Spróbuj ponownie</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
