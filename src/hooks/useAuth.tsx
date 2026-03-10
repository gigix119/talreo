/**
 * useAuth — auth state and actions.
 * Provides session, loading, user, and auth methods.
 * Use AuthProvider at root; useAuth() in screens.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { authService } from '@/services/auth';

interface AuthContextValue {
  session: Session | null;
  user: { id: string; email?: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ user: unknown; session: unknown } | undefined>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = authService.onAuthStateChange((payload) => {
      setSession((payload?.session as Session) ?? null);
    });

    return () => data?.subscription?.unsubscribe?.();
  }, []);

  const user = session?.user
    ? { id: session.user.id, email: session.user.email ?? undefined }
    : null;

  const value: AuthContextValue = {
    session,
    user,
    loading,
    signIn: async (email, password) => {
      await authService.signIn(email, password);
    },
    signUp: async (email, password, fullName) => {
      return authService.signUp(email, password, fullName);
    },
    signOut: async () => {
      await authService.signOut();
    },
    resetPassword: async (email) => {
      await authService.resetPasswordForEmail(email);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
