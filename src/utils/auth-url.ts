/**
 * Auth URL parsing — extract tokens from Supabase redirect URL.
 * Supabase redirects to: talreo://auth/callback#access_token=...&refresh_token=...
 */
import * as Linking from 'expo-linking';

export function parseAuthUrl(url: string | null): { access_token: string; refresh_token: string } | null {
  if (!url || !url.includes('#')) return null;
  const hash = url.split('#')[1];
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token };
}

export async function getInitialAuthUrl(): Promise<string | null> {
  return Linking.getInitialURL();
}
