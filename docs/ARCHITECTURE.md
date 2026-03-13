# Talreo — Architecture & Product Structure

**Owner:** Chief Software Architect / TALREO ARCHITECT  
**Scope:** Application structure, screen hierarchy, navigation, feature planning, component boundaries.  
**Out of scope:** UI implementation (→ TALREO UI), business logic (→ TALREO CORE), styling, debugging.

**Interface language:** Polish (pl) as default; i18n must support Polish for all user-facing strings.

> **Product & UX blueprint:** For per-screen purpose, priority of information, mobile-first layout zones, sticky vs scrollable, actions, theme, and localization rules, see **[PRODUCT-ARCHITECTURE-BLUEPRINT.md](./PRODUCT-ARCHITECTURE-BLUEPRINT.md)**. That document is the authority for screen structure and UX; this document covers routes, navigation, and high-level component boundaries.

---

## 1. Application structure

### 1.1 Stack overview

- **Root:** `SafeAreaProvider` → `AuthProvider` → `I18nProvider` → Expo Router `Stack`.
- **Main app:** Tab navigator `(tabs)` with six tabs; modals and auth are stack siblings.
- **Auth/onboarding:** Dedicated groups `(auth)`, `onboarding`; no tabs until authenticated and onboarding complete.

### 1.2 Directory layout (app routes)

```
app/
├── _layout.tsx              # Root: providers + stack
├── index.tsx                # Entry: redirect to welcome / onboarding / (tabs)
├── welcome.tsx              # Landing (unauthenticated)
├── +not-found.tsx
├── (auth)/                  # Auth flows
│   ├── _layout.tsx
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   ├── check-email.tsx
│   ├── forgot-password.tsx
│   └── auth-loading.tsx
├── auth/
│   └── callback.tsx         # OAuth / magic link callback
├── onboarding/
│   ├── _layout.tsx
│   └── index.tsx
├── (tabs)/                  # Main app — tab bar
│   ├── _layout.tsx          # Tabs: Dashboard, Transactions, Budgets, Analytics, Goals, Profile
│   ├── index.tsx            # Dashboard
│   ├── transactions.tsx
│   ├── budgets.tsx
│   ├── analytics.tsx
│   ├── goals.tsx
│   └── profile.tsx
└── (modals)/                # Modal stack (add/edit, settings, etc.)
    ├── _layout.tsx
    ├── add-transaction.tsx
    ├── edit-transaction.tsx
    ├── add-budget.tsx
    ├── add-recurring.tsx
    ├── recurring.tsx
    ├── add-goal.tsx
    ├── goal-funds.tsx
    ├── alerts.tsx
    ├── export.tsx
    └── settings.tsx
```

---

## 2. Screen hierarchy

### 2.1 Canonical list

| Screen        | Route / access              | Role                          |
|---------------|-----------------------------|-------------------------------|
| Welcome       | `/` (unauthenticated)       | Landing, sign-in/sign-up CTA  |
| Sign-in       | `/(auth)/sign-in`            | Email/password auth           |
| Sign-up       | `/(auth)/sign-up`           | Registration                  |
| Check email   | `/(auth)/check-email`       | Post sign-up verification     |
| Forgot password | `/(auth)/forgot-password` | Password reset                |
| Auth loading  | `/(auth)/auth-loading`      | Session resolve               |
| Onboarding    | `/onboarding`               | First-time setup              |
| **Dashboard** | `/(tabs)` (index)           | Home: overview, quick actions |
| **Transactions** | `/(tabs)/transactions`   | List + filters, add, detail   |
| **Budgets**   | `/(tabs)/budgets`           | Budget list and management    |
| **Analytics** | `/(tabs)/analytics`         | Charts, insights, widgets     |
| **Savings Goals** | `/(tabs)/goals`         | Goals list, add, fund         |
| **Profile**   | `/(tabs)/profile`           | User menu, logout, deep links |
| **Settings**  | `/(modals)/settings`        | App settings (from Profile)   |
| Add transaction | `/(modals)/add-transaction` | Modal                         |
| Edit transaction | `/(modals)/edit-transaction?id=…` | Modal (navigation from list/detail) |
| Add budget    | `/(modals)/add-budget`      | Modal                         |
| Recurring     | `/(modals)/recurring`       | List; entry to add-recurring  |
| Add recurring | `/(modals)/add-recurring`   | Modal                         |
| Add goal      | `/(modals)/add-goal`        | Modal                         |
| Goal funds    | `/(modals)/goal-funds`      | Modal (fund a goal)           |
| Alerts        | `/(modals)/alerts`          | Modal                         |
| Export        | `/(modals)/export`          | Modal                         |

### 2.2 Screen groups

- **Primary surfaces (tabs):** Dashboard, Transactions, Budgets, Analytics, Savings Goals, Profile. One tap from anywhere in the app.
- **Secondary (modals):** Create/edit flows and utility screens (Settings, Export, Alerts, Recurring). Dismiss by back/gesture; no tab bar inside modals.
- **Auth/onboarding:** Linear flows; no tabs until user is authenticated and onboarding is complete.

---

## 3. Mobile-first navigation

### 3.1 Principles

1. **Tabs = primary navigation.** All main features (Dashboard, Transactions, Budgets, Analytics, Goals, Profile) are tabs. No nested tab bars.
2. **Modals = focused tasks.** Add/edit and utility screens are modals. One modal at a time; back or dismiss returns to the tab that opened it.
3. **No deep stacks.** Avoid stack depth beyond: Tab → Modal (and optionally Modal → Edit). No “modal from modal” unless explicitly required (e.g. Recurring → Add Recurring is acceptable).
4. **Consistent entry/exit.**  
   - Add transaction: FAB or CTA → `/(modals)/add-transaction` → `router.back()` on success.  
   - Edit: list or detail → `/(modals)/edit-transaction?id=…` → `router.back()` on save.  
   - Settings: Profile → `/(modals)/settings` → back.
5. **Replace, not push, for auth state.** Use `router.replace()` when switching between unauthenticated / onboarding / main app so the user cannot “back” into auth or onboarding.

### 3.2 Navigation map (summary)

- **Welcome** → Sign-in / Sign-up → (Auth loading) → Onboarding or `/(tabs)`.
- **Dashboard** → Transactions, Budgets, Analytics, Goals (tab switch); Add transaction, Alerts (modals).
- **Transactions** → Add transaction (modal), Edit transaction (modal).
- **Budgets** → Add budget (modal).
- **Goals** → Add goal (modal), Goal funds (modal).
- **Profile** → Recurring, Settings, Export (modals); Logout → Welcome.
- **Analytics** → Add transaction (modal) where relevant.

All modal exits: single back action or swipe-down (platform modal behavior).

---

## 4. Transactions screen — layout structure (redesign)

**Goal:** The transaction list must occupy **most of the screen**. Filters and summary must not dominate the viewport on mobile.

### 4.1 Current issue (structural)

- A single scroll contains both a sticky header block (title + search + filters) and, below it, summary card + list.
- The sticky block plus summary card reduce the visible area for the list; on small viewports the list gets a small “window.”

### 4.2 Target layout structure

- **Zone A — Minimal sticky strip (top)**  
  - **Responsibility:** Identity and primary filter only.  
  - **Content (structure):**  
    - One compact line: screen title (e.g. “Transakcje”) + single primary action (e.g. “Add” or FAB in header).  
    - Optional: one row of filter chips or a single “Filter” control that opens an overlay/drawer (not a large inline block).  
  - **Constraint:** Fixed height; no scroll. Should use the smallest vertical space that stays usable (e.g. safe area + one line of content + optional one line of chips).

- **Zone B — List (primary content)**  
  - **Responsibility:** Show the transaction list; occupies all remaining vertical space between Zone A and the tab bar (and FAB if present).  
  - **Content (structure):**  
    - One scrollable list (FlatList or equivalent) as the only scrollable content in the main area.  
    - Optional: a single collapsed/summary row at the top of the list (e.g. “Income / Expense this period”) that scrolls away with the list, OR a very compact sticky summary bar (one line) above the list.  
  - **Constraint:** List has dedicated vertical space; it is not inside a large ScrollView that also contains header + filters + summary card.  
  - **Empty/loading/error:** Full-bleed within Zone B (same area as the list).

- **Zone C — Selection bar (conditional)**  
  - **Responsibility:** Shown only in multi-select mode.  
  - **Content (structure):** One compact bar (e.g. “N selected” + actions + cancel).  
  - **Placement:** Overlay at bottom of content or inline above list; must not permanently reduce list height when not in use.

- **Zone D — FAB (optional)**  
  - **Responsibility:** Primary “Add transaction” action.  
  - **Placement:** Bottom-right, above tab bar; does not scroll.  
  - **Constraint:** Single FAB; no competing primary actions in the same screen.

- **Zone E — Detail (overlay)**  
  - **Responsibility:** Transaction detail (view/edit/delete).  
  - **Content (structure):** Bottom sheet or modal; not a full-screen route.  
  - **Constraint:** Does not change the layout of the list screen; closing returns focus to the list.

### 4.3 What moves or is removed from the main scroll

- **Search:** Either in the minimal sticky strip (compact field) or behind a “Search” chip that expands/focuses a search bar. Search results still render in Zone B (same list).  
- **Filters (type, date, category):** Collapsed into a single “Filters” control or a small chip row in Zone A. Full filter UI in an overlay, drawer, or bottom sheet so the main screen is not dominated by filter controls.  
- **Summary card (income/expense):** Either (a) a single compact line that scrolls with the list at the top of Zone B, or (b) a one-line sticky strip between Zone A and Zone B. It must not sit as a large card that permanently reduces list height.  
- **Selection bar:** Only when multi-select is active; see Zone C.

### 4.4 Component boundaries (Transactions)

- **Screen container:** Owns layout zones (A–E), safe area, and tab bar inset. Delegates to:  
  - **TALREO UI:** All visual layout (sizing, positioning, responsive behavior), styling, and animation of zones and components.  
  - **TALREO CORE:** Data (transactions, filters, summary), actions (add, edit, delete, multi-select), and navigation calls (`router.push` / `router.back()`).  
- **List:** Receives transactions and list-related props from CORE; UI renders rows, swipe actions, and list chrome.  
- **Detail:** Sheet/modal content and actions defined by CORE; presentation and gestures by UI.

Implementation of this layout is assigned to **TALREO UI**. Data and behavior are assigned to **TALREO CORE**.

---

## 5. Component relationships (high level)

### 5.1 By layer

- **Routes (app/):** Define screen hierarchy and navigation; they compose screens and pass navigation. No business logic; minimal “glue” (e.g. calling hooks that CORE provides).  
- **Screens (tabs + modals):** Orchestrate layout and composition. They use CORE hooks/services for data and actions and use UI components for all visuals.  
- **Feature components (e.g. transactions, analytics):** Live under `src/components/<feature>/`. They receive data and callbacks from screens (CORE); they do not own routing or API shape.  
- **UI primitives:** Under `src/components/ui/`. Used by feature components and screens; no business logic.  
- **Hooks / services:** Under `src/hooks/`, `src/services/`. Own data fetching, state, and business rules (CORE).  
- **i18n:** All user-facing strings go through `src/i18n`; Polish must be supported for every key.

### 5.2 Data flow (Transactions example)

1. **Screen** (`transactions.tsx`) mounts, uses CORE hook (e.g. `useTransactionsList`) for list data, filters, summary, and actions.  
2. **Screen** passes data and callbacks into **UI/components**: list props, filter state, onAdd, onEdit, onDelete, etc.  
3. **UI** renders Zone A–E; user interactions call back into screen handlers.  
4. **Screen** handlers call CORE (e.g. `deleteTransaction`, `refetch`) and navigation (`router.push` / `router.back()`).  
5. No UI component imports router or services directly; screen is the single place that connects CORE and navigation to UI.

---

## 6. Performance architecture (brief)

- **List virtualization:** Transaction list (Zone B) must use a virtualized list (e.g. FlatList) so only visible items are mounted.  
- **Modal cost:** Modals should mount content on open and avoid heavy work on initial app load.  
- **Tab persistence:** Use Expo Router / React Navigation defaults so tab state is preserved when switching tabs; avoid refetching full lists on every tab focus unless data freshness requires it (CORE can decide refetch policy).  
- **Images/assets:** Lazy-load and size appropriately for mobile; no large assets in critical path.

---

## 7. Summary of assignments

| Concern                    | Owner        |
|---------------------------|-------------|
| App structure, routes, navigation rules | Chief Software Architect |
| Transactions layout structure (zones A–E) | Chief Software Architect |
| Implementation of layout and styling   | TALREO UI   |
| Data, filters, actions, business rules | TALREO CORE |
| Polish (and other locales) in i18n     | TALREO CORE / product |

This document is the single source of truth for application structure, screen hierarchy, mobile-first navigation, and the Transactions screen layout structure. Implementation details and code remain with TALREO UI and TALREO CORE.
