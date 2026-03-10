/**
 * Auth callback layout — minimal stack for deep link route /auth/callback.
 */
import { Stack } from 'expo-router';

export default function AuthCallbackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F2F2F7' },
      }}
    />
  );
}
