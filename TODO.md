**Prüf-Ergebnis (Soll/Ist)**

**Phase 1 – MVP**
- `✅` Auth: Registrierung/Login/Passwort-Reset vorhanden  
  [login/page.tsx](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/(auth)/login/page.tsx)  
  [register/page.tsx](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/(auth)/register/page.tsx)  
  [reset-password/page.tsx](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/(auth)/reset-password/page.tsx)
- `✅` Rechnungen erstellen/bearbeiten/löschen  
  [new/page.tsx](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/(dashboard)/invoices/new/page.tsx)  
  [edit/page.tsx](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/(dashboard)/invoices/[id]/edit/page.tsx)  
  [page.tsx](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/(dashboard)/invoices/[id]/page.tsx)
- `✅` Kundenverwaltung speichern/bearbeiten  
  [customers/new/page.tsx](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/(dashboard)/customers/new/page.tsx)  
  [customers/[id]/page.tsx](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/(dashboard)/customers/[id]/page.tsx)
- `✅` PDF-Export  
  [InvoicePDF.tsx](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/components/invoices/InvoicePDF.tsx)
- `✅` Rechnung per E-Mail senden (inkl. PDF-Anhang)  
  [send/route.ts](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/api/invoices/[id]/send/route.ts)
- `✅` Status-System Entwurf→Gesendet→Bezahlt (plus zusätzliche Stati)  
  [types/index.ts](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/types/index.ts)
- `✅` Dashboard offen/überfällig  
  [dashboard/page.tsx](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/(dashboard)/dashboard/page.tsx)
- `✅` Stripe-Abo integriert (Free/Starter + weitere Pläne vorhanden)  
  [stripe/checkout/route.ts](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/api/billing/stripe/checkout/route.ts)

**Phase 2 – Retention & Automation**
- `✅` Automatisches Reminder-System (konfigurierbar via ENV)  
  [check-overdue/route.ts](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/api/cron/check-overdue/route.ts)
- `✅` Überfällig-Logik mit E-Mail-Trigger
- `✅` Zahlungshistorie pro Kunde  
  [customers/[id]/page.tsx](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/(dashboard)/customers/[id]/page.tsx)
- `✅` Durchschnittliche Zahlungsdauer sichtbar
- `✅` Professional-Plan technisch freigeschaltet

**Phase 3 – KI & Differenzierung**
- `✅` KI-Rechnungserstellung aus Projektbeschreibung  
  [invoice-draft/route.ts](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/api/ai/invoice-draft/route.ts)  
  [invoices/new/page.tsx](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/(dashboard)/invoices/new/page.tsx)
- `✅` Druck-Score integriert  
  [pressure.ts](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/lib/pressure.ts)
- `✅` Intelligente Reminder basierend auf Kundenverhalten  
  [check-overdue/route.ts](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/api/cron/check-overdue/route.ts)
- `✅` Business-Plan + Steuerexport  
  [export/tax/route.ts](C:/Users/FSOS/Documents/Projekte/InvoiceFlow/src/app/api/export/tax/route.ts)

---

## Was noch **offen** ist (Integration/Deployment, nicht Code)

Das System ist im Code integriert, aber produktiv funktionieren Payment/Mail/KI nur mit externer Einrichtung.

### 1. Stripe produktiv einrichten
1. In Stripe Produkte/Preise anlegen (`Starter`, optional `Professional`, `Business`).
2. ENV setzen:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_STARTER`
   - `STRIPE_PRICE_PROFESSIONAL`
   - `STRIPE_PRICE_BUSINESS`
3. Webhook auf Endpoint registrieren:  
   `POST /api/billing/stripe/webhook`
4. Empfohlene Events aktivieren:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### 2. PayPal Subscription einrichten
1. PayPal App erstellen (Sandbox/Live).
2. Billing Plans in PayPal anlegen (`Starter/Professional/Business`).
3. ENV setzen:
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_ENV` (`sandbox` oder `live`)
   - `PAYPAL_PLAN_ID_STARTER`
   - `PAYPAL_PLAN_ID_PROFESSIONAL`
   - `PAYPAL_PLAN_ID_BUSINESS`
4. Webhook auf Endpoint registrieren:  
   `POST /api/billing/paypal/webhook`
5. Relevante Events abonnieren:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.EXPIRED`

### 3. E-Mail (Resend) produktiv
1. `RESEND_API_KEY` setzen.
2. Eigene Versanddomain verifizieren.
3. `from`-Adresse in Mail-Routen von `onboarding@resend.dev` auf deine Domain umstellen (empfohlen).

### 4. Cron für automatische Reminder aktivieren
1. `CRON_SECRET` setzen.
2. Scheduler einrichten (z.B. Vercel Cron/extern), der regelmäßig aufruft:  
   `POST /api/cron/check-overdue`  
   Header: `Authorization: Bearer <CRON_SECRET>`
3. Optional konfigurieren:
   - `AUTO_REMINDER_INTERVAL_DAYS`
   - `AUTO_REMINDER_MAX_PER_RUN`

### 5. OpenAI für KI-Entwurf aktivieren
1. `OPENAI_API_KEY` setzen.
2. Ohne Key läuft Fallback-Heuristik (kein Ausfall, aber weniger Qualität).

### 6. Supabase-Projektvoraussetzungen prüfen
Sicherstellen, dass diese Tabellen/Spalten/RPC existieren und RLS sauber ist:
- `profiles` mit `plan`, `stripe_customer_id`, Firmendaten etc.
- `invoices` mit `status`, `items`, `tax_*`, `sent_at`, `paid_at`
- `customers`
- `reminders`
- RPC `increment_invoice_counter`
- RLS: nur `auth.uid() = user_id` (bzw. `id` bei profiles)

---

Wenn du willst, erstelle ich dir im nächsten Schritt eine konkrete **Supabase SQL-Migrationsdatei** (Tabellen, RLS, Policies, RPC) plus `.env.example`, damit alles 1:1 deploybar ist.