# FinTrack — Feature Roadmap

Potential features to add value for users, organized by impact.

---

## Feature Catalogue

### Recurring Transactions
Auto-log monthly bills, salary, and subscriptions. Users set a transaction to repeat (daily / weekly / monthly / yearly) and it gets logged automatically — no more manual entry every month.

**Management:** A dedicated list lets users control each recurring rule:
- **Pause** — temporarily stop logging (e.g. salary delayed this month)
- **Resume** — re-activate a paused rule
- **End** — set an end date (e.g. subscription cancelled on the 15th)
- **Delete** — remove the rule entirely

Each rule has a status (`active / paused / ended`) and an optional `ends_at` date. The auto-log job skips rules that are paused or past their end date.

### Budget Limits per Category
Set a monthly spending cap per category (e.g. max 5.000 MT on food). Show a visual progress bar and alert the user when approaching or exceeding the limit.

### Bill Reminders
Upcoming payment alerts via in-app notification or email. Reduces missed payments and late fees.

### M-Pesa / Mobile Money Tagging ✅
Label transactions by payment method (M-Pesa, e-Mola, mKesh, Banco, Dinheiro). Adds real local context for Mozambican users. Shown as a colored badge on each transaction row.

### CSV / PDF Export
Download a monthly or date-range statement. Useful for accountants, landlords, and loan applications.

### Spending Insights
Pattern detection without AI complexity — e.g. "You spent 23% more on food this month vs last month" or "Your top 3 spending categories this month."

### Year-over-Year Charts
Compare this April vs last April. Recharts already supports this with a `BarChart` — minimal new infrastructure needed.

### Net Worth Tracker
Simple assets (savings, property value) minus liabilities (loans, credit). One extra page that gives users a big-picture financial snapshot.

### Search & Filter on Transactions ✅
Search by description or notes. Filter by category, bucket, payment method, or income source. Client-side filtering — no extra server requests. "Limpar" button resets all filters.

### Dark Mode
Tailwind supports it natively with `dark:` classes. High user demand, low implementation cost.

### Goal Milestones
Notify the user when they hit 25%, 50%, and 75% of a savings goal. Keeps motivation high.

### Transaction Notes / Tags ✅
Free-text notes field per transaction. Shown as italic text below the description in the transaction list. Searchable via the filter bar.

---

## Implementation Phases

### Phase 1 — Core Usability ✅ Done
> Makes the app immediately more usable as data grows.

| Feature | Status |
|---|---|
| [Search & Filter on Transactions](#search--filter-on-transactions) | ✅ Done |
| [Transaction Notes / Tags](#transaction-notes--tags) | ✅ Done |
| [M-Pesa / Mobile Money Tagging](#m-pesa--mobile-money-tagging) | ✅ Done |

---

### Phase 2 — Active Budgeting ✅ Done
> Turns FinTrack from a ledger into a real budgeting tool.

| Feature | Status |
|---|---|
| [Budget Limits per Category](#budget-limits-per-category) | ✅ Done |
| [Spending Insights](#spending-insights) | ✅ Done |

---

### Phase 3 — Automation
> Drives daily retention — users come back because the app does work for them.

| Feature | Status |
|---|---|
| [Recurring Transactions](#recurring-transactions) | ⬜ Todo |
| [Goal Milestones](#goal-milestones) | ⬜ Todo |
| [Bill Reminders](#bill-reminders) | ⬜ Todo |

---

### Phase 4 — Reports & Analytics
> Valuable once users have enough data history.

| Feature | Status |
|---|---|
| [CSV / PDF Export](#csv--pdf-export) | ⬜ Todo |
| [Year-over-Year Charts](#year-over-year-charts) | ⬜ Todo |
| [Net Worth Tracker](#net-worth-tracker) | ⬜ Todo |

---

### Phase 5 — Polish
> Nice-to-have once the core is solid.

| Feature | Status |
|---|---|
| [Dark Mode](#dark-mode) | ⬜ Todo |

---

## Notes
- Currency: MT (Mozambican Metical)
- All features should follow the existing 50/30/20 rule split (Necessidades / Desejos / Economia)
- Mobile-first — most users likely on small screens
