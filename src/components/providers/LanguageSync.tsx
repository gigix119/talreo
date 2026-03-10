/**
 * LanguageSync — sync user_settings.language to I18nProvider.
 */
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useI18n } from '@/i18n';

export function LanguageSync({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { settings } = useUserSettings();
  const { setLocale, locale } = useI18n();

  useEffect(() => {
    if (user && settings?.language && settings.language !== locale) {
      setLocale(settings.language);
    }
  }, [user?.id, settings?.language]);

  return <>{children}</>;
}
