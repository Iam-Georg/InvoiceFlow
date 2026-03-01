# InvoiceFlow

InvoiceFlow ist ein Next.js 14/16 App-Router Projekt fuer Rechnungsverwaltung mit Supabase, Stripe, PayPal, E-Mail Versand, Reminder-Automation und KI-Entwurf.

## Quick Start

1. Abhaengigkeiten installieren
```bash
npm install
```

2. Umgebungsvariablen anlegen
```bash
cp .env.example .env.local
```

3. Supabase Schema einspielen  
Migration: `supabase/migrations/20260227_001_init_invoiceflow.sql`

4. Dev-Server starten
```bash
npm run dev
```

## Integrations-Setup

Eine vollstaendige Schritt-fuer-Schritt Anleitung fuer alle externen Integrationen findest du hier:

- [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md)

## Build & Checks

```bash
npm run lint
npm run build
```
