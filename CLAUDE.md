# Faktura — Claude Code Kontext

## Was ist Faktura?
Rechnungssoftware für deutsche Freelancer. Positionierung: **schnellstes und einfachstes Rechnungstool auf dem deutschen Markt.** Nicht Buchhaltung (kein lexoffice-Klon) — reines, fokussiertes Invoicing.

Alleinstellungsmerkmale:
- **KI-Rechnungsentwurf** (Groq API): Projektbeschreibung in Freitext → fertige Rechnung. Kein anderes Tool hat das.
- **Keyboard Shortcuts** für Power-User
- **Modernes Design** (2025, dark mode, clean)
- **DATEV-Export** für den Steuerberater
- **Automatische Mahnungen** via Cron

## Tech Stack
- **Framework:** Next.js 16 (App Router), React 19
- **Auth + DB:** Supabase (Postgres, RLS, Supabase Auth)
- **Styling:** Tailwind CSS v4 + eigene CSS-Variablen (kein Tailwind-only!)
- **UI-Komponenten:** Radix UI + shadcn (nur wo nötig)
- **PDF:** @react-pdf/renderer
- **E-Mail:** Resend
- **KI:** Groq API (llama-3.3-70b) mit heuristischem Fallback
- **Billing:** Stripe + PayPal (Code vorhanden, noch nicht live)
- **Monitoring:** Sentry
- **Charts:** Recharts
- **Hosting:** Vercel (Ziel), aktuell Railway (Testumgebung)

## Dev Commands
```bash
npm run dev       # Lokaler Dev-Server
npm run build     # Produktions-Build
npm run lint      # ESLint
```

## Projektstruktur
```
src/
  app/
    (auth)/         # Login, Register, Reset Password
    (dashboard)/    # Dashboard, Invoices, Customers, Settings, Billing, Statistics
    api/            # Route Handlers (billing, ai, cron, account, invoices, templates)
    fuer/[slug]/    # Branchen-Landingpages (15 Industries)
    page.tsx        # Marketing Homepage
    preise/         # Preisseite
    funktionen/     # Features-Seite
  components/
    ui/             # shadcn Basis-Komponenten
    invoices/       # Invoice-spezifische Komponenten
    layout/         # Sidebar, Topbar, MarketingHeader, MarketingFooter
  lib/
    supabase.ts          # Client-side Supabase
    supabase-server.ts   # Server-side Supabase
    plans.ts             # Plan-Feature-Guards
    pressure.ts          # Zahlungsdruck-Score (wird evtl. entfernt)
    billing.ts           # Stripe/PayPal Helpers
    email-templates.ts   # E-Mail Vorlagen
  types/index.ts          # Alle zentralen Typen + Plan-Definitionen
  data/industries.ts      # 15 Branchen-Definitionen für SEO-Seiten
```

## Design System
Faktura nutzt **CSS Custom Properties** (in `globals.css`) statt reines Tailwind.

Wichtige Variablen:
```css
--bg, --surface, --surface-2    /* Hintergründe */
--text-1, --text-2, --text-3    /* Textebenen */
--accent, --accent-soft          /* Blau #0040CC */
--border, --divider              /* Rahmen */
--success, --warning, --danger   /* Status-Farben */
--shadow-sm, --shadow-md, --shadow-lg
```

Button-Klassen: `btn`, `btn-primary`, `btn-secondary`, `btn-ghost`
Label-Klassen: `label-caps`, `card-label`
Animation: `anim-fade-in-up`, `anim-delay-1..4`, `reveal-stagger`

**Wichtig:** Styles primär über CSS-Variablen und Inline-Styles schreiben — nicht Tailwind-Klassen erfinden.

## Pläne & Preise
| Plan | Preis | Status |
|------|-------|--------|
| Free | kostenlos | live |
| Starter | 9 €/Mo | NOCH NICHT LIVE |
| Professional | 19 €/Mo | NOCH NICHT LIVE |
| Business | 39 €/Mo | NOCH NICHT LIVE |

Achtung: Inkonsistenz zwischen `types/index.ts` (free: 5 Invoices) und `preise/page.tsx` (3/Monat) — muss synchronisiert werden.

## Bekannte Defekte / Launch-Blocker
1. Bezahlpläne nicht live (Stripe/Lemon Squeezy nicht eingerichtet)
2. Steuerexport (DATEV/CSV) funktioniert nicht korrekt
3. Groq API Key fehlt → KI-Features inaktiv (heuristic fallback aktiv)
4. Hosting: Railway → Vercel Migration ausstehend
5. Supabase Production-Setup (E-Mail-Verifizierung, RLS-Audit) nicht abgeschlossen
6. Kein Gewerbe/Unternehmen angemeldet (blockiert Stripe)

## Coding-Konventionen
- **TypeScript strict** — keine `any`
- **Server Components** wo möglich, Client Components nur wo nötig (`"use client"`)
- **Supabase RLS** — alle Tabellen müssen Row Level Security haben
- Keine unnötigen Abstraktionen — YAGNI
- Keine neuen npm-Pakete ohne Grund
- Fehlerbehandlung an API-Routen immer mit korrekten HTTP-Status-Codes
- Keine hardcodierten Strings für User-Daten — alles aus der DB

## Was NICHT zu tun ist
- Scores nicht weiter ausbauen (Zahlungsdruck-Score, Business Health Score gelten als Spielerei — können entfernt oder vereinfacht werden)
- Keine vorzeitigen Abstraktionen
- Keine Features hinzufügen, die nicht explizit gefragt wurden
- Keine `console.log`-Statements in Production-Code
- Nicht über CSS-Framework diskutieren — das Design-System bleibt wie es ist
