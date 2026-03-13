/**
 * 404 screen — shown when route does not exist.
 */
import { View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useI18n } from '@/i18n';

export default function NotFoundScreen() {
  const { t } = useI18n();
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#1C1C1E' }}>{t('empty.notFound')}</Text>
          <Link href="/" style={{ marginTop: 16, color: '#0A84FF' }}>
            {t('empty.goToWelcome')}
          </Link>
        </View>
      </ScreenContainer>
    </>
  );
}
