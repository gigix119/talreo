# Talreo — Product Architecture Blueprint

**Owner:** TALREO ARCHITECT (Chief Product Architect & Mobile UX Strategist)  
**Scope:** Product architecture, screen structure, information hierarchy, navigation patterns, mobile-first UX planning, feature decomposition, layout blueprints.  
**Out of scope:** Final UI implementation (→ TALREO UI), backend business logic (→ TALREO CORE), technical debugging.

---

## Product vision

Talreo must feel like:

- A **premium finance product** (Revolut / Copilot Money / modern banking analytics)
- **Data-first** — key numbers and trends before decorative elements
- **Trustworthy** — clear labels, consistent terminology, banking-style clarity
- **Clean and modern** — Apple-level clarity, fintech-quality mobile UX
- **Mobile-first** — optimized for one-handed use and fast scanning
- **Optimized for Polish users** — primary locale Polish; full UI in Polish when Polish is selected

This is **not** an admin dashboard or a generic SaaS panel. It is a **mobile-first personal finance app**.

---

## Design direction (visual references)

- **Large key financial numbers** at the top of relevant screens
- **Clear distinction** between: Przychody / Wydatki / Saldo / Przepływ netto
- **Compact but elegant** financial cards
- **Strong monthly and category-based analytics**
- **Readable charts** with sufficient contrast and labels
- **Compact transaction list** with grouping by date
- **Horizontal filter chips** — no tall filter blocks
- **Minimal sticky elements** — only what is necessary for context and primary action
- **High-trust banking-style** design; premium fintech experience

---

## Current problems (architecture responses)

| Problem | Architectural response |
|--------|-------------------------|
| Transactions: header/filters/summary too tall; only 1–2 transactions visible | List-dominated layout; compact sticky strip; horizontal chips; summary inline or one line |
| App feels desktop-oriented | All layouts defined mobile-first; tablet/desktop as responsive variants |
| Inconsistent UI hierarchy | Per-screen priority of information and “visible first” rules defined below |
| Language consistency broken | Localization rule: when Polish is selected, entire visible UI must be Polish (all keys, categories, insights) |
| Theme architecture weak | Theme system defined: system / light / dark with layers, typography, charts, status colors |

---

## Critical screen rules (summary)

- **Transactions:** List dominates; compact sticky header; search compact; filters = horizontal chips; summary minimal; FAB allowed; group by date.
- **Dashboard:** First visible = Przychody / Wydatki / Saldo; then budget snapshot, recent transactions, insights; no giant empty cards.
- **Budgets:** Compact category rows; progress bars; clear healthy / warning / exceeded states.
- **Analytics:** One of the strongest screens; prioritize trend, period comparison, category distribution, budget health, biggest expenses, insight summary; premium structure.
- **Goals:** Card layout with progress; fast actions: wpłać, wypłać, edytuj.
- **Profile:** Compact overview; access to recurring, export, settings; logout.
- **Settings:** Theme, language, notifications, default transaction type, start day of month.

---

# Screen blueprints

---

## 1. Dashboard

### 1.1 Purpose

Single-screen financial snapshot: current period totals, budget health, recent activity, and actionable insights. User should understand “where I am” in under 3 seconds.

### 1.2 Priority of information

1. **Highest:** Przychody, Wydatki, Saldo (current month or selected period) — one glance.
2. **High:** Budget snapshot (how many ok / warning / exceeded; optional top 3 categories).
3. **High:** Recent transactions (last 5–8 items) for continuity.
4. **Medium:** AI / smart insights (2–4 concise cards).
5. **Lower:** Secondary metrics (e.g. savings momentum, recurring due) — compact or in a short strip.

### 1.3 Mobile-first layout structure

- **Zone A — Key metrics strip (top, above fold)**  
  - Content: Przychody | Wydatki | Saldo (or Net flow).  
  - One row or two tight rows; large numbers, small labels.  
  - Sticky: optional (can scroll away on scroll-heavy devices to maximize content).

- **Zone B — Budget snapshot**  
  - Content: e.g. “X w normie · Y blisko limitu · Z przekroczone” + optional horizontal mini-cards for top budgets.  
  - Single compact block; tap → Budgets tab.

- **Zone C — Recent transactions**  
  - Content: List of 5–8 transactions, grouped by date (e.g. Dziś, Wczoraj, 9 mar).  
  - Compact rows: amount (emphasized), note/category, date.  
  - Tap → transaction detail (sheet/modal). “Zobacz wszystkie” → Transactions tab.

- **Zone D — Insights**  
  - Content: 2–4 insight cards (e.g. “Wydatki na Jedzenie +12% vs zeszły miesiąc”).  
  - Compact cards; tap → Analytics or relevant detail.

- **Zone E — Secondary (optional)**  
  - E.g. savings progress teaser, upcoming recurring — one short row or carousel.

### 1.4 Sticky vs scrollable

- **Sticky (optional):** Only a very compact app bar (title “Dashboard” + optional period selector). Key metrics (Zone A) can be sticky on small viewports or scroll with content to give more space to list/insights.
- **Scrollable:** Zone B, C, D, E in one vertical scroll. No nested vertical scrolls.

### 1.5 What must be visible first (above fold)

- Przychody, Wydatki, Saldo (or equivalent net flow).
- Start of budget snapshot or first budget chips.
- First 2–3 recent transactions or “Brak transakcji” + CTA.

### 1.6 Behavior by device

- **Mobile:** Single column; Zones A→B→C→D→E; key metrics at top; list and insights scroll.
- **Tablet:** Same order; possible 2-column for “metrics + budget” and “recent + insights” below.
- **Desktop:** Same information hierarchy; max content width; no extra sidebar; dashboard remains a focused snapshot, not a multi-panel admin.

### 1.7 Primary and secondary actions

- **Primary:** Open Transactions (from “Zobacz wszystkie”), Add transaction (FAB if global, or from Dashboard CTA).
- **Secondary:** Open Budgets (from snapshot), Open Analytics (from insight cards), Open Goals (if savings teaser present).

### 1.8 Collapse / expand

- Insight section: can show “2 of 4” with “Pokaż więcej” to expand remaining cards.
- Budget snapshot: can collapse to one line “X/Y/Z budżetów” with expand to show mini-cards.

### 1.9 Localization and theming

- All labels from i18n: Przychody, Wydatki, Saldo, Budżet, Transakcje, Cele, etc. Polish when locale = pl.
- Numbers and dates follow locale (PL: dd.mm.yyyy, space as thousand separator).
- Theme: background, card background, text primary/secondary from theme tokens; metrics use semantic colors (income/expense/neutral).

---

## 2. Transactions

### 2.1 Purpose

View, search, filter, and manage transactions. The **transaction list is the main content**; everything else supports finding and acting on list items.

### 2.2 Priority of information

1. **Highest:** The transaction list (grouped by date), with as many rows visible as possible.
2. **High:** Current filter state (period, type, category) so the user knows what they’re looking at.
3. **High:** Quick access to add transaction and to search.
4. **Medium:** Inline or one-line summary (e.g. “W tym miesiącu: −1 240 PLN”) — minimal height.
5. **Lower:** Multi-select and bulk actions — only when selection mode is on.

### 2.3 Mobile-first layout structure

- **Zone A — Compact header (sticky)**  
  - Content: Screen title “Transakcje” + optional one-line context (e.g. “Marzec 2026”) + single primary action (e.g. add icon) or rely on FAB only.  
  - Height: single app-bar line (or equivalent). No large subtitle block.

- **Zone B — Search (sticky or immediately below A)**  
  - Content: Single-line search field, placeholder e.g. “Szukaj w transakcjach”.  
  - Compact height; no multi-line search.

- **Zone C — Horizontal filter chips (sticky or high)**  
  - Content: Horizontally scrollable chips: Typ (Wszystkie / Wydatki / Przychody), Okres (Ten miesiąc / Ten tydzień / Ostatni miesiąc), Kategorie (top N + “Więcej”). Optional “Filtry” chip → filter sheet.  
  - One row only; chips wrap only if design explicitly allows a second row without growing height.

- **Zone D — Transaction list (dominant, scrollable)**  
  - Content: Virtualized list; sections by date (Dziś, Wczoraj, 10 mar 2026, …). Each row: amount (large, color by type), note/merchant, category, date.  
  - Optional: one compact summary line at top of list (e.g. “Przychody / Wydatki / Saldo” for current filters) that scrolls with the list or is a single sticky line above the list.  
  - Empty state: same zone; “Brak transakcji” + CTA add.

- **Zone E — Selection bar (conditional, sticky bottom)**  
  - Content: “N wybranych” + Delete, Change category, Cancel.  
  - Visible only in multi-select mode.

- **Zone F — FAB**  
  - Content: Floating “+” for Add transaction.  
  - Position: bottom-right above tab bar.

- **Zone G — Transaction detail**  
  - Content: Bottom sheet or modal (not full-screen push) for view/edit/delete.  
  - Dismiss returns to list.

### 2.4 Sticky vs scrollable

- **Sticky:** Zone A (compact header), Zone B (search), Zone C (chips). Optionally one summary line between C and D. Zone E when in selection mode.
- **Scrollable:** Zone D only (the list). List uses full remaining height; no inner ScrollView that contains header + filters + list together.

### 2.5 What must be visible first

- Title + search + at least 4–6 filter chips.
- **At least 6–8 transaction rows** (or equivalent for device height) without scrolling the list. This is the main success criterion for the Transactions layout.

### 2.6 Behavior by device

- **Mobile:** Sticky A+B+C; list fills rest; FAB bottom-right. Detail as sheet/modal.
- **Tablet:** Same; list can show more rows; chips may show more without scrolling.
- **Desktop:** Same hierarchy; list remains central; filters can sit in one row; no sidebar list.

### 2.7 Primary and secondary actions

- **Primary:** Add transaction (FAB or header), Open transaction (tap row), Search, Apply/change filters (chips).
- **Secondary:** Multi-select (long-press), Edit/Delete from detail sheet, Bulk delete/change category from selection bar.

### 2.8 Collapse / expand

- Filter chips: “Więcej kategorii” or “Filtry” opens a sheet with full category list and extra options; main screen stays compact.
- Summary: if present, one line; no expandable card.

### 2.9 Localization and theming

- All strings from i18n: Transakcje, Wydatki, Przychody, Szukaj…, Dziś, Wczoraj, date formats. Category names from localized source when locale = pl (e.g. Food → Jedzenie, Bills → Rachunki).
- Theme: list background, row background, borders, amount colors (income/expense), chip background/selected state from theme.

---

## 3. Budgets

### 3.1 Purpose

View monthly budgets by category, see progress (healthy / warning / exceeded), and quickly open add/edit.

### 3.2 Priority of information

1. **Highest:** Per-category budget rows with spent vs limit and progress state.
2. **High:** Overall status counts (ok / warning / exceeded).
3. **High:** Month selector (which month the data refers to).
4. **Medium:** Add budget and edit/delete per row.

### 3.3 Mobile-first layout structure

- **Zone A — Header + month (sticky)**  
  - Content: Title “Budżety”, month selector (e.g. “Marzec 2026” with chevrons or picker).  
  - One compact row.

- **Zone B — Overview strip**  
  - Content: e.g. “3 w normie · 1 blisko limitu · 0 przekroczonych” with optional tap-to-filter.  
  - Single line or small chips.

- **Zone C — Budget list (scrollable)**  
  - Content: One row per budget: category name + icon, “wydane / limit” (e.g. 800 / 1 000 PLN), progress bar (color: healthy / warning / exceeded), optional remaining amount.  
  - Rows compact; progress bar is the main visual indicator.

- **Zone D — Add budget**  
  - Content: “Dodaj budżet” button or FAB.  
  - Opens Add Budget modal.

### 3.4 Sticky vs scrollable

- **Sticky:** Zone A (header + month). Optionally Zone B.
- **Scrollable:** Zone C (list of budgets).

### 3.5 What must be visible first

- Month and overview strip.
- At least 4–5 budget rows without scrolling.

### 3.6 Behavior by device

- **Mobile:** Sticky header + month; list scrolls; tap row → detail/edit.
- **Tablet:** Same; more rows visible; optional two-column for detail when row selected.
- **Desktop:** Same hierarchy; list central; no sidebar.

### 3.7 Primary and secondary actions

- **Primary:** Change month, Add budget, Open budget detail (tap row).
- **Secondary:** Edit budget, Delete budget (from row or detail).

### 3.8 Collapse / expand

- Overview strip: optional expand to show which categories are in warning/exceeded.
- Rows: no collapse; optional “Show only warning/exceeded” filter.

### 3.9 Localization and theming

- Labels: Budżety, w normie, blisko limitu, przekroczone, Dodaj budżet, category names in Polish when locale = pl.
- Theme: progress bar colors (ok = success, warning = warning, exceeded = error/destructive); card/row backgrounds from theme.

---

## 4. Analytics

### 4.1 Purpose

Understand trends, compare periods, see category distribution, budget health, biggest expenses, and insight summary. This screen should feel **premium and highly useful**.

### 4.2 Priority of information

1. **Highest:** Main trend (e.g. income vs expense over time) — large, readable chart.
2. **High:** Period selector and optional comparison (e.g. this month vs last).
3. **High:** Category distribution (spending by category) — list or donut + list.
4. **High:** Budget health summary and biggest expenses.
5. **High:** Financial health score (single prominent card).
6. **Medium:** Smart insights list (concise, scannable).

### 4.3 Mobile-first layout structure

- **Zone A — Period & comparison (sticky or high)**  
  - Content: “Ten miesiąc” / “Ostatnie 3 miesiące” / “Ostatnie 12 miesięcy”; optional “Porównaj z poprzednim”.  
  - Compact row or chips.

- **Zone B — Main trend chart (scrollable)**  
  - Content: Full-width chart (line or area): Przychody, Wydatki, Saldo over time.  
  - Large enough for mobile; clear axis labels and legend.  
  - Primary visual focus of the screen.

- **Zone C — Category distribution**  
  - Content: Top categories by spend (amount + %); optional small donut at top.  
  - Tap category → category detail (sheet or drill-down).

- **Zone D — Financial health score**  
  - Content: Score 0–100, trend (up/down/flat), short explanation.  
  - One card; tap → explanation/suggestions if needed.

- **Zone E — Budget health + biggest expenses**  
  - Content: Budget status summary; list of 5–10 largest expenses (amount, note, category, date).  
  - Compact rows.

- **Zone F — Smart insights**  
  - Content: 3–6 insight cards (e.g. “Wydatki na Jedzenie +12%”, “Największy wydatek: …”).  
  - Tappable to relevant detail.

### 4.4 Sticky vs scrollable

- **Sticky:** Zone A (period selector) only, or A + minimal title.
- **Scrollable:** B through F in one vertical scroll. Chart and all blocks get enough space.

### 4.5 What must be visible first

- Period selector.
- Most of the main trend chart (or full chart on large phones).
- Start of category list or health score.

### 4.6 Behavior by device

- **Mobile:** Single column; chart full width; list and cards stack.
- **Tablet:** Chart can be larger; optional side-by-side “chart + category list” or “score + insights”.
- **Desktop:** Same hierarchy; max width for chart; no dashboard-style grid that dilutes focus.

### 4.7 Primary and secondary actions

- **Primary:** Change period, Compare periods, Tap category for detail, Tap health score for explanation.
- **Secondary:** Export (if in Analytics or Profile), Tap insight for drill-down.

### 4.8 Collapse / expand

- Insights: show 3 by default, “Pokaż więcej” for rest.
- Category list: show top 5 by default, “Wszystkie kategorie” to expand.
- Biggest expenses: show 5, expand to 10–15.

### 4.9 Localization and theming

- All labels and insight texts in Polish when locale = pl. Chart legend and axis labels localized.
- Theme: chart colors (income/expense/balance) from theme; score color (good/warning/bad); card and background from theme; charts must respect light/dark (contrast, grid lines).

---

## 5. Savings Goals

### 5.1 Purpose

View goals, see progress at a glance, and perform fast actions: wpłać (fund), wypłać (withdraw), edytuj (edit).

### 5.2 Priority of information

1. **Highest:** Goal cards with name, progress (%), current vs target amount, target date.
2. **High:** Status (active / completed / overdue) and quick actions.
3. **Medium:** Add goal entry point.

### 5.3 Mobile-first layout structure

- **Zone A — Header + summary (sticky)**  
  - Content: Title “Cele oszczędnościowe”, optional “X aktywnych · Y ukończonych” or total progress.  
  - One compact row.

- **Zone B — Goals list (scrollable)**  
  - Content: Card per goal: name, icon, progress bar or ring, “obecnie / cel” (e.g. 3 500 / 5 000 PLN), target date, status.  
  - Actions per card: Wpłać, Wypłać, Edytuj (icons or short labels).

- **Zone C — Add goal**  
  - Content: “Nowy cel” button or FAB.  
  - Opens Add Goal modal.

### 5.4 Sticky vs scrollable

- **Sticky:** Zone A.
- **Scrollable:** Zone B.

### 5.5 What must be visible first

- Header and at least 2 full goal cards (or 3 compact cards).

### 5.6 Behavior by device

- **Mobile:** Single column cards; actions on card or in overflow.
- **Tablet:** Same; possibly 2 columns for cards.
- **Desktop:** Same hierarchy; cards in grid or list.

### 5.7 Primary and secondary actions

- **Primary:** Wpłać (fund), Add goal, Open goal detail (tap card).
- **Secondary:** Wypłać, Edytuj, Usuń (from detail or overflow).

### 5.8 Collapse / expand

- Optional filter: Aktywne / Ukończone / Wszystkie.
- Cards: no collapse; detail in modal/sheet.

### 5.9 Localization and theming

- Labels: Cele oszczędnościowe, Wpłać, Wypłać, Edytuj, Nowy cel, aktywny, ukończony, category names in Polish.
- Theme: progress colors, card background, borders from theme.

---

## 6. Profile

### 6.1 Purpose

Account identity, access to recurring transactions, export, settings, and logout.

### 6.2 Priority of information

1. **Highest:** User identity (avatar, name, email).
2. **High:** Entry points: Ustawienia, Transakcje cykliczne, Eksport danych.
3. **High:** Logout.
4. **Lower:** Help, legal, version.

### 6.3 Mobile-first layout structure

- **Zone A — Identity (compact)**  
  - Content: Avatar, name, email, account type.  
  - Tap → edit profile if supported.

- **Zone B — Main links (list)**  
  - Content: Rows: Ustawienia aplikacji (→ Settings), Transakcje cykliczne (→ Recurring), Eksport danych (→ Export).  
  - Optional: Język, Powiadomienia (or these inside Settings).

- **Zone C — Support & account**  
  - Content: Pomoc, Wyloguj.  
  - Logout prominent but not the only element.

### 6.4 Sticky vs scrollable

- **Sticky:** Optional minimal bar (e.g. “Profil” title).
- **Scrollable:** Zone A, B, C in one short scroll.

### 6.5 What must be visible first

- Identity block and first 2–3 main links (Settings, Recurring, Export).

### 6.6 Behavior by device

- **Mobile:** Single column list.
- **Tablet / Desktop:** Same; possibly wider card for identity and two-column list.

### 6.7 Primary and secondary actions

- **Primary:** Open Settings, Open Recurring, Open Export, Logout.
- **Secondary:** Edit profile, Help.

### 6.8 Collapse / expand

- No mandatory collapse; list is short.

### 6.9 Localization and theming

- All labels in Polish when locale = pl: Profil, Ustawienia, Transakcje cykliczne, Eksport, Wyloguj.
- Theme: background, card, list row from theme.

---

## 7. Settings

### 7.1 Purpose

Configure theme, language, notifications, default transaction type, and start day of month. Single control center for app preferences.

### 7.2 Priority of information

1. **Highest:** Theme (system / light / dark), Language (Polski / English / …).
2. **High:** Notifications (on/off or per type).
3. **High:** Default transaction type (Wydatek / Przychód).
4. **High:** Start day of month (1–28).
5. **Lower:** Currency, other preferences.

### 7.3 Mobile-first layout structure

- **Zone A — Header**  
  - Content: Title “Ustawienia”, back to Profile.

- **Zone B — Sections (scrollable)**  
  - **Wygląd:** Motyw (System / Jasny / Ciemny).  
  - **Język:** Polski, English, …  
  - **Powiadomienia:** Przełączniki (np. budżet, cele, transakcje cykliczne).  
  - **Finanse:** Domyślny typ transakcji, Dzień rozpoczęcia miesiąca, Waluta.  
  - **Konto (optional):** Email, hasło, 2FA.

### 7.4 Sticky vs scrollable

- **Sticky:** Header with back.
- **Scrollable:** All sections.

### 7.5 What must be visible first

- Theme and Language at top; then Notifications and Finanse.

### 7.6 Behavior by device

- **Mobile:** Single column; standard settings list.
- **Tablet / Desktop:** Same; can use grouped list or two columns for labels/controls.

### 7.7 Primary and secondary actions

- **Primary:** Change theme, Change language, Toggle notifications, Set default type, Set start day.
- **Secondary:** Back to Profile, Save (if any async save).

### 7.8 Collapse / expand

- Sections can be accordions if many options; at minimum Theme and Language are always visible at top.

### 7.9 Localization and theming

- All option labels in Polish when locale = pl: Motyw, System, Jasny, Ciemny, Język, Polski, Powiadomienia, Domyślny typ transakcji, Wydatek, Przychód, Dzień rozpoczęcia miesiąca.
- Theme: Settings screen itself respects current theme; theme switcher shows system/light/dark options.

---

# Theme architecture

## Modes

- **System:** Follow OS (light/dark). App resolves to **light** or **dark** at runtime.
- **Light:** Force light theme.
- **Dark:** Force dark theme.

## Token layers (architecture)

Implementation is owned by TALREO UI; architecture defines what must be supported:

1. **Backgrounds**
   - `background.primary` — main screen background.
   - `background.secondary` — cards, sheets, modals.
   - `background.tertiary` — list rows, chips, inputs.
   - All must have sufficient contrast in light and dark.

2. **Typography**
   - `text.primary`, `text.secondary`, `text.tertiary` — hierarchy.
   - `text.inverse` — on colored backgrounds (e.g. FAB).
   - Font sizes and weights defined for: large numbers (metrics), body, captions, labels. Contrast ratios must meet accessibility in both themes.

3. **Borders**
   - `border.subtle` — list separators, card edges.
   - `border.focus` — focus rings (accessibility).

4. **Charts**
   - Income, expense, balance, neutral series colors must be defined for light and dark (no hardcoded hex that fails in dark).
   - Grid and axis lines: subtle in both themes.
   - Legend text uses `text.secondary`.

5. **Status colors**
   - Success (e.g. income, healthy budget, positive trend).
   - Warning (e.g. budget near limit).
   - Error / destructive (e.g. exceeded budget, negative trend).
   - Info.
   - Same semantic meaning in light and dark; luminance adjusted for background.

6. **Shadows**
   - Light theme: subtle shadows for elevation (cards, FAB).
   - Dark theme: prefer elevation via border/glow or very subtle light shadows so cards don’t disappear.

7. **Contrast**
   - All text and key UI elements must meet WCAG AA against their background in both light and dark. Architecture requires a contrast check for primary text and primary buttons.

---

# Localization architecture

## Rule

When **Polish (pl)** is selected, the **entire visible UI** must be in Polish. No mixed English/Polish labels or placeholders.

## Scope

- All screen titles, tab labels, buttons, links, placeholders, empty states, errors.
- Category names shown in the app (e.g. Food → Jedzenie, Bills → Rachunki, Shopping → Zakupy). These must come from localized strings or localized category list, not hardcoded English.
- Insights and AI-generated text: either generated in the user’s language or template strings with placeholders (e.g. `{category}`, `{percent}`) and labels in Polish.
- Date and number formats: follow locale (PL: dd.mm.yyyy, space as thousand separator, comma for decimals if applicable).

## Structure

- Single source of truth: e.g. `translations.pl`, `translations.en` (or equivalent). All user-facing strings keyed; no raw English in layout code.
- Default/primary locale: **pl**. Fallback: **en** when a key is missing for current locale.
- Settings: Language selector lists display names in their own language (Polski, English). Stored value (e.g. `pl`, `en`) drives which translation object is used app-wide.

## Example mappings (architecture requirement)

- Income → Przychody  
- Expense / Expenses → Wydatek / Wydatki  
- Savings Goals → Cele oszczędnościowe  
- Budget / Budgets → Budżet / Budżety  
- Food → Jedzenie  
- Bills → Rachunki  
- Shopping → Zakupy  
- Settings → Ustawienia  
- Export → Eksport  
- Recurring transactions → Transakcje cykliczne  

Product and implementation must ensure these (and all other) labels exist in `pl` and are used when locale is Polish.

---

# Navigation summary

- **Tabs (primary):** Dashboard, Transactions, Budgets, Analytics, Goals, Profile. One tap from anywhere.
- **Modals (secondary):** Add/Edit transaction, Add/Edit budget, Recurring, Add recurring, Add/Edit goal, Goal funds, Alerts, Export, **Settings**. Dismiss by back or gesture; no tab bar inside modals.
- **Deep links from Dashboard:** Transactions (recent “Zobacz wszystkie”), Budgets (snapshot), Analytics (insights), Goals (teaser).
- **Profile →** Settings, Recurring, Export; Logout → Welcome/auth.

---

# Document ownership and next steps

- **This blueprint** is the product and UX architecture reference. Changes to screen purpose, priority, layout zones, sticky/scroll rules, and theme/localization architecture are owned by **TALREO ARCHITECT**.
- **TALREO UI** implements: layout, components, styling, theme tokens, use of i18n keys.
- **TALREO CORE** implements: data, calculations, insights text generation, category lists; no UI or layout.
- **Implementation order** (suggested): Theme and i18n consistency first; then Transactions (list-dominated layout); then Dashboard and Analytics; then Budgets, Goals, Profile, Settings.
