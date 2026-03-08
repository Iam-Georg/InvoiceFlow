# Critical Security & Compliance Fixes — Design Document

**Date:** 2026-03-07
**Status:** Approved

## Scope

4 fixes, priority order:

### Fix 1: GoBD Invoice Lock
- **Problem:** Sent/paid/overdue invoices can be edited — violates German GoBD
- **Solution:** Defense-in-depth (Frontend + Backend)
  - Edit page: `useEffect` checks status → redirect if not `draft`
  - Detail page: hide "Bearbeiten" button for non-draft invoices
  - Edit page: remove status dropdown entirely (status only changes via actions)
  - Supabase: new RLS UPDATE policy requiring `status = 'draft'`
- **Files:** `invoices/[id]/edit/page.tsx`, `invoices/[id]/page.tsx`, new migration

### Fix 2: Server-Side Plan Limits
- **Problem:** Plan limits (maxInvoices, maxCustomers) only enforced client-side
- **Solution:** Pre-insert count check + toast with upgrade CTA
  - New `src/lib/plan-guard.ts` with `checkInvoiceLimit()` and `checkCustomerLimit()`
  - Integrated into `handleSave()` of new invoice and new customer pages
- **Files:** `plan-guard.ts` (new), `invoices/new/page.tsx`, `customers/new/page.tsx`

### Fix 3: PayPal Webhook Signature Verification
- **Problem:** Webhook accepts any POST without verifying it's from PayPal
- **Solution:** PayPal Verify Webhook Signature API
  - Read PayPal headers (transmission-id, transmission-time, cert-url, transmission-sig)
  - Get OAuth token from PayPal
  - Call PayPal verify-webhook-signature endpoint
  - Reject with 401 if verification fails
- **Files:** `api/billing/paypal/webhook/route.ts`
- **New ENV:** `PAYPAL_WEBHOOK_ID`

### Fix 4: Cron GET Removal
- **Problem:** Cron jobs accept GET requests — risk of accidental triggering
- **Solution:** Remove `export async function GET` from both cron routes
- **Files:** `api/cron/check-overdue/route.ts`, `api/cron/recurring-invoices/route.ts`

## Design Decisions
- GoBD: Complete lock (no storno/correction flow for now)
- Plan limits: Check only on creation, not on deletion
- All UI changes respect border-radius: 0 and CSS variable system
