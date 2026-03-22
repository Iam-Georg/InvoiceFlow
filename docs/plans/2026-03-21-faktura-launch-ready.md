# Faktura Launch-Ready — Implementierungsplan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Faktura von einem provisorischen Testprodukt zu einem produktionsreifen, monetarisierten SaaS machen — erster zahlender Kunde in ~5 Wochen.

**Architecture:** Next.js 16 (App Router) auf Vercel, Supabase (Auth + Postgres + RLS), Resend für E-Mails, Groq für KI, Lemon Squeezy für Billing. Drei Wellen: Launch-Ready → Monetarisierung → Produkt stärken.

**Tech Stack:** Next.js 16, React 19, Supabase, Resend, Groq API, Lemon Squeezy, Vercel, TypeScript

---

## WELLE 1 — Launch-Ready

### Task 1: Umgebungsvariablen dokumentieren & prüfen

**Ziel:** Alle benötigten Env-Vars sind bekannt, vollständig und sicher gespeichert.

**Files:**
- Create: `.env.local.example`
- Check: `.env.local` (nicht im Repo)

**Step 1: `.env.local.example` erstellen**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Resend (E-Mail)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@deine-domain.de

# Groq (KI)
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

# Cron Security
CRON_SECRET=ein-langer-zufaelliger-string

# App URL
NEXT_PUBLIC_APP_URL=https://deine-domain.de

# Sentry (optional aber empfohlen)
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...
```

**Step 2: Lokale `.env.local` prüfen** — alle Werte sind ausgefüllt?

**Step 3: Groq Account erstellen** (falls noch nicht)
- Gehe zu console.groq.com
- Erstelle kostenlosen Account → API Key generieren
- Key in `.env.local` als `GROQ_API_KEY` eintragen

**Step 4: KI-Feature testen**
```bash
npm run dev
```
Navigiere zu Rechnungen → Neue Rechnung → KI-Entwurf. Beschreibe: "3 Tage Webdesign 800 Euro pro Tag". Ergebnis: 3 Positionen sollten erscheinen. Quelle: `"groq"` (nicht `"heuristic"`).

**Step 5: Commit**
```bash
git add .env.local.example
git commit -m "docs: add env.local.example with all required variables"
```

---

### Task 2: Steuerexport freigeben für alle Plans

**Problem:** `src/app/api/export/tax/route.ts` Line 35-39 sperrt den Export auf `plan === "business"` only. Da keine bezahlten Pläne live sind, kann niemand exportieren — das ist der gemeldete Bug.

**Files:**
- Modify: `src/app/api/export/tax/route.ts:29-39`

**Step 1: Bug analysieren**

Der Code:
```typescript
if (profile?.plan !== "business") {
  return NextResponse.json(
    { error: "Steuerexport ist nur im Business-Plan verfuegbar." },
    { status: 403 },
  );
}
```

Lösung: Plan-Gate auf Starter+ anheben, damit alle (inkl. Free für Tests) exportieren können bis Pläne richtig live sind.

**Step 2: Fix implementieren**

In `src/app/api/export/tax/route.ts` ersetze die Plan-Prüfung:

```typescript
// Vorher:
if (profile?.plan !== "business") {
  return NextResponse.json(
    { error: "Steuerexport ist nur im Business-Plan verfuegbar." },
    { status: 403 },
  );
}

// Nachher — DATEV nur für Professional+, Standard CSV für alle:
const format = req.nextUrl.searchParams.get("format") || "standard";
if (format === "datev") {
  const allowedPlans = ["professional", "business"];
  if (!profile?.plan || !allowedPlans.includes(profile.plan)) {
    return NextResponse.json(
      { error: "DATEV-Export ist ab dem Professional-Plan verfügbar." },
      { status: 403 },
    );
  }
}
```

Hinweis: Die `format`-Variable wird weiter unten im Code bereits neu definiert — die bestehende Zeile `const format = req.nextUrl.searchParams.get("format") || "standard";` am Ende (Line 59) muss entfernt werden, da sie jetzt weiter oben steht.

**Step 3: Manuell testen**
- Einloggen → Einstellungen → Steuerexport
- Standard CSV: Sollte funktionieren (alle Plans)
- DATEV: Sollte für Free-Plan blockiert sein (403-Fehlermeldung anzeigen)

**Step 4: Commit**
```bash
git add src/app/api/export/tax/route.ts
git commit -m "fix(export): unlock standard CSV for all plans, DATEV for Professional+"
```

---

### Task 3: Plan-Inkonsistenz fixen

**Problem:** `src/types/index.ts` sagt `free: maxInvoices: 5` (Gesamtlimit). `src/app/preise/page.tsx` zeigt `"3 Rechnungen / Monat"`. Das sind verschiedene Konzepte und müssen angeglichen werden.

**Entscheidung:** Free = 5 Rechnungen gesamt (nicht monatlich) — einfacher zu implementieren und großzügiger für neue User.

**Files:**
- Modify: `src/app/preise/page.tsx`
- Modify: `src/types/index.ts` (falls nötig)

**Step 1: Preisseite anpassen**

In `src/app/preise/page.tsx` in der `PLANS`-Konstante:

```typescript
// Vorher:
{ id: "free", features: ["3 Rechnungen / Monat", ...] }

// Nachher:
{ id: "free", features: ["5 Rechnungen (Gesamt)", ...] }
```

Auch in der Feature-Vergleichstabelle (`FEATURES`-Array):
```typescript
// Vorher:
{ name: "Rechnungen", free: "3/Mo", ... }

// Nachher:
{ name: "Rechnungen", free: "5 gesamt", starter: "Unbegrenzt", ... }
```

**Step 2: `types/index.ts` bestätigen** — `free.maxInvoices: 5` ist korrekt, keine Änderung nötig.

**Step 3: Visuell prüfen** — `npm run dev`, `/preise` aufrufen, Free-Karte + Tabelle stimmen überein.

**Step 4: Commit**
```bash
git add src/app/preise/page.tsx
git commit -m "fix(pricing): align free plan to 5 invoices total, consistent across page"
```

---

### Task 4: Supabase Production-Audit

**Ziel:** Alle DB-Tabellen haben RLS, alle Migrations sind applied, Auth ist korrekt konfiguriert.

**Files:**
- Read: `src/lib/migrations/*.sql`
- Check: Supabase Dashboard

**Step 1: Migrationen prüfen**

Gehe zu Supabase Dashboard → SQL Editor und führe für jede Migration aus:

```sql
-- Prüfe ob invoice_templates Tabelle existiert:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'invoice_templates';

-- Prüfe ob recurring_schedules existiert:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'recurring_schedules';

-- Zeige alle vorhandenen Tabellen:
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Erwartete Tabellen: `profiles`, `invoices`, `customers`, `reminders`, `invoice_templates`, `recurring_schedules`

**Step 2: RLS aktiviert prüfen**

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

Alle Tabellen müssen `rowsecurity = true` haben.

**Step 3: RLS Policies prüfen**

```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

Jede Tabelle braucht mindestens SELECT + INSERT + UPDATE + DELETE Policies die `auth.uid() = user_id` prüfen.

**Step 4: Fehlende Migrations anwenden**

Lese die SQL-Dateien und führe sie aus falls Tabellen fehlen:
- `src/lib/migrations/001-invoice-templates.sql`
- `src/lib/migrations/002-recurring-schedules.sql`

**Step 5: Keine Änderungen im Code, kein Commit nötig** — dies ist ein reines DB-Setup.

---

### Task 5: E-Mail-Verifizierung mit Resend einrichten

**Ziel:** Nutzer erhalten nach der Registrierung eine echte Verifizierungsmail (nicht Supabase-Standard).

**Step 1: Resend Account + Domain**
1. Gehe zu resend.com → kostenlosen Account erstellen
2. Unter "Domains" → eigene Domain verifizieren (DNS-Einträge setzen)
3. API Key erstellen → in `.env.local` als `RESEND_API_KEY` eintragen
4. `RESEND_FROM_EMAIL=noreply@deine-domain.de` setzen

**Step 2: Supabase Auth SMTP konfigurieren**
1. Supabase Dashboard → Authentication → Settings → SMTP Settings
2. Enable Custom SMTP einschalten
3. Konfiguration:
   - Host: `smtp.resend.com`
   - Port: `465`
   - User: `resend`
   - Password: `[dein RESEND_API_KEY]`
   - Sender: `noreply@deine-domain.de`

**Step 3: E-Mail-Templates in Supabase anpassen**
Supabase Dashboard → Authentication → Email Templates:
- **Confirm signup:** Betreff und Text auf Deutsch anpassen
- **Reset password:** Deutsch
- Redirect URLs auf `https://deine-domain.de/auth/callback` setzen

**Step 4: Registrierungs-Flow testen**
```bash
npm run dev
```
1. `/register` aufrufen
2. Neue E-Mail-Adresse registrieren
3. E-Mail prüfen — Verifizierungsmail angekommen?
4. Link klicken → Redirect zum Dashboard
5. Welcome-Mail prüfen (wird via `src/app/api/account/welcome/route.ts` gesendet)

**Kein Code-Commit nötig** — reine Konfiguration.

---

### Task 6: Vercel Deployment einrichten

**Ziel:** App läuft auf Vercel statt Railway.

**Step 1: Vercel CLI installieren (falls nicht vorhanden)**
```bash
npm i -g vercel
vercel login
```

**Step 2: Vercel-Projekt erstellen**
```bash
vercel
```
Folge dem Wizard: Framework = Next.js, Root Directory = `.`

**Step 3: Alle Env-Vars in Vercel eintragen**
```bash
# Oder über das Vercel Dashboard → Project → Settings → Environment Variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
vercel env add GROQ_API_KEY
vercel env add GROQ_MODEL
vercel env add CRON_SECRET
vercel env add NEXT_PUBLIC_APP_URL
```

**Step 4: Production Deploy**
```bash
vercel --prod
```

**Step 5: Supabase Redirect URLs aktualisieren**
Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://deine-domain.vercel.app` (oder Custom Domain)
- Redirect URLs hinzufügen: `https://deine-domain.vercel.app/**`

**Step 6: Cron Jobs in Vercel einrichten**

Erstelle `vercel.json` im Root:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-overdue",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/recurring-invoices",
      "schedule": "0 6 1 * *"
    }
  ]
}
```

**Step 7: Build prüfen**
```bash
npm run build
```
Kein Build-Fehler → dann:
```bash
git add vercel.json .env.local.example
git commit -m "feat(infra): add vercel.json with cron config, update env example"
```

---

### Task 7: Core Flows End-to-End testen

**Ziel:** Alle kritischen User-Journeys funktionieren auf Production.

**Checkliste manuell durchgehen:**

**Flow 1: Registrierung**
- [ ] `/register` → Account erstellen → Verifizierungsmail erhalten → Link klicken → Dashboard
- [ ] Welcome-Mail erhalten

**Flow 2: Onboarding**
- [ ] Einstellungen → Unternehmensname + Adresse + Steuernummer ausfüllen → Speichern

**Flow 3: Kunde anlegen**
- [ ] `/customers/new` → Formular ausfüllen → Speichern → Kunde erscheint in Liste

**Flow 4: Rechnung erstellen**
- [ ] `/invoices/new` → Kunde auswählen → Position hinzufügen → MwSt → Speichern
- [ ] KI-Entwurf testen: Freitext eingeben → Positionen werden automatisch gefüllt
- [ ] Status: Draft

**Flow 5: PDF + Versand**
- [ ] Rechnung öffnen → "PDF herunterladen" → PDF korrekt?
- [ ] "Per E-Mail senden" → Eingangs-Mail beim Kunden prüfen
- [ ] Status wechselt zu "Gesendet"

**Flow 6: Mahnung**
- [ ] Rechnung auf "Überfällig" setzen → "Erinnerung senden" Button → Mail kommt an

**Flow 7: Steuerexport**
- [ ] Einstellungen → Steuerexport → Standard CSV → Download klappt
- [ ] CSV in Excel öffnen → Daten korrekt?

**Flow 8: Rechnungsvorlage**
- [ ] `/invoices/templates` → Neue Vorlage → Farben/Logo anpassen → Vorschau korrekt?

**Bei Fehlern:** Issue dokumentieren und als separaten Fix-Task behandeln.

---

### Task 8: "Wir sind neu" Messaging ersetzen

**Problem:** `src/app/page.tsx` enthält eine Sektion "Faktura ist ein junges Produkt" — das signalisiert Unsicherheit und Unwortheit.

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Sektion identifizieren** (ca. Line 741-788)

```tsx
{/* ── SECTION B: Ehrliche Feedback-Box ─────────────────── */}
// "Wir sind neu" / "Faktura ist ein junges Produkt."
```

**Step 2: Ersetzen durch selbstbewusstes Messaging**

Ersetze den gesamten `SECTION B`-Block durch:

```tsx
{/* ── SECTION B: USP — KI-Rechnungsentwurf ─────────────── */}
<div className="scroll-reveal" style={{ background: "var(--bg)" }}>
  <div style={{
    maxWidth: "700px",
    margin: "0 auto",
    padding: "72px 40px",
    textAlign: "center",
  }}>
    <p className="label-caps" style={{ marginBottom: "16px" }}>
      Nur bei Faktura
    </p>
    <h2 style={{
      fontSize: "28px",
      fontWeight: 700,
      letterSpacing: "-0.03em",
      color: "var(--text-1)",
      marginBottom: "12px",
      lineHeight: 1.2,
    }}>
      Beschreibe dein Projekt.<br />
      <span style={{ color: "var(--accent)" }}>Deine Rechnung ist fertig.</span>
    </h2>
    <p style={{
      fontSize: "15px",
      color: "var(--text-2)",
      lineHeight: 1.7,
      marginBottom: "28px",
      maxWidth: "480px",
      margin: "0 auto 28px",
    }}>
      Kein anderes Rechnungstool in Deutschland hat das:
      Schreib kurz auf was du gemacht hast — Faktura erstellt die Rechnung automatisch.
    </p>
    <Link href="/register" style={{ textDecoration: "none" }}>
      <button
        className="btn btn-primary"
        style={{ height: "44px", padding: "0 28px", fontSize: "14px" }}
      >
        Kostenlos ausprobieren
      </button>
    </Link>
  </div>
</div>
```

**Step 3: Visuell prüfen**
```bash
npm run dev
```
Startseite → Sektion sieht stimmig aus?

**Step 4: Commit**
```bash
git add src/app/page.tsx
git commit -m "feat(marketing): replace 'Wir sind neu' with KI-USP section"
```

---

## WELLE 2 — Monetarisierung

### Task 9: Lemon Squeezy einrichten

**Warum Lemon Squeezy statt Stripe:** Lemon Squeezy ist Merchant of Record — du brauchst kein Gewerbe, keine VAT-Registrierung, keine komplexe Steuer-Compliance. Perfekt für den Launch.

**Step 1: Account erstellen**
- lemon.squeezy.com → Account + Store erstellen
- Store-Name: "Faktura"
- Währung: EUR

**Step 2: Produkte anlegen**
Erstelle 3 Produkte mit jeweils einem "Subscription"-Variant:
- **Starter** — 9 € / Monat
- **Professional** — 19 € / Monat
- **Business** — 39 € / Monat

Notiere die **Variant IDs** — werden im Code gebraucht.

**Step 3: Webhook einrichten**
Dashboard → Webhooks → Add Webhook:
- URL: `https://deine-domain.de/api/billing/lemonsqueezy/webhook`
- Events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`
- Signing Secret notieren

**Step 4: API Keys**
Dashboard → Settings → API → API Key erstellen.

**Step 5: Env-Vars hinzufügen**

In `.env.local` und Vercel:
```env
LEMONSQUEEZY_API_KEY=...
LEMONSQUEEZY_STORE_ID=...
LEMONSQUEEZY_WEBHOOK_SECRET=...
LEMONSQUEEZY_VARIANT_STARTER=...
LEMONSQUEEZY_VARIANT_PROFESSIONAL=...
LEMONSQUEEZY_VARIANT_BUSINESS=...
```

**Step 6: npm Paket installieren**
```bash
npm install @lemonsqueezy/lemonsqueezy-js
```

**Step 7: Billing-Lib erstellen**

Erstelle `src/lib/lemonsqueezy.ts`:

```typescript
import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy-js";

lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });

export async function createCheckoutUrl(
  variantId: string,
  userEmail: string,
  userId: string,
): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutOptions: { embed: false },
    checkoutData: {
      email: userEmail,
      custom: { user_id: userId },
    },
    productOptions: {
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=1`,
    },
  });
  if (error || !data?.data?.attributes?.url) {
    throw new Error("Checkout konnte nicht erstellt werden");
  }
  return data.data.attributes.url;
}

export function getPlanVariantId(plan: "starter" | "professional" | "business"): string {
  const map: Record<string, string | undefined> = {
    starter: process.env.LEMONSQUEEZY_VARIANT_STARTER,
    professional: process.env.LEMONSQUEEZY_VARIANT_PROFESSIONAL,
    business: process.env.LEMONSQUEEZY_VARIANT_BUSINESS,
  };
  const id = map[plan];
  if (!id) throw new Error(`Keine Variant ID für Plan: ${plan}`);
  return id;
}
```

**Step 8: Checkout Route erstellen**

Erstelle `src/app/api/billing/lemonsqueezy/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase-server";
import { createCheckoutUrl, getPlanVariantId } from "@/lib/lemonsqueezy";
import type { PlanId } from "@/types/index";

export async function POST(req: NextRequest) {
  const supabase = await createRouteSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = (await req.json()) as { plan?: PlanId };
  if (!plan || plan === "free") {
    return NextResponse.json({ error: "Ungültiger Plan" }, { status: 400 });
  }

  try {
    const variantId = getPlanVariantId(plan);
    const checkoutUrl = await createCheckoutUrl(variantId, user.email!, user.id);
    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

**Step 9: Webhook Route erstellen**

Erstelle `src/app/api/billing/lemonsqueezy/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import type { PlanId } from "@/types/index";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

function eventToPlan(eventName: string, status: string): PlanId | null {
  if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
    return "free";
  }
  if (status === "active" || status === "trialing") return null; // handled by variant
  return "free";
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    meta: { event_name: string; custom_data?: { user_id?: string } };
    data: { attributes: { status: string; variant_id: number } };
  };

  const userId = event.meta.custom_data?.user_id;
  if (!userId) return NextResponse.json({ ok: true });

  const eventName = event.meta.event_name;
  const status = event.data.attributes.status;
  const variantId = String(event.data.attributes.variant_id);

  let plan: PlanId = "free";
  if (eventName === "subscription_created" || eventName === "subscription_updated") {
    if (status === "active" || status === "trialing") {
      const variantMap: Record<string, PlanId> = {
        [process.env.LEMONSQUEEZY_VARIANT_STARTER!]: "starter",
        [process.env.LEMONSQUEEZY_VARIANT_PROFESSIONAL!]: "professional",
        [process.env.LEMONSQUEEZY_VARIANT_BUSINESS!]: "business",
      };
      plan = variantMap[variantId] ?? "free";
    }
  }

  const supabase = createServiceSupabaseClient();
  await supabase
    .from("profiles")
    .update({ plan })
    .eq("id", userId);

  return NextResponse.json({ ok: true });
}
```

**Step 10: Commit**
```bash
git add src/lib/lemonsqueezy.ts src/app/api/billing/lemonsqueezy/ .env.local.example
git commit -m "feat(billing): add Lemon Squeezy checkout and webhook integration"
```

---

### Task 10: Upgrade-Flow in der App

**Ziel:** User können aus dem Dashboard heraus upgraden.

**Files:**
- Modify: `src/app/(dashboard)/billing/page.tsx`
- Modify: `src/components/UpgradeModal.tsx`
- Modify: `src/app/preise/page.tsx`

**Step 1: Billing Page aktualisieren**

In `src/app/(dashboard)/billing/page.tsx` — Upgrade-Button mit Checkout-Call verbinden:

```typescript
async function handleUpgrade(plan: "starter" | "professional" | "business") {
  setLoading(true);
  try {
    const res = await fetch("/api/billing/lemonsqueezy/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error(data.error || "Fehler beim Checkout");
    }
  } finally {
    setLoading(false);
  }
}
```

**Step 2: UpgradeModal aktualisieren**

`src/components/UpgradeModal.tsx` — selbe `handleUpgrade`-Logik einbauen statt Disabled-State.

**Step 3: Preisseite CTAs aktivieren**

In `src/app/preise/page.tsx` — `buttonDisabled: true` für alle Plans auf `false` setzen, `buttonLabel` anpassen:

```typescript
{ id: "starter",  buttonLabel: "Jetzt upgraden", buttonDisabled: false },
{ id: "professional", buttonLabel: "Jetzt upgraden", buttonDisabled: false },
{ id: "business", buttonLabel: "Jetzt upgraden", buttonDisabled: false },
```

Die Buttons sollen auf `/billing` oder direkt zum Checkout linken.

**Step 4: FAQ auf Preisseite aktualisieren**

```typescript
{
  q: "Wann kommen die bezahlten Pläne?",
  a: "Starter, Professional und Business sind jetzt verfügbar. Starte kostenlos und upgrade jederzeit.",
}
```

**Step 5: Testen**
1. Dashboard → Billing → Upgrade auf Starter klicken
2. Lemon Squeezy Checkout-Seite öffnet sich
3. Test-Kauf durchführen (LS hat Test-Modus)
4. Webhook wird gefeuert → `profiles.plan` wechselt zu `"starter"`
5. Dashboard zeigt korrekten Plan

**Step 6: Commit**
```bash
git add src/app/(dashboard)/billing/ src/components/UpgradeModal.tsx src/app/preise/page.tsx
git commit -m "feat(billing): activate upgrade flow via Lemon Squeezy checkout"
```

---

## WELLE 3 — Produkt stärken

### Task 11: Zahlungsdruck-Score & Health Score entfernen

**Ziel:** Ablenkende "Spielerei"-Features entfernen, App fokussierter machen.

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx` (Health Score Section entfernen)
- Modify: `src/app/(dashboard)/invoices/page.tsx` (PressureBadge entfernen, falls dort)
- Modify: `src/components/invoices/PressureBadge.tsx` (Datei kann bleiben, Verwendungen entfernen)

**Step 1: Dashboard Health Score entfernen**

In `src/app/(dashboard)/dashboard/page.tsx` die gesamte `Business Health Score`-Sektion (ca. Lines 237-295) entfernen.

**Step 2: PressureBadge aus Invoice-Liste entfernen**

Falls `PressureBadge` in der Invoice-Listenansicht oder Detail-Seite verwendet wird — Import und Verwendung entfernen.

**Step 3: Stat-Cards bereinigen**

Die `avgPaymentDays`-Karte im Dashboard ist nützlich und bleibt. Nur die zusammengesetzte Health-Score-Section weg.

**Step 4: Visuell prüfen** — Dashboard wirkt aufgeräumter

**Step 5: Commit**
```bash
git add src/app/(dashboard)/dashboard/page.tsx src/app/(dashboard)/invoices/
git commit -m "refactor(dashboard): remove Health Score and Pressure Score display"
```

---

### Task 12: Onboarding verbessern

**Ziel:** Neue Nutzer wissen sofort was zu tun ist — ohne Suche.

**Files:**
- Modify: `src/components/OnboardingBanner.tsx`

**Step 1: OnboardingBanner lesen und verstehen**

```bash
# Lies src/components/OnboardingBanner.tsx
```

**Step 2: Schritte konkretisieren**

Der Banner soll 3 klare, klickbare Schritte zeigen:
1. "Unternehmen einrichten" → Link zu `/settings`
2. "Ersten Kunden anlegen" → Link zu `/customers/new`
3. "Erste Rechnung erstellen" → Link zu `/invoices/new`

Jeder Schritt zeigt einen grünen Haken wenn erledigt (via Profil-Daten prüfen).

**Step 3: Completion-Logic**
```typescript
const steps = [
  {
    label: "Unternehmen einrichten",
    href: "/settings",
    done: !!profile?.company_name,
  },
  {
    label: "Ersten Kunden anlegen",
    href: "/customers/new",
    done: customerCount > 0,
  },
  {
    label: "Erste Rechnung erstellen",
    href: "/invoices/new",
    done: invoiceCount > 0,
  },
];
```

**Step 4: Banner ausblenden wenn alle Steps erledigt**

```typescript
if (steps.every(s => s.done)) return null;
```

**Step 5: Commit**
```bash
git add src/components/OnboardingBanner.tsx
git commit -m "feat(onboarding): improve banner with clickable steps and completion tracking"
```

---

### Task 13: KI-Feature als USP hervorheben

**Ziel:** Der KI-Rechnungsentwurf ist das Killer-Feature — muss prominenter sein.

**Files:**
- Modify: `src/app/(dashboard)/invoices/new/page.tsx`
- Modify: `src/app/funktionen/page.tsx`

**Step 1: In der "Neue Rechnung"-Seite**

Der KI-Draft-Button soll nicht versteckt sein. Er soll am Anfang des Formulars prominent platziert sein mit Text:

```
"✦ KI-Entwurf: Beschreib dein Projekt — Faktura füllt die Rechnung aus"
```

Klick → öffnet ein kleines Textarea-Overlay oder Inline-Feld.

**Step 2: Funktionen-Seite**

In `src/app/funktionen/page.tsx` — KI-Rechnungsentwurf als erstes Feature (statt aktuell irgendwo in der Mitte):

```typescript
const FEATURES = [
  {
    Icon: Zap,
    title: "KI-Rechnungsentwurf",  // ← nach oben
    description: "Beschreibe dein Projekt in einem Satz — Faktura erstellt die Positionen automatisch. Das schnellste Tool auf dem deutschen Markt.",
  },
  // ... Rest
]
```

**Step 3: Commit**
```bash
git add src/app/(dashboard)/invoices/new/ src/app/funktionen/page.tsx
git commit -m "feat(ux): elevate AI draft feature as primary USP in new invoice flow"
```

---

## Checkliste vor Launch

```
[ ] Welle 1 Tasks 1-8 vollständig abgeschlossen
[ ] Vercel Deployment läuft stabil
[ ] Registrierung + Verifizierungsmail funktioniert
[ ] KI-Feature aktiv (Groq Key eingerichtet)
[ ] Steuerexport funktioniert
[ ] Alle Core Flows manuell getestet
[ ] DSGVO-Seiten (Impressum, Datenschutz, AGB) vollständig & aktuell
[ ] Gewerbe angemeldet (parallel erledigen)
[ ] Welle 2 Tasks 9-10: Lemon Squeezy live
[ ] Testverkauf erfolgreich (Plan-Wechsel via Webhook bestätigt)
[ ] Preisseite: keine "Demnächst verfügbar" Buttons mehr
```

---

## Externe Accounts & Services (Setup-Liste)

| Service | Zweck | URL |
|---------|-------|-----|
| Vercel | Hosting | vercel.com |
| Supabase | DB + Auth | supabase.com (Pro: $25/Mo für Production) |
| Resend | E-Mail Versand | resend.com (kostenlos bis 3.000/Mo) |
| Groq | KI API | console.groq.com (kostenlos) |
| Lemon Squeezy | Billing/Payments | lemonsqueezy.com |
| Sentry | Error Monitoring | sentry.io (kostenlos bis 5k errors/Mo) |
