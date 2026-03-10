# Talreo — Setup

## Supabase migrations (required)

Run these SQL scripts in **Supabase SQL Editor** (in order). Copy the **content** of each file, paste, and click Run:

1. `supabase/migrations/001_profiles_and_rls.sql`
2. `supabase/migrations/002_profiles_extend.sql`
3. `supabase/migrations/003_categories_transactions.sql`
4. `supabase/migrations/004_budgets.sql`
5. `supabase/migrations/005_recurring_transactions.sql`
6. `supabase/migrations/006_savings_goals_alerts_settings.sql`
7. `supabase/migrations/007_profiles_insert_policy.sql` — **required for onboarding to work** (fixes "Cannot coerce" error)

## Install dependencies

```bash
cd talreo
npm install
```

## Environment variables

Create `.env` in project root:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from your [Supabase dashboard](https://supabase.com/dashboard) → Project Settings → API.

## Run the app

```bash
npm start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- Or scan QR code with Expo Go on device
