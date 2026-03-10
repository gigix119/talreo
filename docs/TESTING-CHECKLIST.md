# Talreo — Auth Testing Checklist

Use this checklist to verify the authentication flow end-to-end.

---

## Prerequisites

- [ ] Supabase project created
- [ ] Migration `001_profiles_and_rls.sql` applied (Supabase SQL Editor)
- [ ] Migration `002_profiles_extend.sql` applied (adds `onboarding_completed`, `avatar_url`, `currency`)
- [ ] Migration `003_categories_transactions.sql` applied (categories, transactions, RLS, default categories)
- [ ] Migration `004_budgets.sql` applied (budgets table, RLS)
- [ ] Migration `005_recurring_transactions.sql` applied (recurring_transactions, RLS)
- [ ] Migration `006_savings_goals_alerts_settings.sql` applied (savings_goals, alerts, user_settings, RLS)
- [ ] Migration `007_profiles_insert_policy.sql` applied (allows profile upsert for onboarding)
- [ ] `.env` configured with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Supabase URL Configuration:
  - Site URL: `http://localhost:8081`
  - Redirect URLs: `talreo://auth/callback`, `talreo://**`, `exp://192.168.*:8081/--/auth/callback`
- [ ] Auth → Providers → Email enabled
- [ ] `npm start` running (Expo dev server)

**Note:** If auth fails with invalid key, use the **anon public** key from Supabase Dashboard → Project Settings → API (not "publishable").

---

## 1. Sign up

| Step | Action | Expected result |
|------|--------|-----------------|
| 1.1 | Open app → Welcome → Get Started | Sign-up form |
| 1.2 | Enter email, password (min 6 chars), optional name | Fields accept input |
| 1.3 | Leave email or password empty → Create account | Error: "Email and password are required." |
| 1.4 | Enter password &lt; 6 chars → Create account | Error: "Password must be at least 6 characters long." |
| 1.5 | Valid email + password → Create account | If **Confirm email OFF**: redirect to Onboarding. If **Confirm email ON**: redirect to "Check your email" |
| 1.6 | Profile created in `profiles` table | Supabase Table Editor → `profiles` → row for new user with `id = auth.users.id` |

---

## 2. Verify email (if Confirm email is ON)

| Step | Action | Expected result |
|------|--------|-----------------|
| 2.1 | After sign-up, check inbox | Email from Supabase with confirmation link |
| 2.2 | Click link (desktop) | Opens browser → redirects to `talreo://auth/callback` or configured URL |
| 2.3 | Click link (mobile/Expo Go) | App opens, session set, redirect to Dashboard |
| 2.4 | Back to app → Sign in | Can sign in with same email/password |

---

## 3. Sign in

| Step | Action | Expected result |
|------|--------|-----------------|
| 3.1 | Welcome → Sign In | Sign-in form |
| 3.2 | Empty fields → Sign in | Error: "Email and password are required." |
| 3.3 | Wrong password | Error: "Invalid email or password." (or generic) |
| 3.4 | Valid email + password | Loading "Signing in...", redirect to Onboarding (if first time) or Dashboard |
| 3.5 | Profile tab (after onboarding) | Shows email, full name, currency |

---

## 4. Sign out

| Step | Action | Expected result |
|------|--------|-----------------|
| 4.1 | Profile tab → Sign out | Redirect to Welcome |
| 4.2 | Try to open `/(tabs)` directly | Redirect to Welcome (protected) |

---

## 5. Forgot password

| Step | Action | Expected result |
|------|--------|-----------------|
| 5.1 | Sign in screen → Forgot password? | Reset password form |
| 5.2 | Empty email → Send reset link | Error: "Email is required." |
| 5.3 | Valid email → Send reset link | "Check your email" success screen |
| 5.4 | Check inbox | Email with password reset link |

---

## 6. Reset password (via email link)

| Step | Action | Expected result |
|------|--------|-----------------|
| 6.1 | Click reset link in email | App opens (or browser) |
| 6.2 | On mobile/Expo Go | App opens at `/auth/callback`, session set, redirect to Dashboard |
| 6.3 | User is logged in | Can access tabs |
| 6.4 | Sign out → Sign in with **new** password | Sign in succeeds |

---

## 7. Session persistence

| Step | Action | Expected result |
|------|--------|-----------------|
| 7.1 | Sign in | Dashboard |
| 7.2 | Close app completely (kill process) | — |
| 7.3 | Reopen app | Still on Dashboard (session restored from SecureStore) |
| 7.4 | Sign out | Welcome |

---

## 8. Profile creation

| Step | Action | Expected result |
|------|--------|-----------------|
| 8.1 | Sign up with email + full name | — |
| 8.2 | Supabase Dashboard → Table Editor → `profiles` | Row with `id`, `email`, `full_name`, `account_type` |
| 8.3 | `full_name` matches sign-up input | ✓ |
| 8.4 | `account_type` = `individual` | ✓ |

---

## 9. Route protection

| Step | Action | Expected result |
|------|--------|-----------------|
| 9.1 | Not signed in → open app | Index → redirect to Welcome |
| 9.2 | Not signed in → navigate to `/(auth)/sign-in` | Sign-in screen |
| 9.3 | Not signed in → navigate to `/(tabs)` | Redirect to Welcome |
| 9.4 | Signed in + onboarding done → navigate to `/(auth)/sign-in` | Redirect to Dashboard |
| 9.5 | Signed in + onboarding done → navigate to `/(tabs)` | Dashboard |
| 9.6 | Signed in + onboarding not done → open app | Redirect to Onboarding |

---

## 10. Auth callback

| Step | Action | Expected result |
|------|--------|-----------------|
| 10.1 | Open app via `talreo://auth/callback` without tokens | Redirect to Welcome |
| 10.2 | Open app via password reset link (with tokens) | Session set, redirect to Onboarding or Dashboard |
| 10.3 | App in background, click reset link | App resumes, session set, redirect to Onboarding or Dashboard |

---

---

## 11. Onboarding

| Step | Action | Expected result |
|------|--------|-----------------|
| 11.1 | Sign up (new user) → Create account | Redirect to Onboarding screen |
| 11.2 | Onboarding: empty name → Continue | Error: "Please enter your name." |
| 11.3 | Onboarding: name &lt; 2 chars → Continue | Error: "Name must be at least 2 characters." |
| 11.4 | Onboarding: enter name, select PLN → Continue | Loading "Saving...", redirect to Dashboard |
| 11.5 | Supabase → `profiles` | `full_name`, `currency`, `onboarding_completed = true` |
| 11.6 | Sign out, sign in again | Redirect to Dashboard (no onboarding) |

---

## 12. Profile tab

| Step | Action | Expected result |
|------|--------|-----------------|
| 12.1 | Sign in, complete onboarding | Dashboard |
| 12.2 | Profile tab | Shows Email, Name, Currency |
| 12.3 | Sign out | Redirect to Welcome |

---

---

## 13. Categories

| Step | Action | Expected result |
|------|--------|-----------------|
| 13.1 | After onboarding, Supabase → `categories` | 8 rows per user (5 expense, 3 income) |
| 13.2 | Default expense: Food, Transport, Bills, Entertainment, Shopping | ✓ |
| 13.3 | Default income: Salary, Freelance, Other income | ✓ |
| 13.4 | RLS: user A cannot see user B's categories | Supabase → try query as different user |

---

## 14. Create transaction

| Step | Action | Expected result |
|------|--------|-----------------|
| 14.1 | Dashboard → Add | Add transaction modal |
| 14.2 | Select Expense, amount 100, category Food, note "Groceries" | Fields accept input |
| 14.3 | Empty amount → Save | Error: "Please enter a valid amount." |
| 14.4 | Amount 0 or negative → Save | Error: "Please enter a valid amount." |
| 14.5 | Valid data → Save | Loading "Saving...", modal closes, transaction appears on Dashboard |
| 14.6 | Transactions tab | Transaction listed with amount, note, date |
| 14.7 | Supabase → `transactions` | Row with correct `user_id`, `amount`, `type`, `category_id` |

---

## 15. Delete transaction

| Step | Action | Expected result |
|------|--------|-----------------|
| 15.1 | Transactions tab → × on a transaction | Transaction removed from list |
| 15.2 | Dashboard | Summary and recent list updated |
| 15.3 | Supabase → `transactions` | Row deleted |

---

## 16. Dashboard summary

| Step | Action | Expected result |
|------|--------|-----------------|
| 16.1 | Add income 1000, expense 300 | Dashboard shows Income 1000, Expense 300, Balance +700 |
| 16.2 | Currency matches profile (PLN, EUR, USD) | Amounts formatted correctly |
| 16.3 | "This month" | Only current month's transactions in summary |
| 16.4 | Recent transactions | Last 5 transactions |
| 16.5 | Empty state | "No transactions yet" + Add button |

---

## 17. RLS isolation

| Step | Action | Expected result |
|------|--------|-----------------|
| 17.1 | User A creates transaction | Visible only to user A |
| 17.2 | User B (different account) | Cannot see user A's transactions or categories |
| 17.3 | Supabase → run as user B: SELECT * FROM transactions | Only user B's rows |

---

## 18. Budgets

| Step | Action | Expected result |
|------|--------|-----------------|
| 18.1 | Budgets tab | List budgets for current month, or empty state |
| 18.2 | Add budget: category Food, month March 2026, amount 500 | Save succeeds, budget appears in list |
| 18.3 | Add budget for same category + month again | Upsert: updates existing budget (no duplicate) |
| 18.4 | Edit budget: change amount | Updated amount reflected |
| 18.5 | Delete budget (×) | Budget removed from list |
| 18.6 | Progress bar | Shows spent / limit, status: ok &lt;80%, warning 80–100%, exceeded &gt;100% |
| 18.7 | No income category budget | Cannot create budget for income category |
| 18.8 | Dashboard → Budget overview | Top 3–5 categories by usage; exceeded alert shown if any |

---

## 19. RLS isolation (budgets)

| Step | Action | Expected result |
|------|--------|-----------------|
| 19.1 | User A creates budget | Visible only to user A |
| 19.2 | User B (different account) | Cannot see or modify user A's budgets |
| 19.3 | Supabase → run as user B: SELECT * FROM budgets | Only user B's rows |

---

## 20. Recurring transactions

| Step | Action | Expected result |
|------|--------|-----------------|
| 20.1 | Transactions → Recurring | List of recurring transactions or empty state |
| 20.2 | Add recurring: Expense 100, Food, weekly, start 2026-01-01 | Save succeeds, appears in list |
| 20.3 | Edit recurring: change amount, frequency | Updated |
| 20.4 | Toggle Active off | Recurring inactive; no new transactions generated |
| 20.5 | Toggle Active on | Recurring active again |
| 20.6 | Delete recurring | Removed from list |
| 20.7 | Add recurring daily, start yesterday | Next dashboard focus: transaction generated |
| 20.8 | Multiple recurring | No duplicate transactions for same date |

---

## 21. Recurring catch-up generation

| Step | Action | Expected result |
|------|--------|-----------------|
| 21.1 | Add recurring weekly, start 2 weeks ago | On dashboard focus: missing weeks generated |
| 21.2 | Re-enter dashboard | No duplicate transactions |
| 21.3 | Recurring with end_date in past | No generation after end_date |

---

## 22. RLS isolation (recurring_transactions)

| Step | Action | Expected result |
|------|--------|-----------------|
| 22.1 | User A creates recurring | Visible only to user A |
| 22.2 | User B | Cannot see or modify user A's recurring |
| 22.3 | Supabase → SELECT * FROM recurring_transactions as user B | Only user B's rows |

---

## 23. Analytics

| Step | Action | Expected result |
|------|--------|-----------------|
| 23.1 | Analytics tab | Expense breakdown, Income breakdown, Monthly trend, Budget vs actual |
| 23.2 | Add transactions in categories | Pie charts reflect category amounts |
| 23.3 | 6 months of data | Monthly trend shows balance per month |
| 23.4 | Budget vs actual | Bar chart + list with budget/actual/percent |
| 23.5 | No data | Empty states with clear messages |

---

## 24. Monthly insights

| Step | Action | Expected result |
|------|--------|-----------------|
| 24.1 | Dashboard → Insights section | 2–4 dynamic insights |
| 24.2 | Top expense category | "X was your top expense category" |
| 24.3 | Budget exceeded | "You exceeded N category budgets" |
| 24.4 | Expense change | "You spent X% more/less than last month" |
| 24.5 | No data | Insights section hidden or minimal |

---

## 25. Budget vs actual (analytics)

| Step | Action | Expected result |
|------|--------|-----------------|
| 25.1 | Set budgets for categories | Budget vs actual shows budget vs spent |
| 25.2 | Percent used | Correct percentage per category |

---

## 26. Savings goals

| Step | Action | Expected result |
|------|--------|-----------------|
| 26.1 | Goals tab | List of goals or empty state |
| 26.2 | Add goal: name "Vacation", target 5000, current 0, target date | Save succeeds, appears in list |
| 26.3 | Edit goal: change target amount | Updated |
| 26.4 | Add funds: 500 | Current amount increases, progress bar updates |
| 26.5 | Withdraw funds: 200 | Current amount decreases |
| 26.6 | Add funds until current >= target | Goal marked completed, alert created |
| 26.7 | Target date in past, not completed | Status: overdue |
| 26.8 | Delete goal | Removed from list |

---

## 27. Alerts

| Step | Action | Expected result |
|------|--------|-----------------|
| 27.1 | Dashboard → bell icon | Opens alerts modal |
| 27.2 | Unread count | Badge shows unread count |
| 27.3 | Mark alert as read | Badge count decreases |
| 27.4 | Mark all as read | All marked read |
| 27.5 | Delete alert | Removed from list |
| 27.6 | Budget exceeded | Alert generated (no duplicate within 24h) |
| 27.7 | Goal completed | Alert generated |

---

## 28. Settings

| Step | Action | Expected result |
|------|--------|-----------------|
| 28.1 | Profile → Settings | Settings modal opens |
| 28.2 | Change theme (system/light/dark) | Saved |
| 28.3 | Change language (PL/EN) | UI language switches, saved |
| 28.4 | Change default transaction type | Saved |
| 28.5 | Change monthly start day | Saved |
| 28.6 | Restart app | Settings persisted |

---

## 29. RLS isolation (savings_goals, alerts)

| Step | Action | Expected result |
|------|--------|-----------------|
| 29.1 | User A creates goal/alert | Visible only to user A |
| 29.2 | User B | Cannot see or modify user A's goals/alerts |
| 29.3 | Supabase → SELECT * FROM savings_goals as user B | Only user B's rows |
| 29.4 | Supabase → SELECT * FROM alerts as user B | Only user B's rows |

---

## 30. Internationalization (i18n)

| Step | Action | Expected result |
|------|--------|-----------------|
| 30.1 | Settings → Language → English | UI switches to English |
| 30.2 | Settings → Language → Polski | UI switches to Polish |
| 30.3 | Restart app | Language persisted |
| 30.4 | Date format | Matches locale (pl-PL vs en-US) |
| 30.5 | Amount format | Matches locale |
| 30.6 | Default on first run | Polish |

---

## Quick smoke test (5 min)

1. Sign up → Sign in → Onboarding (name + currency) → Continue
2. Dashboard → Add → Expense 50, Food, "Lunch" → Save
3. Dashboard → Add → Income 1000, Salary, "March" → Save
4. Dashboard → verify Income, Expense, Balance
5. Transactions → delete one transaction
6. Budgets → Add budget: Food, 500 → Save → verify progress
7. Budgets → Add budget: Food, 500 → Save → verify progress
8. Transactions → Recurring → Add recurring: Salary 3000, monthly → Save
9. Analytics → verify charts and empty states
10. Goals → Add goal "Vacation" 5000 → Add funds 100
11. Profile → Settings → change language
12. Profile → Sign out

If all pass, auth + onboarding + categories + transactions + budgets + recurring + analytics + goals + alerts + settings + i18n are working correctly.

---

## 31. Demo data / starter experience

| Step | Action | Expected result |
|------|--------|-----------------|
| 31.1 | Sign up (new user) → Onboarding | Step 1: name + currency |
| 31.2 | Continue → Step 2 | Choice: "Start empty" vs "Load demo data" |
| 31.3 | Choose "Load demo data" | Loading demo…, redirect to Dashboard |
| 31.4 | Dashboard / Transactions / Budgets / Goals | Demo transactions, budgets, goals visible |
| 31.5 | Choose "Start empty" | Dashboard with no data |
| 31.6 | Re-enter onboarding (if possible) | Demo data loaded only once, no duplicates |
| 31.7 | Demo data belongs to current user | Only visible to that user (RLS) |

---

## 32. Empty states

| Step | Action | Expected result |
|------|--------|-----------------|
| 32.1 | Dashboard, no transactions | Empty state: "No transactions yet" + CTA |
| 32.2 | Transactions, no data | Empty state + Add transaction |
| 32.3 | Budgets, no budgets | Empty state + Create budget |
| 32.4 | Analytics, no data | Empty state + CTA |
| 32.5 | Goals, no goals | Empty state + Add goal |
| 32.6 | Alerts, no alerts | Empty state + Go to Dashboard |
| 32.7 | PL/EN | Empty state texts translated |

---

## 33. Export CSV

| Step | Action | Expected result |
|------|--------|-----------------|
| 33.1 | Profile → Export data | Export modal opens |
| 33.2 | Export Transactions CSV | File saved/shared, columns: date, type, category, amount, note |
| 33.3 | Export Budgets CSV | Columns: month, category, amount, spent, remaining, status |
| 33.4 | Export Goals CSV | Columns: name, target_amount, current_amount, remaining, status, target_date |
| 33.5 | Language PL | CSV column headers in Polish |
| 33.6 | Language EN | CSV column headers in English |

---

## 34. Export PDF

| Step | Action | Expected result |
|------|--------|-----------------|
| 34.1 | Profile → Export data → Monthly report PDF | PDF generated and shared |
| 34.2 | PDF content | Month, income, expense, balance, top categories, budget usage, goals |
| 34.3 | Language PL | PDF text in Polish |
| 34.4 | Language EN | PDF text in English |
| 34.5 | Month selection | Uses current month or selected month |

---

## 35. Transaction search and filters

| Step | Action | Expected result |
|------|--------|-----------------|
| 35.1 | Transactions → Search | Search by note (ilike) |
| 35.2 | Filter by type | All / Income / Expense |
| 35.3 | Filter by category | All / specific category |
| 35.4 | Filter by date range | From / To (YYYY-MM-DD) |
| 35.5 | Sort | Newest, Oldest, Amount desc, Amount asc |
| 35.6 | Clear filters | All filters reset |

---

## 36. Analytics month and trend range

| Step | Action | Expected result |
|------|--------|-----------------|
| 36.1 | Analytics → Select month | Last 12 months selectable |
| 36.2 | Change month | Breakdown, trend, budget vs actual update |
| 36.3 | Trend range | 3 / 6 / 12 months toggle |
| 36.4 | Change trend range | Trend chart updates |
| 36.5 | Loading states | "Loading..." shown while fetching |
| 36.6 | No data | Empty state with CTA |

---

## 37. Destructive action confirmations

| Step | Action | Expected result |
|------|--------|-----------------|
| 37.1 | Transactions → × on transaction | Confirm dialog: "Delete transaction?" |
| 37.2 | Confirm | Transaction deleted |
| 37.3 | Budgets → Delete budget | Confirm dialog: "Delete budget?" |
| 37.4 | Goals → Delete goal | Confirm dialog: "Delete goal?" |
| 37.5 | Recurring → Delete recurring | Confirm dialog: "Delete recurring transaction?" |
| 37.6 | Alerts → Delete alert | Confirm dialog: "Delete alert?" |
| 37.7 | Cancel | No action, modal closes |
| 37.8 | PL/EN | Dialog texts translated |

---

## 38. i18n in export

| Step | Action | Expected result |
|------|--------|-----------------|
| 38.1 | Settings → Language → PL | Export CSV/PDF with Polish column labels and text |
| 38.2 | Settings → Language → EN | Export CSV/PDF with English labels and text |
