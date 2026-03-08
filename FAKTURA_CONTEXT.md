# FAKTURA – Projekt-Kontext für Claude Code
Lies diese Datei komplett bevor du irgendetwas tust.

## Was ist Faktura?
Deutsches Rechnungs-SaaS für Freelancer. Früher "InvoiceFlow", umbenannt zu "Faktura".
Gebaut von einem deutschen Entwickler (kein Unternehmen, Privatperson).

## Tech Stack
- Next.js 14 App Router, TypeScript
- Supabase (Auth + PostgreSQL + RLS)
- Tailwind CSS + eigenes Design System (globals.css)
- lucide-react für Icons
- @react-pdf/renderer für PDF Export
- Resend für E-Mails
- sonner für Toast-Notifications
- recharts für Statistik-Charts
- Inter via next/font/google

## Projektpfad
C:/Users/FSOS/Documents/Projekte/InvoiceFlow

## Supabase
- URL und Keys sind in .env.local konfiguriert
- Tabellen: profiles, customers, invoices, reminders, feedback
- RLS aktiviert auf allen Tabellen
- Trigger: handle_new_user() → erstellt Profil bei Registrierung
- RPC: increment_invoice_counter(user_id_input)
- createClient() ist ein Singleton in src/lib/supabase.ts
- profiles hat Feld "plan" (PlanId: "free" | "starter" | "professional" | "business")

## Auth Flow
- Login/Register in src/app/(auth)/
- Dashboard Guard in src/app/(dashboard)/layout.tsx (client-side)
- proxy.ts macht NICHTS (absichtlich leer – Server kennt Session nicht)
- Session liegt im localStorage via @supabase/supabase-js
- KEIN Middleware (middleware.ts darf NICHT existieren – Konflikt mit proxy.ts)

## Design System – KRITISCH
### Philosophie
- PayPal iOS App feeling
- Zero border-radius ÜBERALL – border-radius: 0 auf ALLEM – KEINE Ausnahmen
- Floating cards via Schatten, keine Borders
- Sidebar links, Content rechts
- Dot-Grid Textur im Hintergrund

### CSS-Variablen (NUR diese verwenden!)
- Texte: --text-1 (primary), --text-2 (secondary), --text-3 (muted/placeholder)
- Hintergründe: --bg, --bg-2, --surface, --surface-2
- Farben: --accent, --accent-hover, --accent-soft, --success, --warning, --danger
- Status-Hintergründe: --success-bg, --warning-bg, --danger-bg
- Rahmen: --border, --divider (für inline-Trennlinien in Cards)
- Schatten: --shadow-sm, --shadow-md, --shadow-lg, --shadow-hover
- Animationen: --ease-out, --ease-in-out, --ease-spring, --ease-smooth
- Dauer: --duration-fast (120ms), --duration-normal (220ms), --duration-slow (380ms)

### VERBOTENE CSS-Variablen (existieren nicht!)
- ~~var(--text-primary)~~ → var(--text-1)
- ~~var(--text-secondary)~~ → var(--text-2)
- ~~var(--text-muted)~~ → var(--text-3)
- ~~var(--card)~~ → card-elevated CSS-Klasse
- ~~var(--radius)~~ → 0 (kein border-radius)
- ~~var(--foreground)~~ → var(--text-1)
- ~~var(--muted-foreground)~~ → var(--text-2)
- ~~var(--background)~~ → var(--surface) oder var(--bg)

### CSS-Klassen (aus globals.css)
- .card-elevated → weißes Card mit Shadow
- .card-hover → translateY(-2px) on hover
- .label-caps → Uppercase Labels (11px, 600, letterSpacing)
- .btn, .btn-primary, .btn-secondary, .btn-ghost → Buttons
- .invoice-row → Rechnungszeilen mit hover-Indikator
- .anim-fade-in-up, .anim-delay-1/2/3/4 → Einstiegsanimationen
- .anim-delay-80/160/240 → Stagger-Animationen
- .page-enter → Seiteneinstiegsanimation
- .dropdown-enter → Dropdown-Einblendung
- .accordion-trigger, .accordion-content, .accordion-chevron → Accordion
- .floating-sidebar, .floating-sidebar-wrap → Sidebar Layout
- .sidebar-nav-item → Nav-Link in Sidebar
- .topnav-new-btn → "Neue Rechnung" Button im TopNav

### Recharts Styling
- KEIN border-radius auf Bar-Charts (radius prop weglassen!)
- Chart-Farben als Hex (CSS-Vars funktionieren nicht in SVG-Attributen):
  - accent: #0040CC, danger: #CC2020, success: #00A060, warning: #CC7000
  - text-3: #9898AA, border: rgba(0,0,0,0.07)
- Tooltip mit contentStyle: { borderRadius: 0, ... }
- CartesianGrid: stroke="rgba(0,0,0,0.04)", vertical={false}

### Layout
- Sidebar: fixed, left 16px, top 16px, bottom 16px, width 220px
- Content: padding-left = 16 + 220 + 16 = 252px
- TopNav: fixed, über Content, floating via shadow

## Plan-System
- src/lib/plans.ts → PlanId, PLAN_FEATURES, PLAN_ORDER, hasPlan()
- src/hooks/usePlan.ts → usePlan() Hook (lädt plan aus profiles)
- src/components/LockedFeature.tsx → Wrapper für gesperrte Features
- src/components/UpgradeModal.tsx → Upgrade-Modal mit /billing Link
- Pläne: free (5 Rechnungen, 3 Kunden), starter (9€), professional (19€), business (39€)

## Besondere Features (Differenzierungsmerkmale)
- **Zahlungsdruck-Score** (Pressure Score): src/lib/pressure.ts → 0-100 basierend auf Überfälligkeit, Mahnanzahl, Kundenzuverlässigkeit, Betrag
- **Business Health Score**: Dashboard-Widget, berechnet aus Einzugsquote, Zahlungsgeschwindigkeit, Überfälligkeitsquote (0-100, Gut/Aufmerksamkeit/Kritisch)
- **KI-Rechnungserstellung**: /api/ai/invoice-draft → Groq LLM + Heuristik-Fallback
- **Tastenkürzel**: KeyboardShortcuts.tsx im Dashboard-Layout (? öffnet Hilfe, N/K/D/R/S navigieren)
- **Feedback-System**: FeedbackWidget.tsx (floating button) + /support Seite + /admin Panel
- **Rechnung-Import**: 3-Step-Wizard mit Schnell/Vollständig/PDF-Modi

## Supabase Singleton Pattern (PFLICHT in Client-Komponenten)
```tsx
const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
function getSupabase() {
  if (!supabaseRef.current) supabaseRef.current = createClient();
  return supabaseRef.current;
}
```
NIEMALS createClient() direkt im Komponentenkörper aufrufen!

## Marketing-Seiten (öffentlich, kein Auth)
- src/app/page.tsx – Homepage (auth-aware Hero, "use client")
- src/app/funktionen/page.tsx – Features (Server Component, hat Metadata)
- src/app/preise/page.tsx – Preise (Server Component, hat Metadata)
- src/app/ueber-uns/page.tsx – Über uns (Server Component, hat Metadata)
- src/app/impressum/page.tsx, src/app/datenschutz/page.tsx
- src/components/layout/MarketingHeader.tsx – Shared Header (sliding indicator)
- src/components/layout/MarketingFooter.tsx – Shared Footer

## Was funktioniert (vollständig implementiert)
- Auth (Login, Register, Logout, Passwort-Reset)
- Dashboard mit Stats + Business Health Widget + Revenue Chart
- Rechnungen (Liste, Erstellen, Bearbeiten, Detail, Löschen, Als bezahlt markieren)
- PDF Download (@react-pdf/renderer)
- E-Mail senden via Resend (mit anpassbaren Templates)
- Automatische Erinnerungen via /api/cron/check-overdue
- Kundenverwaltung (Liste, Erstellen, Detail mit Accordion)
- Statistiken mit recharts (12-Monate Trend, Statusverteilung, Aging)
- Settings (Profil, Unternehmen, Rechnungsstandards)
- Billing (/billing) – Plan-Anzeige, Upgrade-Layout
- Dark Mode Toggle
- Feedback-Widget + Support-Seite + Admin-Panel (/admin)
- Plan-System mit LockedFeature + UpgradeModal
- Accordion in Rechnung/Kunden (plan-basiert)
- Invoice Import (3-Step-Wizard)
- Keyboard Shortcuts
- SEO-Metadata (Root Layout + per-Page für Marketing-Seiten)

## Was noch fehlt / offen ist
- Lemon Squeezy / Stripe Payment (Code vorhanden, ENV-Keys fehlen)
- Vercel Deployment
- Eigene E-Mail-Domain für Resend (statt onboarding@resend.dev)
- Groq API Key für KI-Features (GROQ_API_KEY in .env.local)

## Externe Services Status
- Supabase: ✅ konfiguriert und läuft
- Resend: ✅ konfiguriert (onboarding@resend.dev → eigene Domain empfohlen)
- Stripe: ⏳ Code vorhanden, ENV fehlt
- Lemon Squeezy: ⏳ geplant
- Groq: ⏳ optional (Heuristik-Fallback aktiv)
- Vercel: ⏳ steht aus

## Wichtige Regeln beim Entwickeln
1. border-radius: 0 IMMER – keine Ausnahmen, auch nicht in recharts
2. Nur CSS-Variablen aus der "Erlaubten" Liste oben nutzen
3. Supabase IMMER als Singleton (useRef Pattern)
4. Alle UI-Texte auf Deutsch
5. Nie middleware.ts erstellen (Konflikt mit proxy.ts)
6. Recharts: kein radius prop auf Bar, Hex-Farben statt CSS-Vars

## Architektur-Muster
- Marketing-Seiten: MarketingHeader + MarketingFooter, paddingTop: "58px" auf main
- Dashboard-Seiten: Sidebar + TopNav, kein Header
- Server Components können export const metadata = {} haben
- "use client" pages können keine Metadata exportieren → Root Layout für Homepage
- Admin: client-seitige Auth-Prüfung (ADMIN_USER_ID in /admin/page.tsx)
