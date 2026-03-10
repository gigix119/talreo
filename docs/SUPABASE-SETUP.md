# Supabase Setup for Talreo

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Choose name, password, region.
4. Wait for the project to be ready.

---

## 2. Apply the database migration

1. In Supabase Dashboard → **SQL Editor**.
2. Create a new query.
3. Paste the contents of `supabase/migrations/001_profiles_and_rls.sql`.
4. Click **Run**.

This creates:
- `public.profiles` table
- RLS policies (users see only their own profile)
- Trigger `on_auth_user_created` (creates profile on signup)

---

## 3. Configure Auth settings

Go to **Authentication** → **Providers**:

- **Email**: Enabled by default.
- **Confirm email**: Optional. Turn ON to require email verification before sign-in.
- **Secure email change**: ON.
- **Minimum password length**: 6 (default).

Go to **Authentication** → **URL Configuration**:

| Setting | Value |
|---------|-------|
| **Site URL** | `http://localhost:8081` (Expo web dev) |
| **Redirect URLs** | See below |

**Redirect URLs** (add these):
```
talreo://auth/callback
talreo://**
exp://192.168.*:8081/--/auth/callback
```

- `talreo://auth/callback` — mobile deep link (password reset, email confirmation)
- `talreo://**` — wildcard for Talreo scheme
- `exp://192.168.*:8081/--/auth/callback` — Expo dev server (port 8081)

---

## 4. Configure Auth Email Templates (optional)

Go to **Authentication** → **Email Templates**:

- **Confirm signup**: Customize subject/body if desired.
- **Magic Link**: For magic link auth.
- **Change Email Address**: For email change flow.
- **Reset Password**: Customize subject/body. The link uses the redirect URL from step 3.

---

## 5. Get API keys

1. Go to **Project Settings** → **API**.
2. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## 6. Add env vars in Talreo

Create `.env` in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Restart the Expo dev server after changing `.env`.

---

## 7. Test locally

### Sign up
1. Open app → Welcome → Get Started.
2. Enter email, password, optional name.
3. If **Confirm email** is ON: check inbox, click link.
4. Sign in with same email/password.

### Sign in
1. Enter email and password.
2. Should redirect to Dashboard (tabs).

### Sign out
1. Profile tab → Sign out.
2. Should redirect to Welcome.

### Forgot password
1. Sign in screen → Forgot password?.
2. Enter email.
3. Check inbox for reset link.
4. Click link → app opens → session set → redirect to app.
5. User is logged in (can change password later in profile).

### Auth callback (deep link)
- Password reset and email confirmation use `talreo://auth/callback`.
- On device/simulator, ensure the app can open this URL.
- For Expo Go: scheme `talreo` should work with `scheme: "talreo"` in app.json.

---

## 8. Security checklist

- [ ] RLS enabled on `profiles`.
- [ ] Redirect URLs restricted (no wildcards in production).
- [ ] `.env` not committed (in `.gitignore`).
- [ ] No secrets in client code.
- [ ] Email confirmation ON for production.
- [ ] Password min length at least 6.
