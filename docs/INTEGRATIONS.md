# Integrations Setup Guide

Dieses Dokument beschreibt alle externen Integrationen, die fuer den produktiven Betrieb noetig sind.

## 1) Supabase (Pflicht)

### 1.1 Projekt anlegen
1. Neues Supabase Projekt erstellen.
2. In `Project Settings -> API` Werte kopieren:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 1.2 Schema + RLS deployen
1. SQL Editor oeffnen.
2. Inhalt von `supabase/migrations/20260227_001_init_invoiceflow.sql` ausfuehren.
3. Pruefen, dass vorhanden sind:
   - Tabellen: `profiles`, `customers`, `invoices`, `reminders`
   - Trigger: `on_auth_user_created`
   - Function: `increment_invoice_counter`
   - RLS auf allen Tabellen aktiv

### 1.3 Auth Redirects
In Supabase Auth URL Config folgende Redirect URL(s) freigeben:
- `http://localhost:3000/reset-password`
- `https://<deine-domain>/reset-password`

## 2) Stripe (Abo)

### 2.1 Produkte/Preise
In Stripe 3 Produkte mit recurring price anlegen:
- Starter
- Professional
- Business

Price IDs in `.env.local` setzen:
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_PROFESSIONAL`
- `STRIPE_PRICE_BUSINESS`

Zusatz:
- `STRIPE_SECRET_KEY`

### 2.2 Webhook
Endpoint:
- `POST https://<deine-domain>/api/billing/stripe/webhook`

Events abonnieren:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Webhook Secret setzen:
- `STRIPE_WEBHOOK_SECRET`

### 2.3 Test
1. In `Settings` Plan wechseln via Stripe.
2. Abschluss in Checkout.
3. Prüfen: `profiles.plan` wurde aktualisiert.

## 3) PayPal (Abo)

### 3.1 App + Plan IDs
1. PayPal App erstellen (Sandbox oder Live).
2. Billing Plans fuer Starter/Professional/Business anlegen.
3. In `.env.local` setzen:
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_ENV` (`sandbox` oder `live`)
   - `PAYPAL_PLAN_ID_STARTER`
   - `PAYPAL_PLAN_ID_PROFESSIONAL`
   - `PAYPAL_PLAN_ID_BUSINESS`

### 3.2 Webhook
Endpoint:
- `POST https://<deine-domain>/api/billing/paypal/webhook`

Events:
- `BILLING.SUBSCRIPTION.ACTIVATED`
- `BILLING.SUBSCRIPTION.UPDATED`
- `BILLING.SUBSCRIPTION.CANCELLED`
- `BILLING.SUBSCRIPTION.SUSPENDED`
- `BILLING.SUBSCRIPTION.EXPIRED`

### 3.3 Test
Checkout via PayPal in `Settings` starten und Rueckfluss in `profiles.plan` pruefen.

## 4) E-Mail (Resend)

### 4.1 API Key
Setzen:
- `RESEND_API_KEY`

### 4.2 Domain
1. Domain in Resend verifizieren.
2. In API-Routen den Sender von `onboarding@resend.dev` auf eigene Domain umstellen.

Betroffene Routen:
- `src/app/api/invoices/[id]/send/route.ts`
- `src/app/api/invoices/[id]/remind/route.ts`
- `src/app/api/cron/check-overdue/route.ts`

### 4.3 Test
1. Rechnung per E-Mail senden (inkl. PDF Attachment).
2. Reminder manuell senden.
3. Prüfen, ob Mail beim Empfaenger ankommt.

## 5) Cron (automatische Reminder)

### 5.1 Secret setzen
- `CRON_SECRET`

### 5.2 Scheduler einrichten
Endpoint:
- `POST https://<deine-domain>/api/cron/check-overdue`
Header:
- `Authorization: Bearer <CRON_SECRET>`

Empfehlung:
- taeglich 1x morgens (z. B. 08:00)

Optional:
- `AUTO_REMINDER_INTERVAL_DAYS`
- `AUTO_REMINDER_MAX_PER_RUN`

### 5.3 Test
1. Invoice mit vergangenem `due_date` anlegen.
2. Cron Endpoint manuell triggern.
3. Prüfen:
   - Status auf `overdue`
   - Reminder Eintrag in `reminders`
   - E-Mail Versand

## 6) OpenAI (KI-Entwurf)

Setzen:
- `OPENAI_API_KEY`

Endpoint:
- `POST /api/ai/invoice-draft`

Verhalten:
- Mit API key: Modell-basierter Entwurf.
- Ohne API key: heuristischer Fallback (funktioniert weiterhin).

## 7) Steuerexport (Business Plan)

Endpoint:
- `GET /api/export/tax?year=YYYY`

Bedingung:
- `profiles.plan = 'business'`

Wenn nicht Business:
- API liefert `403`.

## 8) Deployment Checklist

1. `.env.local` (oder Hosting Secrets) vollstaendig gesetzt.
2. Supabase Migration ausgefuehrt.
3. Stripe + PayPal Webhooks aktiv.
4. Resend Domain verifiziert.
5. Cron Scheduler aktiv.
6. `npm run lint` und `npm run build` erfolgreich.
