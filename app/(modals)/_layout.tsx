/**
 * Modals layout — stack for modal screens.
 */
import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        contentStyle: { backgroundColor: '#F2F2F7' },
      }}
    />
  );
}
