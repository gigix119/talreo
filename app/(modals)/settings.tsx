/**
 * Settings — theme, notifications, default tx type, monthly start day, language.
 */
import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useI18n } from '@/i18n';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { theme } from '@/constants/theme';
import type { ThemePreference, TransactionType, Language } from '@/types/database';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, loading, updateSettings } = useUserSettings();
  const { t, setLocale, locale } = useI18n();
  const [themePref, setThemePref] = useState<ThemePreference>(settings.theme_preference);
  const [notifications, setNotifications] = useState(settings.notifications_enabled);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>(settings.default_transaction_type);
  const [monthlyStartDay, setMonthlyStartDay] = useState(String(settings.monthly_start_day));
  const [lang, setLang] = useState<Language>(settings.language);

  useEffect(() => {
    setThemePref(settings.theme_preference);
    setNotifications(settings.notifications_enabled);
    setDefaultTxType(settings.default_transaction_type);
    setMonthlyStartDay(String(settings.monthly_start_day));
    setLang(settings.language);
  }, [settings.theme_preference, settings.notifications_enabled, settings.default_transaction_type, settings.monthly_start_day, settings.language]);

  async function handleSaveTheme(p: ThemePreference) {
    setThemePref(p);
    await updateSettings({ theme_preference: p });
  }

  async function handleSaveNotifications(v: boolean) {
    setNotifications(v);
    await updateSettings({ notifications_enabled: v });
  }

  async function handleSaveDefaultTxType(v: TransactionType) {
    setDefaultTxType(v);
    await updateSettings({ default_transaction_type: v });
  }

  async function handleSaveMonthlyStartDay(v: string) {
    const n = parseInt(v, 10);
    if (n >= 1 && n <= 28) {
      setMonthlyStartDay(v);
      await updateSettings({ monthly_start_day: n });
    }
  }

  async function handleSaveLanguage(v: Language) {
    setLang(v);
    setLocale(v);
    await updateSettings({ language: v });
  }

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 48 }}>
          <Text style={{ color: theme.colors.text.secondary }}>{t('common.loading')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary }}>
            {t('settings.title')}
          </Text>
          <Text
            onPress={() => router.back()}
            style={{ fontSize: 16, color: theme.colors.primary, fontWeight: '500' }}
          >
            {t('common.close')}
          </Text>
        </View>

        <ScrollView
          style={{ marginTop: theme.spacing.md }}
          contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>
            {t('settings.theme')}
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
            {(['system', 'light', 'dark'] as ThemePreference[]).map((p) => (
              <Button
                key={p}
                variant={themePref === p ? 'primary' : 'secondary'}
                onPress={() => handleSaveTheme(p)}
                style={{ flex: 1 }}
              >
                {p === 'system' ? t('settings.themeSystem') : p === 'light' ? t('settings.themeLight') : t('settings.themeDark')}
              </Button>
            ))}
          </View>

          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>
            {t('settings.language')}
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
            <Button
              variant={lang === 'pl' ? 'primary' : 'secondary'}
              onPress={() => handleSaveLanguage('pl')}
              style={{ flex: 1 }}
            >
              {t('settings.languagePl')}
            </Button>
            <Button
              variant={lang === 'en' ? 'primary' : 'secondary'}
              onPress={() => handleSaveLanguage('en')}
              style={{ flex: 1 }}
            >
              {t('settings.languageEn')}
            </Button>
          </View>

          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>
            {t('settings.notifications')}
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
            <Button
              variant={notifications ? 'primary' : 'secondary'}
              onPress={() => handleSaveNotifications(true)}
              style={{ flex: 1 }}
            >
              {t('settings.notificationsOn')}
            </Button>
            <Button
              variant={!notifications ? 'primary' : 'secondary'}
              onPress={() => handleSaveNotifications(false)}
              style={{ flex: 1 }}
            >
              {t('settings.notificationsOff')}
            </Button>
          </View>

          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm }}>
            {t('settings.defaultTransactionType')}
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
            <Button
              variant={defaultTxType === 'expense' ? 'primary' : 'secondary'}
              onPress={() => handleSaveDefaultTxType('expense')}
              style={{ flex: 1 }}
            >
              {t('settings.defaultExpense')}
            </Button>
            <Button
              variant={defaultTxType === 'income' ? 'primary' : 'secondary'}
              onPress={() => handleSaveDefaultTxType('income')}
              style={{ flex: 1 }}
            >
              {t('settings.defaultIncome')}
            </Button>
          </View>

          <Input
            label={t('settings.monthlyStartDay')}
            value={monthlyStartDay}
            onChangeText={(v) => {
              setMonthlyStartDay(v);
              const n = parseInt(v, 10);
              if (n >= 1 && n <= 28) handleSaveMonthlyStartDay(v);
            }}
            placeholder="1"
            keyboardType="number-pad"
          />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
