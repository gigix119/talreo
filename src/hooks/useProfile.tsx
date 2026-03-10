/**
 * useProfile — fetch and update user profile.
 * Requires AuthProvider (useAuth).
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { profileService } from '@/services/profile';
import type { Profile, ProfileUpdate } from '@/types/database';

interface UseProfileResult {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<Profile | null>;
}

export function useProfile(): UseProfileResult {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const p = await profileService.getProfile(user.id);
      setProfile(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load profile.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (updates: ProfileUpdate): Promise<Profile | null> => {
      if (!user?.id) return null;
      const p = await profileService.updateProfile(user.id, updates);
      setProfile(p);
      return p;
    },
    [user?.id]
  );

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}
