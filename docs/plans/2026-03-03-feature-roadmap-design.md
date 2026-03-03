# Faktura Feature Roadmap Design

**Datum:** 2026-03-03
**Ansatz:** Revenue-First (Phase 1 → 2 → 3)

## Gap-Analyse

| Feature-Kategorie | Status |
|---|---|
| Custom PDF Template Builder | NICHT vorhanden |
| XRechnung/ZUGFeRD | NICHT vorhanden |
| Mehrsprachig/Mehrwährung | Flags existieren, keine Implementierung |
| Recurring Invoices | UI existiert, kein Backend |
| Eskalations-Mahnwesen | NICHT vorhanden |
| Client-Portal | NICHT vorhanden |
| DATEV-Export | NICHT vorhanden (nur einfacher CSV) |
| Cashflow-Prognosen | NICHT vorhanden |
| Zeiterfassung | NICHT vorhanden |
| Expense Tracking | NICHT vorhanden |

## Phase 1: Kernwert steigern (MUST)

### 1.1 Custom PDF Invoice Template Builder

**Datenmodell:**
- Supabase-Tabelle `invoice_templates`:
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → profiles)
  - `name` (text)
  - `is_default` (boolean)
  - `config` (jsonb)
  - `created_at`, `updated_at` (timestamptz)

**Template Config JSON:**
```json
{
  "colors": { "primary": "#2563eb", "secondary": "#64748b", "accent": "#f59e0b" },
  "font": "inter | roboto | merriweather",
  "logoUrl": null,
  "layout": "classic | modern | minimal",
  "showTaxId": true,
  "showPaymentInfo": true,
  "footerText": "Vielen Dank für Ihr Vertrauen!",
  "headerStyle": "full-width | split | centered"
}
```

**Seiten:**
- `/invoices/templates` — Template-Liste mit Thumbnails
- `/invoices/templates/new` — Editor mit Live-Preview (Split-View)
- `/invoices/templates/[id]` — Template bearbeiten

**Komponenten:**
- `TemplateEditor` — Farb-/Font-/Layout-Einstellungen
- `TemplatePreview` — Live PDF-Rendering via BlobProvider
- `InvoicePDF` refactored — akzeptiert `templateConfig` Prop
- Logo-Upload via Supabase Storage Bucket `logos`

**Plan-Gating:** Free: 1 Template, Starter: 3, Professional+: Unbegrenzt + Logo

### 1.2 Recurring Invoices Backend

**Datenmodell:**
- Supabase-Tabelle `recurring_schedules`:
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → profiles)
  - `customer_id` (uuid, FK → customers)
  - `template_invoice_id` (uuid, FK → invoices) — Vorlage-Rechnung
  - `interval` (text: monthly/quarterly/yearly)
  - `next_run_date` (date)
  - `active` (boolean)
  - `created_at` (timestamptz)

**API:**
- `/api/cron/recurring-invoices` — Cron-Job, erstellt Rechnungen wenn `next_run_date <= today`
- Kopiert Template-Rechnung, generiert neue Nummer, setzt neues Datum
- Berechnet nächsten `next_run_date` basierend auf Intervall
- Email an Nutzer bei Erstellung

**UI-Änderungen:**
- `/invoices/new` — Recurring-Select wird mit Backend verbunden
- Dashboard — Anzeige aktiver Recurring Schedules
- `/invoices` — Badge für "Wiederkehrend"

### 1.3 DATEV-Export

**Erweiterung von `/api/export/tax`:**
- Neuer Query-Parameter: `?format=datev`
- DATEV-Buchungsstapel-Format:
  - Umsatz (Brutto), S/H-Kennung, Konto (Debitor), Gegenkonto (Erlöskonto)
  - Belegdatum (TTMM), Buchungstext, Belegnummer
- Header-Zeile nach DATEV-Spezifikation
- Encoding: Windows-1252
- Dateiname: `EXTF_Buchungsstapel_YYYY.csv`

### 1.4 Funktionen-Seite aktualisieren

Neue Feature-Karten für Template Builder, Recurring Invoices, DATEV-Export auf `/funktionen`.

---

## Phase 2: Compliance & Professionalität (SHOULD)

### 2.1 XRechnung / ZUGFeRD

- XML-Generierung nach EN 16931 / UBL 2.1 Schema
- ZUGFeRD: PDF/A-3 mit eingebettetem XML
- Schematron-Validierung
- Neue Option beim Versand: "Als E-Rechnung"
- Leitweg-ID Feld im Kundenformular

### 2.2 Mehrsprachig & Mehrwährung

- Rechnungssprache: DE/EN/FR pro Rechnung
- Übersetzungstabelle für Rechnungstext-Labels
- Währung: EUR/USD/GBP/CHF
- Manuelles Wechselkurs-Feld

### 2.3 Eskalations-Mahnwesen

- 3 Mahnstufen: Erinnerung → Mahnung → Letzte Mahnung
- Verzugszinsen: Basiszinssatz + 5% (B2C) / + 9% (B2B)
- Automatische Eskalation (konfigurierbare Tage)
- Eigene Email-Templates pro Stufe
- `reminders.level` Spalte (1/2/3)

---

## Phase 3: Wachstum (NICE-TO-HAVE)

### 3.1 Client-Portal
- Öffentliche Seite `/portal/[token]`
- Token-basierter Zugang per Email
- PDF-Download, Zahlungsstatus
- Optional: Stripe Payment Links

### 3.2 Cashflow-Prognosen
- Dashboard: 30/60/90-Tage Forecast
- Basierend auf offenen Rechnungen + Recurring Schedules

### 3.3 Zeiterfassung
- Tabelle `time_entries`
- Timer-UI + "Rechnung aus Stunden erstellen"

### 3.4 Expense Tracking
- Tabelle `expenses`
- Kategorien, Belege, Integration in Steuer-Export

---

## Technische Entscheidungen

| Entscheidung | Wahl | Begründung |
|---|---|---|
| PDF-Library | @react-pdf/renderer (bestehend) | Bereits integriert, Template-Config als Props |
| Logo-Storage | Supabase Storage | Bereits als Dependency, kostenlos im Free-Tier |
| XRechnung XML | Eigene Generierung | Kein gutes npm-Paket, Schema ist dokumentiert |
| Cron-Jobs | Vercel/Railway Cron oder externer Trigger | check-overdue Pattern bereits etabliert |
| DATEV-Format | Server-side CSV-Generierung | Einfach, kein Extra-Dependency |
