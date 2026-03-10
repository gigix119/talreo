/**
 * 404 screen — shown when route does not exist.
 */
import { View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#1C1C1E' }}>This screen doesn't exist.</Text>
          <Link href="/" style={{ marginTop: 16, color: '#0A84FF' }}>
            Go to Welcome
          </Link>
        </View>
      </ScreenContainer>
    </>
  );
}
