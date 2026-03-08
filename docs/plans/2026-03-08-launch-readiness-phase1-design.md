# Launch Readiness Phase 1 — Design Doc

**Date:** 2026-03-08
**Status:** Approved

## Overview

Phase 1 addresses the 7 critical launch-blockers that must be resolved before Faktura can go live. Ordered by priority.

---

## 1. Error Boundaries

### Problem
No error boundaries exist. A single component crash (e.g. PDF rendering) takes down the entire app with no fallback.

### Solution
Create two error boundary files:

**`src/app/error.tsx`** — Global fallback:
- Client component with `"use client"`
- Shows "Etwas ist schiefgelaufen" with error message (in dev)
- "Erneut versuchen" button calls `reset()`
- "Zurück zur Startseite" link

**`src/app/(dashboard)/error.tsx`** — Dashboard fallback:
- Same pattern but with "Zurück zum Dashboard" link
- Styled with existing design system (glassCard, btn classes)

### Files
- NEW: `src/app/error.tsx`
- NEW: `src/app/(dashboard)/error.tsx`

---

## 2. AGB (Terms of Service)

### Problem
Legal requirement for SaaS in Germany. Completely missing.

### Solution
Create `src/app/agb/page.tsx` with standard German SaaS AGB covering:
- § 1 Geltungsbereich
- § 2 Vertragsschluss / Registrierung
- § 3 Leistungsbeschreibung
- § 4 Kostenlose und kostenpflichtige Pläne
- § 5 Zahlungsbedingungen
- § 6 Haftungsbeschränkung
- § 7 Datenschutz (Verweis auf /datenschutz)
- § 8 Kündigung
- § 9 Änderungen der AGB
- § 10 Schlussbestimmungen / Gerichtsstand

Add link in MarketingFooter and register page.

### Files
- NEW: `src/app/agb/page.tsx`
- EDIT: `src/components/layout/MarketingFooter.tsx` — add AGB link
- EDIT: `src/app/(auth)/register/page.tsx` — add AGB checkbox/hint

---

## 3. .env.example + Env-Validation

### Problem
No developer knows which env vars are required. Deployment can start with missing config and silently fail.

### Solution

**`.env.example`** — All variables with comments, no values:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
GROQ_API_KEY=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PROFESSIONAL=
STRIPE_PRICE_BUSINESS=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_ENV=sandbox
```

**`src/lib/env.ts`** — Runtime validation with Zod:
- Validate all required server-side vars on first import
- Throw descriptive error if any are missing
- Export typed `env` object

### Files
- NEW: `.env.example`
- NEW: `src/lib/env.ts`

---

## 4. Server-Side Plan Limit Enforcement

### Problem
`checkInvoiceLimit()` and `checkCustomerLimit()` are only called client-side in `invoices/new/page.tsx` and `customers/new/page.tsx`. A user can bypass these limits by calling the Supabase API directly.

### Solution
Since invoices are created client-side via Supabase SDK (not an API route), enforcement must happen via **Supabase RLS policy**:

Option A (recommended): Add a Supabase database function + RLS policy that checks the count before allowing INSERT.

Option B (simpler): Add a Next.js API route for invoice creation and enforce limits there, then have the client call the API instead of Supabase directly.

**Going with Option A** — SQL function:
```sql
CREATE OR REPLACE FUNCTION check_invoice_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  invoice_count INT;
  max_invoices INT;
BEGIN
  SELECT plan INTO user_plan FROM profiles WHERE id = NEW.user_id;

  IF user_plan = 'professional' OR user_plan = 'business' THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO invoice_count FROM invoices WHERE user_id = NEW.user_id;

  IF user_plan = 'starter' AND invoice_count >= 10 THEN
    RAISE EXCEPTION 'Invoice limit reached for Starter plan';
  END IF;

  IF (user_plan IS NULL OR user_plan = 'free') AND invoice_count >= 3 THEN
    RAISE EXCEPTION 'Invoice limit reached for Free plan';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_invoice_limit
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION check_invoice_limit();
```

Same pattern for customers table.

### Files
- NEW: `supabase/migrations/enforce_plan_limits.sql`
- Documentation only — SQL must be applied in Supabase dashboard or via CLI

---

## 5. Feedback Table RLS

### Problem
`getAllFeedback()` reads all feedback without user filtering. If RLS is not set on the feedback table, any authenticated user could theoretically read all feedback.

### Solution
Add RLS policies:
```sql
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own feedback
CREATE POLICY "Users insert own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read only their own feedback
CREATE POLICY "Users read own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id);
```

Admin access via `getAllFeedback()` uses `createServiceSupabaseClient()` which bypasses RLS — that's correct.

### Files
- NEW: `supabase/migrations/feedback_rls.sql`

---

## 6. Sentry Error-Tracking

### Problem
Zero visibility into production errors. If something breaks, nobody knows.

### Solution
- Install `@sentry/nextjs`
- Create `sentry.client.config.ts` and `sentry.server.config.ts`
- Add `SENTRY_DSN` to env vars
- Wrap `next.config.ts` with `withSentryConfig()`
- Automatic error capturing for unhandled exceptions

### Files
- EDIT: `package.json` — add @sentry/nextjs
- NEW: `sentry.client.config.ts`
- NEW: `sentry.server.config.ts`
- NEW: `sentry.edge.config.ts`
- EDIT: `next.config.ts` — wrap with withSentryConfig
- EDIT: `.env.example` — add SENTRY_DSN
- EDIT: `src/app/global-error.tsx` — Sentry global error page

---

## 7. Cookie-Banner

### Problem
DSGVO requires explicit consent for non-essential cookies/tracking.

### Solution
Simple cookie consent banner:
- Shows on first visit if no consent stored
- Two buttons: "Alle akzeptieren" / "Nur notwendige"
- Stores preference in localStorage
- If Sentry/Analytics added, only load after consent
- Minimal, non-intrusive bottom banner

### Files
- NEW: `src/components/CookieBanner.tsx`
- EDIT: `src/app/layout.tsx` — include CookieBanner

---

## Summary of Changes

| # | Item | Type | Priority |
|---|------|------|----------|
| 1 | Error Boundaries | 2 new files | Critical |
| 2 | AGB page | 1 new + 2 edits | Critical (legal) |
| 3 | .env.example + validation | 2 new files | Critical |
| 4 | Server-side plan limits | SQL migration | Critical (security) |
| 5 | Feedback RLS | SQL migration | Critical (security) |
| 6 | Sentry | 4 new + 2 edits + install | Important |
| 7 | Cookie Banner | 1 new + 1 edit | Important (legal) |

Note: PayPal webhook signature verification was already implemented. Auth rate-limiting is handled by Supabase SDK natively.
