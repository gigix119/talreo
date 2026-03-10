# Talreo — Authentication Architecture

## 1. Overview

Talreo uses **Supabase Auth** as the identity provider. No custom auth backend. Session tokens are stored in **Expo SecureStore** (encrypted, production-ready).

```
┌─────────────────────────────────────────────────────────────────┐
│                        Talreo App                                │
│  Auth screens → Supabase Auth API → JWT + refresh token          │
│  Session → SecureStore (persisted)                               │
│  Profile → public.profiles (PostgreSQL, RLS)                     │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase                                 │
│  Auth: sign up, sign in, reset, confirm email                    │
│  Database: profiles table, RLS                                   │
│  Trigger: on signup → create profile                             │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Auth Flows

| Flow | Steps |
|------|-------|
| **Sign Up** | Form (email, password) → `signUp()` → Supabase sends confirmation email → User confirms → Can sign in |
| **Sign In** | Form (email, password) → `signInWithPassword()` → Session stored in SecureStore → Redirect to app |
| **Sign Out** | `signOut()` → Clear session → Redirect to welcome |
| **Forgot Password** | Form (email) → `resetPasswordForEmail()` → User receives email → Clicks link → Lands in app with session |
| **Email Confirmation** | Supabase redirects to configured URL with tokens → App sets session via auth callback |

## 3. Database Security Model

- **auth.users** — Supabase managed, identity source.
- **public.profiles** — App profile data, 1:1 with auth.users via `id`.
- **RLS** — Users can SELECT/UPDATE only their own profile. INSERT handled by trigger.
- **Future tables** (transactions, budgets, goals) — All use `user_id` with RLS `auth.uid() = user_id`.

## 4. Route Protection

- **Unauthenticated:** `/welcome`, `/(auth)/*` (sign-in, sign-up, forgot-password, check-email), `/auth/callback` (deep link handler)
- **Authenticated:** `/(tabs)/*`, `/(modals)/*`, `/onboarding`
- **Auth check:** Root layout reads session, redirects unauthenticated users to welcome, authenticated to tabs.

## 5. Security Principles

- Session in SecureStore (encrypted at rest).
- No client-side trust for authorization — RLS enforces per-user access.
- Generic error messages — no "email exists" / "invalid credentials" that leak info.
- All secrets via env vars (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY).
- Password reset link uses deep link `talreo://auth/callback`; Supabase redirects to app with tokens in URL fragment.
- Redirect URLs in Supabase: `talreo://auth/callback`, `talreo://**`, `exp://192.168.*:8081/--/auth/callback`.
