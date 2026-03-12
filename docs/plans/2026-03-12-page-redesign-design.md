# Page Redesign: "Für" & Docs Pages

## Context
Faktura is a Next.js invoicing app with a PayPal-inspired design system: sharp corners (0px radius), multi-layer shadows, Inter font, blue accent (#0040cc), dotted background pattern. Dark mode exists in dashboard but not on marketing pages.

## Decision: "Für"-Seite — Kategorien-Showcase

### Goal
Convince visitors that Faktura fits their specific industry — emotional persuasion with data backup.

### Structure

1. **Hero**: Animated rotating industry name ("Faktura für **Fotografen/Designer/...**"), subtitle, animated counter ("12.000+ Freelancer")
2. **4 Category Sections**:
   - Kreative: Fotografen, Designer, Videografen, Musiker, Texter, Illustratoren
   - Tech & Digital: Entwickler, IT-Berater, Webdesigner
   - Beratung & Coaching: Coaches, Unternehmensberater, Marketing-Berater, Übersetzer
   - Handwerk & Spezialisten: Architekten, Ingenieure, Eventplaner, Personal Trainer, Nachhilfelehrer
3. **Social Proof**: Auto-scrolling testimonial strip
4. **CTA Section**: "Kostenlos starten" + "Funktionen entdecken"

### Card Design
Each industry card shows: icon, name, industry-specific benefit sentence, two stat badges (avg invoice amount, avg payment days), "Mehr erfahren" link. Uses existing shadow/hover system.

---

## Decision: Docs-Seite — Bento-Grid Showcase

### Goal
Transform from dry technical doc into visually compelling feature showcase with clear hierarchy.

### Structure

1. **Hero**: Badge + title + subtitle + 6 clickable category chips (smooth-scroll)
2. **6 Bento-Grid Sections** (Rechnungen, Kunden, Analysen, Automatisierung, Workflow, Pläne):
   - Card types: Showcase (2x2 with mockup), Feature (1x1), Stat (1x1 with big number), Wide (2x1)
   - All colors via CSS variables, no hardcoded values
3. **Plan Comparison**: Interactive table with hover highlights, sticky header, recommended plan accent
4. **Progress Indicator**: Sticky sidebar dots on desktop, chips on mobile

### Dark Mode
- All mockup backgrounds use var(--surface-2)
- Plan badge colors converted to CSS variables
- Dark mode toggle added to MarketingHeader
- System preference as default, localStorage override

---

## Shared Changes

- Dark mode toggle in MarketingHeader (Sun/Moon icon)
- System preference detection + localStorage persistence
- All marketing pages get dark mode support via existing CSS variable system
