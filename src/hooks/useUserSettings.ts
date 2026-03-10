/**
 * useUserSettings — fetch, update settings (theme, notifications, language, etc.).
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { userSettingsService } from '@/services/userSettings';
import type { UserSettings, UserSettingsUpdate } from '@/types/database';

const DEFAULTS: Pick<UserSettings, 'theme_preference' | 'notifications_enabled' | 'default_transaction_type' | 'monthly_start_day' | 'language'> = {
  theme_preference: 'system',
  notifications_enabled: true,
  default_transaction_type: 'expense',
  monthly_start_day: 1,
  language: 'pl',
};

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user?.id) {
      setSettings(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const s = await userSettingsService.getOrCreateSettings(user.id);
      setSettings(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load settings.');
      setSettings(null);
      // Fallback: use defaults when table may not exist yet
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateSettings = useCallback(
    async (u: UserSettingsUpdate) => {
      if (!user?.id) return null;
      const updated = await userSettingsService.updateSettings(user.id, u);
      if (updated) setSettings(updated);
      return updated;
    },
    [user?.id]
  );

  return {
    settings: settings ? { ...DEFAULTS, ...settings } : { ...DEFAULTS, id: '', user_id: user?.id ?? '', created_at: '', updated_at: '' } as UserSettings,
    loading,
    error,
    refetch,
    updateSettings,
  };
}
