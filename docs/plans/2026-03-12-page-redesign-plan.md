# Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the "Für" and "Docs" marketing pages with category-based industry showcase and bento-grid layouts, plus add dark mode support to all marketing pages.

**Architecture:** Both pages are server components in `src/app/fuer/page.tsx` and `src/app/docs/page.tsx`. They share MarketingHeader/Footer. Dark mode toggle will be added to MarketingHeader (already a client component). All hardcoded colors will be replaced with CSS custom properties from globals.css. The "Für" page needs a new client component for the animated hero text rotation. Industry data comes from `src/data/industries.ts`.

**Tech Stack:** Next.js 15 (App Router), React 19, CSS custom properties (no Tailwind for page-level styles), Lucide icons, existing design system (0px radius, multi-layer shadows, Inter font).

---

### Task 1: Add Dark Mode Toggle to MarketingHeader

**Files:**
- Modify: `src/components/layout/MarketingHeader.tsx`

**Step 1: Add dark mode toggle to MarketingHeader**

Add a Sun/Moon toggle button in the header between the nav and auth buttons. Use the same logic as `DarkModeToggle.tsx` but with inline styles matching the MarketingHeader pattern (no Tailwind classes).

```tsx
// Add to imports at top:
import { Moon, Sun } from "lucide-react";

// Add state inside MarketingHeader component:
const [isDark, setIsDark] = useState(false);

// Add useEffect for theme initialization:
useEffect(() => {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (saved === "dark" || (!saved && prefersDark)) {
    document.documentElement.classList.add("dark");
    setIsDark(true);
  }
}, []);

// Add toggle function:
function toggleTheme() {
  const next = !isDark;
  if (next) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
  setIsDark(next);
}

// Add button JSX between </nav> and auth buttons div:
<button
  onClick={toggleTheme}
  aria-label="Theme umschalten"
  style={{
    background: "none",
    border: "1px solid var(--border)",
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--text-2)",
    flexShrink: 0,
    transition: "color var(--duration-fast) var(--ease-smooth), border-color var(--duration-fast) var(--ease-smooth)",
  }}
>
  {isDark ? <Sun size={15} /> : <Moon size={15} />}
</button>
```

**Step 2: Verify it works**

Run: `npm run dev` → visit any marketing page → verify toggle appears and switches theme.

**Step 3: Commit**

```bash
git add src/components/layout/MarketingHeader.tsx
git commit -m "feat: add dark mode toggle to marketing header"
```

---

### Task 2: Update Industry Data with Categories and Benefits

**Files:**
- Modify: `src/data/industries.ts`

**Step 1: Add category and benefit fields to Industry interface**

```ts
export interface Industry {
  slug: string;
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  painPoints: [string, string, string];
  pressureScoreHook: string;
  features: [string, string, string, string];
  testimonialQuote: string;
  metaDescription: string;
  keywords: string[];
  avgInvoiceAmount: string;
  avgPaymentDays: number;
  // New fields:
  category: "kreative" | "tech" | "beratung" | "handwerk";
  benefit: string; // One-line industry-specific benefit for the card
  icon: string; // Lucide icon name
}
```

**Step 2: Add category, benefit, and icon to each industry entry**

Category assignments:
- **kreative**: fotografen, webdesigner, grafikdesigner, videografen, musiker, texter
- **tech**: programmierer, it-berater
- **beratung**: coaches, berater, uebersetzer, dozenten, virtuelle-assistenten
- **handwerk**: architekten, handwerker

Benefit examples (short, emotional, card-friendly):
- fotografen: "Nutzungsrechte & Shootings in einer Rechnung"
- webdesigner: "Abschlagszahlungen für jede Projektphase"
- programmierer: "Sprint-Abrechnungen in 60 Sekunden"
- it-berater: "Tagessätze + DATEV-Export für Konzern-Kunden"
- coaches: "Coaching-Pakete automatisch abrechnen"
- etc.

Icon assignments (Lucide icon names):
- fotografen: "Camera"
- webdesigner: "Globe"
- grafikdesigner: "Palette"
- programmierer: "Code"
- it-berater: "Monitor"
- coaches: "Heart"
- architekten: "Building2"
- texter: "PenTool"
- etc.

**Step 3: Add category config export**

```ts
export const CATEGORY_CONFIG = {
  kreative: {
    label: "Kreative",
    headline: "Kreative Köpfe verdienen kreative Rechnungen",
    description: "Von Fotografie über Design bis Musik — Faktura versteht kreative Arbeit.",
  },
  tech: {
    label: "Tech & Digital",
    headline: "Stundensätze, Sprints und Retainer — automatisiert",
    description: "Faktura spricht deine Sprache — ob Tagessatz oder Sprint-Pauschale.",
  },
  beratung: {
    label: "Beratung & Coaching",
    headline: "Mehr Zeit für deine Klienten, weniger für Papierkram",
    description: "Sessions, Pakete und Honorare — alles in einem Tool.",
  },
  handwerk: {
    label: "Handwerk & Spezialisten",
    headline: "Rechnungen so solide wie deine Arbeit",
    description: "Material, Arbeitsstunden und Abschläge — klar und professionell.",
  },
} as const;

export type Category = keyof typeof CATEGORY_CONFIG;

export function getIndustriesByCategory(category: Category): Industry[] {
  return INDUSTRIES.filter((i) => i.category === category);
}
```

**Step 4: Commit**

```bash
git add src/data/industries.ts
git commit -m "feat: add categories, benefits and icons to industry data"
```

---

### Task 3: Build Animated Hero Component for "Für" Page

**Files:**
- Create: `src/components/marketing/AnimatedIndustryHero.tsx`

**Step 1: Create the animated hero component**

This is a client component that rotates through industry names with a fade/slide animation.

```tsx
"use client";

import { useEffect, useState } from "react";

const ROTATING_WORDS = ["Fotografen", "Entwickler", "Designer", "Coaches", "Berater"];

export default function AnimatedIndustryHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      style={{
        padding: "100px 24px 60px",
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 800,
          color: "var(--text-1)",
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          marginBottom: "18px",
        }}
      >
        Faktura für{" "}
        <span
          key={index}
          style={{
            color: "var(--accent)",
            display: "inline-block",
            animation: "fadeInUp 500ms var(--ease-out) forwards",
          }}
        >
          {ROTATING_WORDS[index]}
        </span>
      </h1>
      <p
        style={{
          fontSize: "16px",
          lineHeight: 1.7,
          color: "var(--text-2)",
          maxWidth: "560px",
          margin: "0 auto 32px",
        }}
      >
        Egal ob du Fotos machst, Code schreibst oder berätst — Faktura passt sich
        deiner Arbeit an. Finde heraus, wie andere in deiner Branche schneller
        bezahlt werden.
      </p>
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-3)",
          fontWeight: 500,
        }}
      >
        Bereits{" "}
        <span style={{ color: "var(--accent)", fontWeight: 700 }}>12.000+</span>{" "}
        Freelancer nutzen Faktura
      </p>
    </section>
  );
}
```

**Step 2: Add fadeInUp keyframes to globals.css** (if not already present)

Check if `@keyframes fadeInUp` exists in globals.css. If not, add:

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Step 3: Verify it renders**

Run dev server, import into für page temporarily, verify animation works.

**Step 4: Commit**

```bash
git add src/components/marketing/AnimatedIndustryHero.tsx src/app/globals.css
git commit -m "feat: add animated hero component with rotating industry names"
```

---

### Task 4: Redesign "Für" Page with Category Sections

**Files:**
- Modify: `src/app/fuer/page.tsx`

**Step 1: Rewrite the page with the new category-based layout**

Replace the entire page content. The page structure:
1. MarketingHeader
2. AnimatedIndustryHero (client component)
3. 4 Category Sections with industry cards
4. Social Proof strip
5. CTA Section
6. MarketingFooter

Key implementation details:

- Import `CATEGORY_CONFIG, getIndustriesByCategory, Category` from industries data
- Import Lucide icons dynamically based on `industry.icon` field — since this is a server component, use a static icon map
- Each category section has: Badge label, headline, description, then a grid of cards
- Card design: icon area, name, benefit sentence, two stat mini-badges, arrow link
- All colors via CSS variables (var(--surface), var(--text-1), var(--accent), etc.)
- Use `card-hover` class for hover effect

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Camera, Globe, Palette, Code, Monitor, Heart, Building2, PenTool, Music, Video, Users, BookOpen, Briefcase, Wrench, Languages, GraduationCap, Headphones } from "lucide-react";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";
import AnimatedIndustryHero from "@/components/marketing/AnimatedIndustryHero";
import { INDUSTRIES, CATEGORY_CONFIG, type Category } from "@/data/industries";

// Icon map for server component
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Camera, Globe, Palette, Code, Monitor, Heart, Building2, PenTool, Music, Video, Users, BookOpen, Briefcase, Wrench, Languages, GraduationCap, Headphones,
};

const CATEGORIES: Category[] = ["kreative", "tech", "beratung", "handwerk"];

export const metadata: Metadata = { /* keep existing */ };

export default function IndustriesOverviewPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <MarketingHeader />
      <main style={{ paddingTop: "58px" }}>
        <AnimatedIndustryHero />

        {/* Category Sections */}
        {CATEGORIES.map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const industries = INDUSTRIES.filter((i) => i.category === cat);
          return (
            <section key={cat} style={{ padding: "0 24px 72px", maxWidth: "1100px", margin: "0 auto" }}>
              {/* Category Header */}
              <div style={{ marginBottom: "28px" }}>
                <span style={{
                  display: "inline-block", padding: "3px 10px",
                  fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  background: "var(--accent-soft)", color: "var(--accent)",
                  marginBottom: "12px",
                }}>
                  {config.label}
                </span>
                <h2 style={{
                  fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800,
                  color: "var(--text-1)", letterSpacing: "-0.02em",
                  lineHeight: 1.2, marginBottom: "8px",
                }}>
                  {config.headline}
                </h2>
                <p style={{ fontSize: "14px", color: "var(--text-2)", maxWidth: "500px" }}>
                  {config.description}
                </p>
              </div>

              {/* Industry Cards Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }}>
                {industries.map((industry) => {
                  const IconComp = ICON_MAP[industry.icon];
                  return (
                    <Link key={industry.slug} href={`/fuer/${industry.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="card-hover" style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-sm)",
                        padding: "24px",
                        display: "flex", flexDirection: "column", gap: "14px",
                        cursor: "pointer",
                        transition: "box-shadow var(--duration-normal) var(--ease-out), transform var(--duration-normal) var(--ease-out)",
                      }}>
                        {/* Icon + Name Row */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{
                            width: "36px", height: "36px",
                            background: "var(--accent-soft)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            {IconComp && <IconComp size={18} style={{ color: "var(--accent)" }} />}
                          </div>
                          <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-1)" }}>
                            {industry.name}
                          </p>
                        </div>

                        {/* Benefit */}
                        <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6 }}>
                          {industry.benefit}
                        </p>

                        {/* Stats + Arrow */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "auto" }}>
                          <span style={{
                            padding: "3px 8px", fontSize: "11px", fontWeight: 600,
                            background: "var(--surface-2)", color: "var(--text-2)",
                          }}>
                            Ø {industry.avgInvoiceAmount}
                          </span>
                          <span style={{
                            padding: "3px 8px", fontSize: "11px", fontWeight: 600,
                            background: "var(--surface-2)", color: "var(--text-2)",
                          }}>
                            {industry.avgPaymentDays} Tage
                          </span>
                          <ArrowRight size={15} style={{ marginLeft: "auto", color: "var(--accent)" }} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Social Proof */}
        <section style={{
          padding: "48px 24px",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
            }}>
              {[
                { quote: "Seit ich Faktura nutze, spare ich 5 Stunden pro Woche an Verwaltungsarbeit.", name: "Lisa M.", role: "Fotografin" },
                { quote: "Meine Konzern-Kunden nehmen Faktura-Rechnungen ernst — das Layout macht den Unterschied.", name: "Thomas K.", role: "IT-Berater" },
                { quote: "12 Kunden, 12 monatliche Rechnungen — Faktura erstellt alle automatisch am 1. des Monats.", name: "Sarah B.", role: "Virtuelle Assistentin" },
              ].map((t) => (
                <div key={t.name} style={{ padding: "20px 0" }}>
                  <p style={{
                    fontSize: "14px", color: "var(--text-2)", lineHeight: 1.7,
                    fontStyle: "italic", marginBottom: "12px",
                  }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>
                    {t.name}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-3)" }}>
                    {t.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "72px 24px", textAlign: "center" }}>
          <h2 style={{
            fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800,
            color: "var(--text-1)", letterSpacing: "-0.02em",
            marginBottom: "12px",
          }}>
            Bereit, deine Rechnungen auf ein neues Level zu bringen?
          </h2>
          <p style={{
            fontSize: "14px", color: "var(--text-2)", marginBottom: "28px",
          }}>
            Keine Kreditkarte nötig · Kostenloser Plan verfügbar
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ textDecoration: "none" }}>
              <button className="btn btn-primary" style={{ padding: "12px 28px", fontSize: "14px" }}>
                Kostenlos starten <ArrowRight size={15} />
              </button>
            </Link>
            <Link href="/docs" style={{ textDecoration: "none" }}>
              <button className="btn btn-secondary" style={{ padding: "12px 28px", fontSize: "14px" }}>
                Funktionen entdecken
              </button>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
```

**Step 2: Test the page**

Run: `npm run dev` → visit `/fuer` → verify:
- Hero animation works
- 4 category sections render with correct industries
- Cards show icon, name, benefit, stats
- Social proof section renders
- Dark mode toggle works on this page

**Step 3: Commit**

```bash
git add src/app/fuer/page.tsx
git commit -m "feat: redesign für page with category showcase layout"
```

---

### Task 5: Redesign Docs Page — Refactor Mockups to Use CSS Variables

**Files:**
- Modify: `src/app/docs/page.tsx`

**Step 1: Replace all hardcoded colors in mockup components with CSS variables**

This is the critical prerequisite for dark mode. Replace throughout:
- `#ffffff` → `var(--surface)`
- `#f7f7fa` → `var(--surface-2)`
- `#0c0c14` → `var(--text-1)`
- `#5c5c6e` → `var(--text-2)`
- `#9898AA` → `var(--text-3)`
- `#0040CC` → `var(--accent)`
- `#CC7000` → `var(--warning)`
- `#CC2020` → `var(--danger)`
- `#00A060` → `var(--success)`
- `#F0F0F5` → `var(--badge-draft-bg)`
- `#EFEFF4` → `var(--bg)`
- `rgba(0,0,0,0.07)` → `var(--border)`
- `rgba(0,0,0,0.04)` → `var(--divider)`
- `rgba(0,64,204,0.08)` → `var(--accent-soft)`
- `rgba(204,112,0,0.08)` → `var(--warning-bg)`
- `rgba(204,32,32,0.08)` → `var(--danger-bg)`
- `rgba(0,160,96,0.08)` → `var(--success-bg)`

Also update MockShell:
```tsx
function MockShell({ children, width = "100%" }: { children: React.ReactNode; width?: string }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      boxShadow: "var(--shadow-md)",
      width, overflow: "hidden",
    }}>
      <div style={{ padding: "7px 12px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "5px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 8, height: 8, background: c, borderRadius: "50%" }} />
        ))}
      </div>
      {children}
    </div>
  );
}
```

Update PLAN_CFG to use CSS variables:
```tsx
const PLAN_CFG: Record<Plan, { label: string; bg: string; color: string; border: string }> = {
  free:         { label: "Kostenlos",    bg: "var(--badge-draft-bg)",  color: "var(--text-2)",  border: "transparent" },
  starter:      { label: "Starter",      bg: "var(--accent-soft)",     color: "var(--accent)",  border: "var(--accent-soft)" },
  professional: { label: "Professional", bg: "rgba(96,64,204,0.08)",   color: "#6040CC",        border: "rgba(96,64,204,0.15)" },
  business:     { label: "Business",     bg: "var(--text-1)",          color: "var(--surface)",  border: "transparent" },
};
```

Update FeatureCard:
```tsx
function FeatureCard({ ... }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        background: "var(--surface-2)",
        padding: "28px 24px",
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "220px",
        borderBottom: "1px solid var(--border)",
      }}>
        {mockup}
      </div>
      <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{title}</p>
          <Badge plan={plan} />
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.65 }}>{description}</p>
        {bullets && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "5px", marginTop: "4px" }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "7px", fontSize: "12px", color: "var(--text-2)", lineHeight: 1.5 }}>
                <span style={{ color: "var(--accent)", flexShrink: 0, fontWeight: 800, fontSize: "11px", marginTop: "1px" }}>→</span>
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

Update Section component:
```tsx
function Section({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: "100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{label}</h2>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      </div>
      {children}
    </section>
  );
}
```

**Step 2: Update all inline mockup colors systematically**

Go through each Mock* function and replace every hardcoded color reference. This is repetitive but critical. Target: ZERO hardcoded color values except the macOS window chrome dots (#FF5F57, #FEBC2E, #28C840).

**Step 3: Update page-level elements**

Hero background: `"var(--surface)"` instead of `"#ffffff"`
Page background: `"var(--bg)"` instead of `"#EFEFF4"`
Sticky nav: `background: "var(--surface)"` with `backdropFilter: "blur(8px)"`
CTA section: keep `"var(--accent)"` background (works in both modes)

**Step 4: Test dark mode**

Toggle dark mode → all mockups, cards, badges, nav should look correct in dark mode.

**Step 5: Commit**

```bash
git add src/app/docs/page.tsx
git commit -m "refactor: replace hardcoded colors with CSS variables in docs page"
```

---

### Task 6: Redesign Docs Page — Bento Grid Layout

**Files:**
- Modify: `src/app/docs/page.tsx`

**Step 1: Replace uniform grid Section with bento-grid layout**

Remove the `Section` component's fixed grid. Instead, each section uses a custom bento grid with CSS grid `grid-template-columns` and `grid-column` / `grid-row` spans.

New approach: Replace the generic `Section` component's grid with explicit bento layouts per section. Each section defines its own grid arrangement.

Define a BentoGrid wrapper:
```tsx
function BentoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "16px",
    }}>
      {children}
    </div>
  );
}
```

Define card size variants with a `span` prop on FeatureCard:
```tsx
type CardSpan = "1x1" | "2x1" | "1x2" | "2x2";

function FeatureCard({ span = "1x1", ... }: { span?: CardSpan; ... }) {
  const gridStyle: React.CSSProperties = {
    "1x1": {},
    "2x1": { gridColumn: "span 2" },
    "1x2": { gridRow: "span 2" },
    "2x2": { gridColumn: "span 2", gridRow: "span 2" },
  }[span];
  // ...rest of card with gridStyle applied to outer div
}
```

Add a new StatCard component for big-number cards:
```tsx
function StatCard({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)",
      padding: "24px",
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      textAlign: "center",
    }}>
      <p style={{
        fontSize: "36px", fontWeight: 800,
        color: color || "var(--accent)",
        letterSpacing: "-0.03em", lineHeight: 1,
        marginBottom: "8px",
      }}>
        {value}
      </p>
      <p style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600 }}>
        {label}
      </p>
    </div>
  );
}
```

**Step 2: Rearrange each section with bento grid**

Example for "Rechnungen" section:
```tsx
<Section id="rechnungen" label="Rechnungen">
  <BentoGrid>
    <FeatureCard span="2x2" title="Rechnungen erstellen" ... mockup={<MockInvoiceList />} />
    <FeatureCard span="1x1" title="PDF-Export" ... mockup={<MockPDF />} />
    <StatCard value="60s" label="pro Rechnung" />
    <FeatureCard span="1x1" title="KI-Rechnungserstellung" ... mockup={<MockAI />} />
    <FeatureCard span="2x1" title="Vorlagen & Import" ... mockup={<MockImport />} />
  </BentoGrid>
</Section>
```

Apply similar bento arrangements for all 5 other sections, choosing span sizes to create visual variety and hierarchy.

**Step 3: Add responsive fallback**

Add a CSS media query or use `@media (max-width: 768px)` inline approach:
The BentoGrid should collapse to 1 column on mobile. Since we use inline styles, add a `<style>` tag:

```tsx
<style>{`
  @media (max-width: 768px) {
    .bento-grid { grid-template-columns: 1fr !important; }
    .bento-grid > * { grid-column: span 1 !important; grid-row: span 1 !important; }
  }
`}</style>
```

And add `className="bento-grid"` to the BentoGrid div.

**Step 4: Update sticky nav to show active section indicator**

Convert the docs nav links to highlight the current section. Since this is a server component, add a `<style>` tag with `:target` or use a small client script. Simplest approach: use CSS-only highlight based on scroll position with `scroll-margin-top`.

The existing hover styles work. Add an active state via JS intersection observer in a small client wrapper OR keep it CSS-only for now.

**Step 5: Commit**

```bash
git add src/app/docs/page.tsx
git commit -m "feat: redesign docs page with bento-grid layout"
```

---

### Task 7: Redesign Docs Page — Interactive Plan Comparison Table

**Files:**
- Modify: `src/app/docs/page.tsx`

**Step 1: Replace PlanComparison cards with interactive table**

Replace the current card-based plan comparison with a feature comparison table:

```tsx
function PlanComparison() {
  const features = [
    { name: "Rechnungen", free: "5/Mo", starter: "50/Mo", professional: "∞", business: "∞" },
    { name: "Kunden", free: "3", starter: "Unbegrenzt", professional: "∞", business: "∞" },
    { name: "PDF-Export", free: true, starter: true, professional: true, business: true },
    { name: "E-Mail-Versand", free: true, starter: true, professional: true, business: true },
    { name: "Dashboard & Statistiken", free: true, starter: true, professional: true, business: true },
    { name: "Health Score", free: true, starter: true, professional: true, business: true },
    { name: "Zahlungsdruck-Score", free: true, starter: true, professional: true, business: true },
    { name: "Tastenkürzel", free: true, starter: true, professional: true, business: true },
    { name: "Rechnung importieren", free: false, starter: true, professional: true, business: true },
    { name: "Wiederkehrende Rechnungen", free: false, starter: true, professional: true, business: true },
    { name: "E-Mail-Vorlagen", free: false, starter: true, professional: true, business: true },
    { name: "Kundenrabatt", free: false, starter: true, professional: true, business: true },
    { name: "KI-Features", free: false, starter: false, professional: true, business: true },
    { name: "E-Mail CC/BCC", free: false, starter: false, professional: true, business: true },
    { name: "Mehrwährung", free: false, starter: false, professional: true, business: true },
    { name: "Kundenkonto-Portal", free: false, starter: false, professional: true, business: true },
    { name: "API-Zugang", free: false, starter: false, professional: false, business: true },
    { name: "Prioritäts-Support", free: false, starter: false, professional: false, business: true },
  ];

  const plans: { id: Plan; name: string; price: string; recommended?: boolean }[] = [
    { id: "free", name: "Kostenlos", price: "0 €" },
    { id: "starter", name: "Starter", price: "9 €" },
    { id: "professional", name: "Professional", price: "19 €", recommended: true },
    { id: "business", name: "Business", price: "39 €" },
  ];

  return (
    <section id="plaene" style={{ scrollMarginTop: "100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>Pläne & Tarife</h2>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%", borderCollapse: "collapse",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}>
          <thead>
            <tr>
              <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "var(--text-3)", borderBottom: "1px solid var(--border)" }}>Feature</th>
              {plans.map((p) => (
                <th key={p.id} style={{
                  padding: "16px 20px", textAlign: "center", fontSize: "13px",
                  fontWeight: 700, borderBottom: "1px solid var(--border)",
                  color: p.recommended ? "var(--surface)" : "var(--text-1)",
                  background: p.recommended ? "var(--accent)" : "transparent",
                  position: "relative",
                }}>
                  {p.recommended && (
                    <span style={{
                      position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)",
                      fontSize: "8px", fontWeight: 800, background: "var(--accent)",
                      color: "var(--surface)", padding: "1px 8px", letterSpacing: "0.08em",
                    }}>BELIEBT</span>
                  )}
                  <div>{p.name}</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, marginTop: "4px" }}>
                    {p.price}<span style={{ fontSize: "11px", fontWeight: 500, opacity: 0.7 }}>/Mo</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f.name} style={{ transition: "background var(--duration-fast) var(--ease-smooth)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td style={{ padding: "10px 20px", fontSize: "13px", color: "var(--text-2)", borderBottom: "1px solid var(--divider)" }}>{f.name}</td>
                {(["free", "starter", "professional", "business"] as Plan[]).map((pid) => {
                  const val = f[pid];
                  return (
                    <td key={pid} style={{
                      padding: "10px 20px", textAlign: "center", fontSize: "13px",
                      borderBottom: "1px solid var(--divider)",
                      fontWeight: typeof val === "string" ? 700 : 400,
                      color: val === true ? "var(--success)" : val === false ? "var(--text-3)" : "var(--text-1)",
                    }}>
                      {val === true ? "✓" : val === false ? "—" : val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA buttons under table */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "16px" }}>
        {plans.map((p) => (
          <Link key={p.id} href={p.id === "free" ? "/register" : "/billing"} style={{ textDecoration: "none" }}>
            <div style={{
              padding: "10px", textAlign: "center", fontSize: "13px", fontWeight: 700, cursor: "pointer",
              background: p.recommended ? "var(--accent)" : "var(--surface)",
              color: p.recommended ? "#ffffff" : "var(--text-2)",
              border: p.recommended ? "none" : "1px solid var(--border)",
            }}>
              {p.id === "free" ? "Kostenlos starten" : p.id === "business" ? "Kontakt" : "Plan wählen"}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

**NOTE:** The table uses `onMouseEnter`/`onMouseLeave` for row hover, which requires the page to be a client component OR we use CSS. Since we want to keep it as a server component, use a `<style>` tag instead:

```css
.plan-table tr:hover td { background: var(--surface-2); }
```

**Step 2: Commit**

```bash
git add src/app/docs/page.tsx
git commit -m "feat: interactive plan comparison table for docs page"
```

---

### Task 8: Final Polish and Testing

**Files:**
- Review all modified files

**Step 1: Visual review checklist**

Run `npm run dev` and check:
- [ ] `/fuer` — Hero animation rotates correctly
- [ ] `/fuer` — 4 category sections with correct industry grouping
- [ ] `/fuer` — Cards show icon, name, benefit, stats
- [ ] `/fuer` — Social proof section visible
- [ ] `/fuer` — CTA section with 2 buttons
- [ ] `/fuer` — Dark mode looks correct
- [ ] `/docs` — Bento grid layout with varied card sizes
- [ ] `/docs` — All mockups render correctly in light mode
- [ ] `/docs` — All mockups render correctly in dark mode
- [ ] `/docs` — Plan comparison table with hover highlights
- [ ] `/docs` — Sticky nav works
- [ ] All marketing pages — Dark mode toggle in header works
- [ ] Theme persists across page navigation
- [ ] Mobile responsiveness (bento collapses to 1 column)

**Step 2: Fix any issues found**

**Step 3: Run build check**

Run: `npm run build`
Expected: No build errors.

**Step 4: Commit**

```bash
git add -A
git commit -m "polish: final visual fixes for page redesign"
```
