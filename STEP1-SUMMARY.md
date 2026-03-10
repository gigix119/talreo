# Talreo — Step 1 Complete: Project Foundation

## What was built

### 1. Dependencies

| Package | Purpose |
|---------|---------|
| expo-router | File-based routing, Stack & Tabs |
| expo-constants | Env access |
| expo-linking | Deep linking |
| expo-secure-store | Auth token storage (Supabase session) |
| react-native-safe-area-context | Safe area insets |
| react-native-screens | Native nav performance |
| @supabase/supabase-js | Supabase client |
| babel-plugin-module-resolver | `@/*` path alias |

### 2. Commands

```bash
cd talreo
npm install
```

Create `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Run app:

```bash
npm start
```

### 3. Folder structure

```
talreo/
├── app/
│   ├── _layout.tsx          # Root layout (SafeArea, Stack)
│   ├── index.tsx            # Redirects to /welcome
│   ├── welcome.tsx          # First screen
│   ├── +not-found.tsx       # 404
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Bottom tabs
│   │   ├── index.tsx        # Dashboard
│   │   ├── transactions.tsx
│   │   ├── analytics.tsx
│   │   ├── goals.tsx
│   │   └── profile.tsx
│   ├── (modals)/
│   │   ├── _layout.tsx
│   │   └── add-transaction.tsx
│   └── onboarding/
│       ├── _layout.tsx
│       └── index.tsx
├── src/
│   ├── components/
│   │   ├── ui/              # Button, Card, Input
│   │   └── layout/          # ScreenContainer
│   ├── constants/           # config, theme
│   └── services/            # supabase client
├── .env.example
├── babel.config.js          # @/* alias
└── tsconfig.json            # paths config
```

### 4. Routing structure

- `/` → redirects to `/welcome`
- `/welcome` → first screen
- `/(auth)/sign-in`, `/(auth)/sign-up` → auth placeholders
- `/(tabs)` → main app (Dashboard, Transakcje, Analytics, Cele, Profil)
- `/(modals)/add-transaction` → modal
- `/onboarding` → onboarding placeholder

### 5. Supabase setup

- `src/services/supabase.ts` — single client instance
- Uses SecureStore for session persistence
- `src/constants/config.ts` — reads `EXPO_PUBLIC_*` env vars
- Client is `null` if env not set (no crash)

### 6. Theme & constants

- `src/constants/theme.ts` — colors, spacing, radius, typography, shadows
- Bright fintech style: #F2F2F7 background, #0A84FF primary, income/expense colors

### 7. Starter UI components

| Component | Location | Role |
|-----------|----------|------|
| ScreenContainer | layout/ | Safe area + padding |
| Button | ui/ | primary, secondary, ghost |
| Card | ui/ | Rounded container |
| Input | ui/ | Text input with label |

## Next steps (Step 2+)

- Step 2: Auth flow (sign-in, sign-up, session)
- Step 3: Dashboard (placeholders → real cards)
- Step 4: Transactions & add form
- etc.
