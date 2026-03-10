/**
 * User settings — theme, notifications, default tx type, monthly start day, language.
 */
import { supabase } from './supabase';
import type { UserSettings, UserSettingsUpdate } from '@/types/database';

const DEFAULT: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  theme_preference: 'system',
  notifications_enabled: true,
  default_transaction_type: 'expense',
  monthly_start_day: 1,
  language: 'pl',
};

export const userSettingsService = {
  async getSettings(userId: string): Promise<UserSettings | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return null;
    return data as UserSettings | null;
  },

  async getOrCreateSettings(userId: string): Promise<UserSettings> {
    let s = await this.getSettings(userId);
    if (!s) {
      s = await this.createSettings(userId);
    }
    return s!;
  },

  async createSettings(userId: string): Promise<UserSettings | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        ...DEFAULT,
      })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message || 'Could not create settings.');
    return data as UserSettings | null;
  },

  async updateSettings(userId: string, u: UserSettingsUpdate): Promise<UserSettings | null> {
    if (!supabase) return null;
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (u.theme_preference !== undefined) payload.theme_preference = u.theme_preference;
    if (u.notifications_enabled !== undefined) payload.notifications_enabled = u.notifications_enabled;
    if (u.default_transaction_type !== undefined)
      payload.default_transaction_type = u.default_transaction_type;
    if (u.monthly_start_day !== undefined) payload.monthly_start_day = u.monthly_start_day;
    if (u.language !== undefined) payload.language = u.language;
    const { data, error } = await supabase
      .from('user_settings')
      .update(payload)
      .eq('user_id', userId)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message || 'Could not update settings.');
    return data as UserSettings;
  },
};
