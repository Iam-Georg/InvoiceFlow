# Industry Landing Pages — Design Document

**Date:** 2026-03-07
**Status:** Approved
**Goal:** Programmatic SEO via dynamic industry-specific landing pages

## Architecture

- **Approach:** Static Site Generation via `generateStaticParams` + JSON data
- **Route:** `/fuer/[slug]` (e.g., `/fuer/fotografen`)
- **Type:** Server Component with `generateMetadata`

## Files to Create

1. `src/data/industries.ts` — Industry data (15 initial industries)
2. `src/app/fuer/[slug]/page.tsx` — Dynamic landing page template
3. `src/app/fuer/page.tsx` — Overview page linking all industries
4. `src/app/sitemap.ts` — Sitemap including all `/fuer/[slug]` URLs

## Data Structure

```typescript
interface Industry {
  slug: string;
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  painPoints: string[];       // 3 items
  pressureScoreHook: string;
  features: string[];         // 4 items
  testimonialQuote: string;
  metaDescription: string;
  keywords: string[];
  avgInvoiceAmount: string;
  avgPaymentDays: number;
}
```

## Page Layout (top to bottom)

1. MarketingHeader (existing)
2. Hero — title, subtitle, 2 CTAs, stats bar
3. Pain Points — 3-column grid
4. Pressure Score — split layout with visual mock
5. Features — 4-column grid with icons
6. Testimonial — quote block
7. CTA — final conversion section
8. MarketingFooter (existing)

## SEO per Page

- `generateMetadata()` with industry-specific title/description
- Open Graph with locale de_DE
- Schema.org SoftwareApplication JSON-LD
- Canonical URL

## Design Rules

- border-radius: 0 everywhere
- CSS variables from globals.css only
- Dot-grid background (already on body)
- MarketingHeader + MarketingFooter pattern
- paddingTop: 58px on main

## Initial Industries (15)

fotografen, webdesigner, it-berater, texter, grafikdesigner,
architekten, coaches, uebersetzer, musiker, videografen,
programmierer, berater, handwerker, dozenten, virtuelle-assistenten
