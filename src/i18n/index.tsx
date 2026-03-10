/**
 * i18n — translations, locale, t().
 * Use t('dashboard.title') for nested keys.
 * Persists locale to localStorage (web) or SecureStore (native).
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { Language } from '@/types/database';
import { translations } from './translations';

const LOCALE_KEY = 'talreo_locale';

function getStoredLocale(): Language | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    const s = window.localStorage.getItem(LOCALE_KEY);
    if (s === 'pl' || s === 'en') return s;
  }
  return null;
}

function setStoredLocale(lang: Language): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCALE_KEY, lang);
    }
  } catch {
    // ignore
  }
}

type TranslationKeys = {
  [K in keyof typeof translations.pl]: keyof (typeof translations.pl)[K] extends string
    ? Record<keyof (typeof translations.pl)[K], string>
    : never;
};

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const k of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[k];
  }
  return typeof current === 'string' ? current : undefined;
}

/** t('dashboard.title') -> translations.dashboard.title */

interface I18nContextValue {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale = 'pl',
  onLocaleChange,
}: {
  children: React.ReactNode;
  initialLocale?: Language;
  onLocaleChange?: (locale: Language) => void;
}) {
  const stored = getStoredLocale();
  const [locale, setLocaleState] = useState<Language>(stored ?? initialLocale);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      SecureStore.getItemAsync(LOCALE_KEY).then((s) => {
        if (s === 'pl' || s === 'en') setLocaleState(s);
      });
    }
  }, []);

  const setLocale = useCallback(
    (lang: Language) => {
      setLocaleState(lang);
      setStoredLocale(lang);
      if (Platform.OS !== 'web') {
        SecureStore.setItemAsync(LOCALE_KEY, lang).catch(() => {});
      }
      onLocaleChange?.(lang);
    },
    [onLocaleChange]
  );

  const t = useCallback(
    (key: string): string => {
      const val = getNested(translations[locale] as unknown as Record<string, unknown>, key);
      return val ?? key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
