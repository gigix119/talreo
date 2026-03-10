/**
 * App config — env vars for Supabase.
 * EXPO_PUBLIC_* vars are available at build time.
 * Create .env in project root with your Supabase URL and anon key.
 */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http')
);

/** Auth redirect URL for password reset / magic link. Must match Supabase redirect URLs. */
export const AUTH_REDIRECT_URL = 'talreo://auth/callback';
