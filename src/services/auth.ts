/**
 * Auth service — Supabase Auth wrapper.
 * Handles sign up, sign in, sign out, password reset.
 * Uses generic error messages to avoid leaking user existence.
 */
import { supabase } from './supabase';
import { AUTH_REDIRECT_URL } from '@/constants/config';

const GENERIC_ERROR = 'Something went wrong. Please try again.';
const INVALID_CREDENTIALS = 'Invalid email or password.';

function normalizeError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = String((err as { message: unknown }).message);
    // Don't expose "User already registered" or similar
    if (msg.includes('already') || msg.includes('exists')) return GENERIC_ERROR;
    if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) return INVALID_CREDENTIALS;
    if (msg.includes('Email not confirmed')) return 'Please confirm your email before signing in.';
    if (msg.length > 0 && msg.length < 100) return msg;
  }
  return GENERIC_ERROR;
}

export const authService = {
  async signUp(email: string, password: string, fullName?: string) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: AUTH_REDIRECT_URL,
      },
    });
    if (error) throw new Error(normalizeError(error));
    return data;
  },

  async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(normalizeError(error));
    return data;
  },

  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  async resetPasswordForEmail(email: string) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: AUTH_REDIRECT_URL,
    });
    if (error) throw new Error(normalizeError(error));
  },

  async updatePassword(newPassword: string) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(normalizeError(error));
  },

  async getSession() {
    if (!supabase) return { data: { session: null }, error: null };
    return supabase.auth.getSession();
  },

  onAuthStateChange(callback: (payload: { session: unknown } | null) => void) {
    if (!supabase)
      return { data: { subscription: { unsubscribe: () => {} } } };
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback({ session });
    });
    return data;
  },
};
