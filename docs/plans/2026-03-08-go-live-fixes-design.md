# Go-Live Fixes — Design Doc

**Date:** 2026-03-08
**Status:** Approved

## 1. GoBD: Forward-Only Status Transitions

### Problem
Invoice status can currently be changed in any direction (e.g. paid → draft), violating GoBD immutability requirements.

### Solution
Add `canTransition(from, to)` helper in `src/lib/invoice-status.ts`:

- **Allowed transitions:** draft→sent, sent→open, open→overdue, sent→overdue, sent→paid, open→paid, overdue→paid
- **Cancel:** Any non-draft status can transition to `cancelled`
- **Draft delete:** Only drafts can be hard-deleted
- Guard in invoice detail page blocks invalid transitions with toast error

### Files
- NEW: `src/lib/invoice-status.ts`
- EDIT: `src/app/(dashboard)/invoices/[id]/page.tsx` — wrap all status changes with guard
- EDIT: `src/types/index.ts` — add `cancelled` to InvoiceStatus

---

## 2. GoBD: Cancellation Instead of Deletion

### Problem
Invoices are hard-deleted, violating 10-year retention requirement.

### Solution
- **Draft invoices:** Still allow hard-delete (never sent, no GoBD obligation)
- **Non-draft invoices:** Replace "Löschen" button with "Stornieren" → sets status to `cancelled`
- **UI:** Cancelled invoices show with strikethrough styling in list, badge "Storniert"
- **Detail page:** Cancelled invoices show a banner "Diese Rechnung wurde storniert"

### Files
- EDIT: `src/app/(dashboard)/invoices/[id]/page.tsx` — conditional delete/cancel logic
- EDIT: Invoice list (if status badge rendering exists)

---

## 3. robots.txt

### Solution
Create `src/app/robots.ts` using Next.js metadata API:
- Allow: `/`, `/funktionen`, `/preise`, `/ueber-uns`, `/fuer/*`, `/impressum`, `/datenschutz`
- Disallow: `/dashboard`, `/admin`, `/api`, `/settings`, `/billing`, `/support`, `/invoices`, `/customers`, `/statistics`, `/login`, `/register`
- Sitemap: reference to `/sitemap.xml`

### Files
- NEW: `src/app/robots.ts`

---

## 4. Schema.org Structured Data

### Solution
Add JSON-LD to key marketing pages:

**Homepage** (`src/app/page.tsx` or layout):
- `SoftwareApplication` schema with pricing, category, OS

**Pricing page** (`src/app/preise/page.tsx`):
- `FAQPage` schema if FAQ section exists

### Files
- EDIT: `src/app/layout.tsx` — add SoftwareApplication JSON-LD
- EDIT: `src/app/preise/page.tsx` — add FAQ JSON-LD (if applicable)

---

## 5. LockedFeature Value-Props

### Problem
Generic "Ab Starter" label doesn't drive conversion.

### Solution
Add feature-specific value propositions:
```
E-Mail-Versand → "Rechnungen direkt per E-Mail senden — spart Ø 15 Min."
Wiederkehrende Rechnungen → "Automatische monatliche Rechnungen"
DATEV-Export → "1-Klick Steuerberater-Export"
KI-Entwurf → "Rechnung in 30 Sekunden aus Freitext"
Zahlungserinnerungen → "Automatische Mahnungen — Ø 40% schnellere Zahlung"
```

### Files
- EDIT: `src/components/LockedFeature.tsx` — add VALUE_PROPS map, use in overlay
