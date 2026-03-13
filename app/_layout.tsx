/**
 * Root layout — AuthProvider, I18nProvider, ErrorBoundary, stack.
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/hooks/useAuth';
import { I18nProvider } from '@/i18n';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <I18nProvider initialLocale="pl">
          <ErrorBoundary>
          <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F2F2F7' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="(modals)/add-transaction"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="(modals)/add-budget"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="(modals)/recurring"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="(modals)/add-recurring"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="(modals)/alerts"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="(modals)/add-goal"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="(modals)/goal-funds"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="(modals)/settings"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="(modals)/export"
          options={{ presentation: 'modal' }}
        />
      </Stack>
          </ErrorBoundary>
        </I18nProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
