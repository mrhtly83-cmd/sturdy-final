# Billing setup (Supabase + Stripe Payment Links)

This app supports three plans:
- Weekly: `$4.99 / week` — 10 scripts, no journal
- Monthly: `$9.99 / month` — 25 scripts + journal
- Lifetime: `$49.99 lifetime` — unlimited + all features

## 1) Supabase database

Run this SQL in Supabase → SQL Editor:

```sql
create table if not exists public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null check (plan in ('weekly', 'monthly', 'lifetime')),
  journal boolean not null default false,
  period_start timestamptz,
  period_end timestamptz,
  scripts_used integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;

create policy "entitlements_select_own"
on public.entitlements
for select
using (auth.uid() = user_id);
```

Notes:
- The app updates `scripts_used` server-side using the service role key.
- `period_end` is `NULL` for lifetime.

## 2) Vercel environment variables

### Required (Auth)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Required (Server usage enforcement + webhooks)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose to the browser)

### Stripe Payment Links (UI)
These are public URLs from Stripe Payment Links:
- `NEXT_PUBLIC_STRIPE_WEEKLY_LINK`
- `NEXT_PUBLIC_STRIPE_MONTHLY_LINK`
- `NEXT_PUBLIC_STRIPE_LIFETIME_LINK`

### Stripe webhook (server-only)
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_WEEKLY_PAYMENT_LINK_ID` (looks like `plink_...`)
- `STRIPE_MONTHLY_PAYMENT_LINK_ID`
- `STRIPE_LIFETIME_PAYMENT_LINK_ID`

## 3) Stripe setup

1. Create three Stripe Payment Links (weekly, monthly, lifetime).
2. Copy each Payment Link URL into the matching `NEXT_PUBLIC_STRIPE_*_LINK` env var.
3. Copy each Payment Link **ID** (`plink_...`) into the matching `STRIPE_*_PAYMENT_LINK_ID` env var.

## 4) Stripe webhook endpoint

In Stripe → Developers → Webhooks:
- Add endpoint: `https://sturdy-final.vercel.app/api/stripe/webhook`
- Subscribe to event: `checkout.session.completed`
- Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

Important:
- Users should sign in before purchasing so their Stripe checkout email matches their Supabase account email.

