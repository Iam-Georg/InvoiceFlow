# Launch Readiness Phase 1 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the 7 critical launch-blockers so Faktura can go live safely.

**Architecture:** All changes are additive — new files for error boundaries, AGB page, cookie banner, env validation. Two SQL migrations for Supabase. Sentry wraps existing Next.js config. No existing functionality is changed.

**Tech Stack:** Next.js 16, React 19, Supabase, Zod (already in deps), @sentry/nextjs (new), Sonner for toasts.

---

### Task 1: Error Boundaries

**Files:**
- Create: `src/app/error.tsx`
- Create: `src/app/(dashboard)/error.tsx`
- Create: `src/app/global-error.tsx`

**Step 1: Create global error boundary**

Create `src/app/error.tsx`:

```tsx
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "40px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          background: "var(--destructive-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
        }}
      >
        !
      </div>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "var(--foreground)",
        }}
      >
        Etwas ist schiefgelaufen
      </h2>
      <p
        style={{
          fontSize: "13px",
          color: "var(--muted-foreground)",
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
      </p>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={reset} className="btn btn-primary">
          Erneut versuchen
        </button>
        <a href="/" style={{ textDecoration: "none" }}>
          <button className="btn btn-secondary">Zur Startseite</button>
        </a>
      </div>
    </div>
  );
}
```

**Step 2: Create dashboard error boundary**

Create `src/app/(dashboard)/error.tsx`:

```tsx
"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "40px",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "var(--foreground)",
        }}
      >
        Fehler im Dashboard
      </h2>
      <p
        style={{
          fontSize: "13px",
          color: "var(--muted-foreground)",
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        Ein Fehler ist aufgetreten. Deine Daten sind sicher.
      </p>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={reset} className="btn btn-primary">
          Erneut versuchen
        </button>
        <a href="/dashboard" style={{ textDecoration: "none" }}>
          <button className="btn btn-secondary">Zum Dashboard</button>
        </a>
      </div>
    </div>
  );
}
```

**Step 3: Create global-error.tsx (root HTML fallback)**

Create `src/app/global-error.tsx`:

```tsx
"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
            Kritischer Fehler
          </h1>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
            Die Anwendung konnte nicht geladen werden.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: 600,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
```

**Step 4: Verify build**

Run: `npx next build`
Expected: Build succeeds, no errors.

**Step 5: Commit**

```bash
git add src/app/error.tsx src/app/\(dashboard\)/error.tsx src/app/global-error.tsx
git commit -m "feat: add error boundaries for app and dashboard"
```

---

### Task 2: AGB (Terms of Service) Page

**Files:**
- Create: `src/app/agb/page.tsx`
- Modify: `src/components/layout/MarketingFooter.tsx:13-16`
- Modify: `src/app/(auth)/register/page.tsx:200-219`

**Step 1: Create AGB page**

Create `src/app/agb/page.tsx` — German SaaS AGB matching the design of `/impressum`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen von Faktura.",
};

const SECTIONS = [
  {
    title: "§ 1 Geltungsbereich",
    content:
      "Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der webbasierten Rechnungssoftware „Faktura" (nachfolgend „Dienst"), betrieben von InvoiceFlow UG (haftungsbeschränkt), Musterstrasse 1, 10115 Berlin (nachfolgend „Anbieter"). Mit der Registrierung akzeptiert der Nutzer diese AGB.",
  },
  {
    title: "§ 2 Vertragsschluss und Registrierung",
    content:
      "Der Vertrag kommt mit Abschluss der Registrierung zustande. Der Nutzer versichert, dass die angegebenen Daten korrekt sind. Pro Person oder Unternehmen darf nur ein Account erstellt werden. Der Anbieter behält sich vor, Registrierungen ohne Angabe von Gründen abzulehnen.",
  },
  {
    title: "§ 3 Leistungsbeschreibung",
    content:
      "Der Dienst ermöglicht das Erstellen, Verwalten und Versenden von Rechnungen. Der Funktionsumfang richtet sich nach dem gewählten Tarif (Free, Starter, Professional, Business). Der Anbieter bemüht sich um eine Verfügbarkeit von 99,5 %, übernimmt jedoch keine Garantie für ununterbrochenen Betrieb. Wartungsarbeiten werden nach Möglichkeit vorab angekündigt.",
  },
  {
    title: "§ 4 Tarife und Leistungsgrenzen",
    content:
      "Der kostenlose Tarif (Free) ist dauerhaft nutzbar mit eingeschränktem Funktionsumfang (z. B. max. 3 Rechnungen/Monat, 1 Kunde). Kostenpflichtige Tarife werden monatlich abgerechnet. Der Anbieter behält sich vor, Tarifpreise mit einer Ankündigungsfrist von 30 Tagen zu ändern. Bestehende Abonnements sind bis zum Ende der Laufzeit geschützt.",
  },
  {
    title: "§ 5 Zahlungsbedingungen",
    content:
      "Die Zahlung kostenpflichtiger Tarife erfolgt per Kreditkarte (über Stripe) oder PayPal. Rechnungen werden monatlich im Voraus erstellt. Bei Zahlungsverzug wird der Account nach 14 Tagen auf den Free-Tarif zurückgestuft. Bereits erstellte Rechnungsdaten bleiben erhalten.",
  },
  {
    title: "§ 6 Pflichten des Nutzers",
    content:
      "Der Nutzer ist für die Richtigkeit seiner Rechnungsdaten selbst verantwortlich. Der Dienst ersetzt keine steuerliche Beratung. Der Nutzer verpflichtet sich, den Dienst nicht missbräuchlich zu nutzen (z. B. für Spam, betrügerische Rechnungen, Verstöße gegen geltendes Recht).",
  },
  {
    title: "§ 7 Haftungsbeschränkung",
    content:
      "Der Anbieter haftet nur für Vorsatz und grobe Fahrlässigkeit. Die Haftung für leichte Fahrlässigkeit ist auf die Verletzung wesentlicher Vertragspflichten beschränkt und der Höhe nach auf den vorhersehbaren, vertragstypischen Schaden begrenzt. Die Haftung für Datenverlust ist auf den typischen Wiederherstellungsaufwand begrenzt, der bei regelmäßiger Datensicherung entstanden wäre.",
  },
  {
    title: "§ 8 Datenschutz",
    content:
      "Die Verarbeitung personenbezogener Daten erfolgt gemäß der DSGVO und unserer Datenschutzerklärung unter /datenschutz. Rechnungsdaten werden auf EU-Servern gespeichert. Der Anbieter gibt keine personenbezogenen Daten an Dritte weiter, es sei denn, dies ist zur Vertragserfüllung erforderlich (z. B. Zahlungsabwicklung über Stripe/PayPal).",
  },
  {
    title: "§ 9 Kündigung",
    content:
      "Kostenlose Accounts können jederzeit gelöscht werden. Kostenpflichtige Abonnements können zum Ende des Abrechnungszeitraums gekündigt werden. Nach Kündigung bleiben Rechnungsdaten gemäß den gesetzlichen Aufbewahrungsfristen (10 Jahre, GoBD) erhalten. Der Nutzer kann einen vollständigen Datenexport vor der Kündigung anfordern.",
  },
  {
    title: "§ 10 Änderungen der AGB",
    content:
      "Der Anbieter kann diese AGB mit einer Ankündigungsfrist von 30 Tagen ändern. Nutzer werden per E-Mail informiert. Widerspricht ein Nutzer nicht innerhalb von 30 Tagen, gelten die geänderten AGB als akzeptiert. Bei Widerspruch steht dem Nutzer ein Sonderkündigungsrecht zu.",
  },
  {
    title: "§ 11 Schlussbestimmungen",
    content:
      "Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist Berlin, sofern der Nutzer Kaufmann ist. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.",
  },
];

export default function AGBPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <MarketingHeader />
      <main
        style={{
          paddingTop: "58px",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "120px 40px 80px",
        }}
      >
        <p className="label-caps" style={{ marginBottom: "12px" }}>
          Rechtliches
        </p>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--text-1)",
            marginBottom: "8px",
          }}
        >
          Allgemeine Geschäftsbedingungen
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-3)",
            marginBottom: "48px",
          }}
        >
          Stand: März 2026
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {SECTIONS.map(({ title, content }) => (
            <div key={title}>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--text-1)",
                  marginBottom: "8px",
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-2)",
                  lineHeight: 1.7,
                }}
              >
                {content}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: "13px",
              color: "var(--accent)",
              textDecoration: "none",
            }}
          >
            Zur Startseite
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
```

**Step 2: Add AGB link to MarketingFooter**

In `src/components/layout/MarketingFooter.tsx`, change line 13-16:

```tsx
const RECHTLICHES_LINKS = [
  { href: "/agb", label: "AGB" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/impressum", label: "Impressum" },
];
```

**Step 3: Add AGB hint to register page**

In `src/app/(auth)/register/page.tsx`, after the "Kostenlos registrieren" button (line 199) and before the "Bereits registriert?" paragraph (line 201), add:

```tsx
<p
  style={{
    textAlign: "center",
    fontSize: "11px",
    color: "var(--muted-foreground)",
    lineHeight: 1.5,
  }}
>
  Mit der Registrierung akzeptierst du unsere{" "}
  <Link
    href="/agb"
    style={{ color: "var(--accent)", textDecoration: "none" }}
  >
    AGB
  </Link>{" "}
  und{" "}
  <Link
    href="/datenschutz"
    style={{ color: "var(--accent)", textDecoration: "none" }}
  >
    Datenschutzerklärung
  </Link>
  .
</p>
```

**Step 4: Verify build**

Run: `npx next build`
Expected: Build succeeds, `/agb` route appears in output.

**Step 5: Commit**

```bash
git add src/app/agb/page.tsx src/components/layout/MarketingFooter.tsx src/app/\(auth\)/register/page.tsx
git commit -m "feat: add AGB page, footer link, register hint"
```

---

### Task 3: .env.example + Env Validation

**Files:**
- Create: `.env.example`
- Create: `src/lib/env.ts`

**Step 1: Create .env.example**

Create `.env.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@faktura.app

# AI (Groq)
GROQ_API_KEY=

# Cron Security
CRON_SECRET=

# Stripe (optional until billing goes live)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PROFESSIONAL=
STRIPE_PRICE_BUSINESS=

# PayPal (optional until billing goes live)
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_ENV=sandbox

# Sentry (optional)
SENTRY_DSN=

# Invoice defaults
NEXT_PUBLIC_DEFAULT_TAX_RATE=19
NEXT_PUBLIC_DEFAULT_PAYMENT_DAYS=14
```

**Step 2: Create env validation**

Create `src/lib/env.ts`:

```ts
import { z } from "zod/v4";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url().optional().default("http://localhost:3000"),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.email().optional().default("noreply@faktura.app"),
  GROQ_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().min(8),
  SENTRY_DSN: z.string().optional(),
});

function validateEnv() {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(
      `\n❌ Missing or invalid environment variables:\n${missing}\n\nSee .env.example for required variables.\n`,
    );
    throw new Error("Invalid environment configuration");
  }
  return result.data;
}

export const env = validateEnv();
```

**Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds (env vars exist in current .env.local).

**Step 4: Commit**

```bash
git add .env.example src/lib/env.ts
git commit -m "feat: add .env.example and Zod env validation"
```

---

### Task 4: Server-Side Plan Limit Enforcement (SQL)

**Files:**
- Create: `supabase/migrations/20260308_enforce_plan_limits.sql`

**Step 1: Create migration file**

Create `supabase/migrations/20260308_enforce_plan_limits.sql`:

```sql
-- Server-side enforcement of plan limits via trigger.
-- Prevents bypassing client-side checks by calling Supabase API directly.

-- Invoice limit trigger
CREATE OR REPLACE FUNCTION check_invoice_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  invoice_count INT;
BEGIN
  SELECT plan INTO user_plan FROM profiles WHERE id = NEW.user_id;

  -- Unlimited plans
  IF user_plan IN ('professional', 'business') THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO invoice_count
  FROM invoices
  WHERE user_id = NEW.user_id;

  -- Starter: 10 invoices
  IF user_plan = 'starter' AND invoice_count >= 10 THEN
    RAISE EXCEPTION 'Rechnungslimit für Starter-Plan erreicht (max. 10)';
  END IF;

  -- Free: 3 invoices
  IF (user_plan IS NULL OR user_plan = 'free') AND invoice_count >= 3 THEN
    RAISE EXCEPTION 'Rechnungslimit für Free-Plan erreicht (max. 3)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_invoice_limit ON invoices;
CREATE TRIGGER enforce_invoice_limit
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION check_invoice_limit();

-- Customer limit trigger
CREATE OR REPLACE FUNCTION check_customer_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  customer_count INT;
BEGIN
  SELECT plan INTO user_plan FROM profiles WHERE id = NEW.user_id;

  -- Starter and above: unlimited customers
  IF user_plan IN ('starter', 'professional', 'business') THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO customer_count
  FROM customers
  WHERE user_id = NEW.user_id;

  -- Free: 1 customer
  IF (user_plan IS NULL OR user_plan = 'free') AND customer_count >= 1 THEN
    RAISE EXCEPTION 'Kundenlimit für Free-Plan erreicht (max. 1)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_customer_limit ON customers;
CREATE TRIGGER enforce_customer_limit
  BEFORE INSERT ON customers
  FOR EACH ROW EXECUTE FUNCTION check_customer_limit();
```

**Step 2: Apply migration**

This SQL must be run in the Supabase dashboard (SQL Editor) or via `supabase db push`.

**Step 3: Commit**

```bash
mkdir -p supabase/migrations
git add supabase/migrations/20260308_enforce_plan_limits.sql
git commit -m "feat: add server-side plan limit triggers (SQL)"
```

---

### Task 5: Feedback Table RLS (SQL)

**Files:**
- Create: `supabase/migrations/20260308_feedback_rls.sql`

**Step 1: Create migration**

Create `supabase/migrations/20260308_feedback_rls.sql`:

```sql
-- Enable RLS on feedback table.
-- Users can insert their own feedback and read only their own.
-- Admin reads all feedback via service role (bypasses RLS).

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users insert own feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read only their own feedback
CREATE POLICY "Users read own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);
```

**Step 2: Apply migration**

Run in Supabase SQL Editor or via `supabase db push`.

**Step 3: Commit**

```bash
git add supabase/migrations/20260308_feedback_rls.sql
git commit -m "feat: add RLS policies for feedback table"
```

---

### Task 6: Sentry Error Tracking

**Files:**
- Modify: `package.json` — add dependency
- Create: `sentry.client.config.ts`
- Create: `sentry.server.config.ts`
- Create: `sentry.edge.config.ts`
- Modify: `next.config.ts` — wrap with Sentry
- Modify: `src/app/global-error.tsx` — add Sentry reporting
- Modify: `.env.example` — already has SENTRY_DSN

**Step 1: Install Sentry**

Run: `npm install @sentry/nextjs`

**Step 2: Create Sentry client config**

Create `sentry.client.config.ts`:

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  enabled: process.env.NODE_ENV === "production",
});
```

**Step 3: Create Sentry server config**

Create `sentry.server.config.ts`:

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});
```

**Step 4: Create Sentry edge config**

Create `sentry.edge.config.ts`:

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});
```

**Step 5: Wrap next.config.ts**

Replace `next.config.ts`:

```ts
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    viewTransition: true,
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
});
```

**Step 6: Update global-error.tsx with Sentry**

Update `src/app/global-error.tsx` — add `import * as Sentry from "@sentry/nextjs"` and call `Sentry.captureException(error)` in a `useEffect`.

**Step 7: Add SENTRY_DSN to .env.example**

Already done in Task 3. Also add:
```
SENTRY_ORG=
SENTRY_PROJECT=
NEXT_PUBLIC_SENTRY_DSN=
```

**Step 8: Verify build**

Run: `npx next build`
Expected: Build succeeds.

**Step 9: Commit**

```bash
git add sentry.client.config.ts sentry.server.config.ts sentry.edge.config.ts next.config.ts src/app/global-error.tsx package.json package-lock.json .env.example
git commit -m "feat: integrate Sentry error tracking"
```

---

### Task 7: Cookie Banner

**Files:**
- Create: `src/components/CookieBanner.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create CookieBanner component**

Create `src/components/CookieBanner.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "faktura:cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  function accept(level: "all" | "essential") {
    localStorage.setItem(CONSENT_KEY, level);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        flexWrap: "wrap",
        boxShadow: "0 -2px 20px rgba(0,0,0,0.08)",
        animation: "slideUp 300ms cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}
    >
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-2)",
          margin: 0,
          maxWidth: "500px",
        }}
      >
        Wir verwenden Cookies für die Funktionalität und Fehleranalyse.{" "}
        <a
          href="/datenschutz"
          style={{ color: "var(--accent)", textDecoration: "none" }}
        >
          Mehr erfahren
        </a>
      </p>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => accept("essential")}
          className="btn btn-secondary"
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          Nur notwendige
        </button>
        <button
          onClick={() => accept("all")}
          className="btn btn-primary"
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          Alle akzeptieren
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Add to root layout**

In `src/app/layout.tsx`, import and add `<CookieBanner />` after `<Toaster />`:

```tsx
import CookieBanner from "@/components/CookieBanner";

// In the body, after Toaster:
<CookieBanner />
```

**Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/components/CookieBanner.tsx src/app/layout.tsx
git commit -m "feat: add DSGVO cookie consent banner"
```

---

## Execution Order

| Order | Task | Est. Complexity |
|-------|------|-----------------|
| 1 | Error Boundaries | Low |
| 2 | AGB Page | Medium |
| 3 | .env.example + Validation | Low |
| 4 | Plan Limit SQL Triggers | Low (SQL only) |
| 5 | Feedback RLS SQL | Low (SQL only) |
| 6 | Sentry Integration | Medium |
| 7 | Cookie Banner | Low |

Tasks 1-3 and 7 are fully independent and can be parallelized.
Tasks 4-5 are SQL-only and need manual application in Supabase.
Task 6 depends on npm install completing first.
