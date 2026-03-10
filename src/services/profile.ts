/**
 * Profile service — fetch and update user profile.
 * Uses upsert to create profile if missing (fallback when trigger didn't run).
 */
import { supabase } from './supabase';
import type { Profile, ProfileUpdate } from '@/types/database';

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) return null;
    return data as Profile | null;
  },

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    if (!supabase) return null;
    const payload: Record<string, unknown> = {
      id: userId,
      updated_at: new Date().toISOString(),
    };
    if (updates.full_name !== undefined) payload.full_name = updates.full_name;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.onboarding_completed !== undefined) payload.onboarding_completed = updates.onboarding_completed;
    if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id', ignoreDuplicates: false })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message || 'Could not update profile.');
    if (!data) throw new Error('Could not save profile.');
    return data as Profile;
  },
};
