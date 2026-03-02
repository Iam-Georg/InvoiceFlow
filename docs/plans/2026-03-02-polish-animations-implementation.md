# Polish & Animations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the entire website feel physically consistent with smooth animations, unified input styling, Windows/DE keyboard shortcut display, redesigned billing page, and "+ Neuer Kunde" in TopNav.

**Architecture:** CSS-first approach using the existing design system in globals.css. No new dependencies. All animations via CSS transitions/keyframes with GPU-accelerated properties (transform, opacity). Components modified with minimal JS changes.

**Tech Stack:** Next.js 14, Tailwind CSS v4, CSS custom properties, lucide-react icons

---

### Task 1: Unify Input Styles – Remove Inline Overrides from Auth Pages

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`
- Modify: `src/app/(auth)/reset-password/page.tsx`

**Step 1: Update login page inputs**

In `src/app/(auth)/login/page.tsx`, find all `<input>` elements with inline border/background styles like:
```tsx
style={{ border: "1px solid var(--border)", background: "var(--background)", height: "38px", padding: "0 12px", ... }}
```
Remove the `border`, `background`, `height`, and `padding` properties from inline styles. The global CSS in globals.css already provides the correct bottom-border-only styling:
```css
input { background: var(--surface-2); border: none; border-bottom: 1.5px solid var(--border); height: 44px; padding: 0 12px; }
```
Keep only non-styling inline props (like `type`, `value`, `onChange`, `placeholder`, `required`). If the input needs a smaller height (38px), set only `style={{ height: "38px" }}`.

**Step 2: Update register page inputs**

Same changes as Step 1, applied to `src/app/(auth)/register/page.tsx`. Remove inline border/background/padding styles from all 4 inputs (name, email, password, confirm password).

**Step 3: Update reset-password page inputs**

Same changes applied to `src/app/(auth)/reset-password/page.tsx`. Remove inline border/background/padding styles from all inputs.

**Step 4: Verify visually**

Run: `npm run dev`
Check: Login, Register, Reset Password pages. Inputs should show bottom-border only, surface-2 background, accent border on focus.

**Step 5: Commit**

```bash
git add src/app/(auth)/login/page.tsx src/app/(auth)/register/page.tsx src/app/(auth)/reset-password/page.tsx
git commit -m "fix(inputs): remove inline overrides on auth pages, use global input styles"
```

---

### Task 2: Unify Input Styles – Settings Page

**Files:**
- Modify: `src/app/(dashboard)/settings/page.tsx`

**Step 1: Remove inputStyle/disabledStyle variables**

The settings page likely defines `inputStyle` and `disabledStyle` objects used across all inputs. Find these variable declarations and remove them. Then remove the `style={inputStyle}` or `style={disabledStyle}` from each input.

For disabled inputs (like email), keep only `disabled` attribute and add `style={{ opacity: 0.5 }}` since the global CSS handles the rest.

**Step 2: Verify**

Run dev server, check Settings page. All inputs should be bottom-border style. Disabled inputs should appear muted.

**Step 3: Commit**

```bash
git add src/app/(dashboard)/settings/page.tsx
git commit -m "fix(inputs): settings page uses global input styles"
```

---

### Task 3: Unify Input Styles – Invoice New & Edit Pages

**Files:**
- Modify: `src/app/(dashboard)/invoices/new/page.tsx`
- Modify: `src/app/(dashboard)/invoices/[id]/edit/page.tsx`

**Step 1: Invoice new page**

Find the `inputStyle` variable (which sets `border: "1px solid var(--border)"`, `background: "var(--background)"`, `borderRadius: "var(--radius)"`, etc.) and remove it. Remove `style={inputStyle}` from all inputs, selects, and textareas. Keep only layout-critical inline styles (like `width` or `flex` properties if needed for grid alignment).

For select elements, ensure they still get appropriate styling from the global CSS.

**Step 2: Invoice edit page**

Same changes as Step 1 for the edit page. Remove `inputStyle` variable and its usage.

**Step 3: Verify**

Check invoice create and edit forms. All inputs/selects/textareas should have consistent bottom-border styling.

**Step 4: Commit**

```bash
git add src/app/(dashboard)/invoices/new/page.tsx src/app/(dashboard)/invoices/[id]/edit/page.tsx
git commit -m "fix(inputs): invoice forms use global input styles"
```

---

### Task 4: Unify Input Styles – Customer New Page

**Files:**
- Modify: `src/app/(dashboard)/customers/new/page.tsx`

**Step 1: Replace UI Input component**

The customer new page uses `<Input />` from `src/components/ui/input.tsx` which has full-border Tailwind classes. Replace `<Input>` imports with plain `<input>` elements. The global CSS handles all styling.

Example change:
```tsx
// Before
<Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="..." />

// After
<input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="..." />
```

**Step 2: Verify & commit**

```bash
git add src/app/(dashboard)/customers/new/page.tsx
git commit -m "fix(inputs): customer form uses global input styles"
```

---

### Task 5: Keyboard Shortcuts – Windows/DE Layout Display

**Files:**
- Modify: `src/components/KeyboardShortcuts.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

**Step 1: Update KeyboardShortcuts modal**

In `src/components/KeyboardShortcuts.tsx`, change the `?` shortcut display at lines 121-126.

Replace:
```tsx
<span style={{ fontSize: "13px", color: "var(--text-2)" }}>Diese Hilfe öffnen / schließen</span>
<kbd ...>?</kbd>
```

With two kbd elements showing the physical keys:
```tsx
<span style={{ fontSize: "13px", color: "var(--text-2)" }}>Diese Hilfe öffnen / schließen</span>
<span style={{ display: "flex", gap: "4px", alignItems: "center" }}>
  <kbd style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "2px 8px", fontSize: "11px", fontWeight: 700, color: "var(--text-1)", fontFamily: "monospace", minWidth: "22px", textAlign: "center" }}>
    Shift
  </kbd>
  <span style={{ fontSize: "10px", color: "var(--text-3)" }}>+</span>
  <kbd style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "2px 8px", fontSize: "11px", fontWeight: 700, color: "var(--text-1)", fontFamily: "monospace", minWidth: "22px", textAlign: "center" }}>
    ß
  </kbd>
</span>
```

**Step 2: Update Sidebar hint**

In `src/components/layout/Sidebar.tsx` at line 193, change:
```tsx
Drücke <kbd ...>?</kbd> für Tastenkürzel
```
To:
```tsx
Drücke <kbd ...>Shift</kbd> + <kbd ...>ß</kbd> für Tastenkürzel
```

**Step 3: Verify**

Press `Shift + ß` to open shortcuts modal. Verify the display shows physical keys. Verify the sidebar hint updated.

**Step 4: Commit**

```bash
git add src/components/KeyboardShortcuts.tsx src/components/layout/Sidebar.tsx
git commit -m "fix(shortcuts): show Windows/DE keyboard layout (Shift + ß)"
```

---

### Task 6: Billing Page Redesign – 4-Column Layout

**Files:**
- Modify: `src/app/(dashboard)/billing/page.tsx`

**Step 1: Expand PLANS data with more features**

Update the PLANS array to include more features per plan and add missing features as greyed-out items. Add a `recommended` flag:

```tsx
const PLANS: {
  id: SubscriptionPlan;
  label: string;
  price: string;
  priceValue: number;
  description: string;
  features: { text: string; included: boolean }[];
  recommended?: boolean;
}[] = [
  {
    id: "free",
    label: "Free",
    price: "0 €",
    priceValue: 0,
    description: "Kostenlos starten, keine Kreditkarte nötig.",
    features: [
      { text: "Bis zu 3 Rechnungen/Monat", included: true },
      { text: "PDF Export", included: true },
      { text: "1 Kunde", included: true },
      { text: "E-Mail Versand", included: false },
      { text: "Automatische Erinnerungen", included: false },
      { text: "Priorität-Support", included: false },
    ],
  },
  {
    id: "starter",
    label: "Starter",
    price: "9 €",
    priceValue: 9,
    description: "Für Einzelunternehmer mit geringem Volumen.",
    features: [
      { text: "Bis zu 10 Rechnungen/Monat", included: true },
      { text: "PDF Export", included: true },
      { text: "Unbegrenzte Kunden", included: true },
      { text: "E-Mail Versand", included: true },
      { text: "Automatische Erinnerungen", included: false },
      { text: "Priorität-Support", included: false },
    ],
  },
  {
    id: "professional",
    label: "Professional",
    price: "19 €",
    priceValue: 19,
    description: "Für wachsende Freelancer mit Automatisierung.",
    recommended: true,
    features: [
      { text: "Unbegrenzte Rechnungen", included: true },
      { text: "PDF Export", included: true },
      { text: "Unbegrenzte Kunden", included: true },
      { text: "E-Mail Versand", included: true },
      { text: "Automatische Erinnerungen", included: true },
      { text: "Priorität-Support", included: true },
    ],
  },
  {
    id: "business",
    label: "Business",
    price: "39 €",
    priceValue: 39,
    description: "Für Teams mit höherem Volumen und Priorität.",
    features: [
      { text: "Alle Professional-Features", included: true },
      { text: "Steuerexport CSV", included: true },
      { text: "API-Zugang", included: true },
      { text: "Team-Verwaltung", included: true },
      { text: "Eigenes Branding", included: true },
      { text: "Dedizierter Support", included: true },
    ],
  },
];
```

**Step 2: Rewrite the JSX layout**

Replace the existing `<div style={{ maxWidth: "860px", margin: "0 auto" }}>` wrapper. Remove `maxWidth` to use full width. Change grid from `1fr 1fr` to `repeat(4, 1fr)` with responsive breakpoints via inline media query workaround or CSS class.

Add new CSS class to globals.css for the billing grid:
```css
/* Billing Grid */
.billing-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  align-items: start;
}
@media (max-width: 1100px) {
  .billing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .billing-grid {
    grid-template-columns: 1fr;
  }
}
```

**Step 3: Add recommended plan styling**

For the recommended plan card (Professional), add:
- `transform: translateY(-8px)` elevation
- Accent left border (3px)
- "Empfohlen" badge at top
- Breathe-glow on CTA button
- Stronger shadow

```tsx
<div
  key={plan.id}
  className={`card-hover ${plan.recommended ? 'anim-fade-in-up' : ''}`}
  style={{
    background: "var(--surface)",
    border: plan.recommended ? "2px solid var(--accent)" : isCurrent ? "1px solid var(--accent)" : "1px solid var(--border)",
    boxShadow: plan.recommended ? "var(--shadow-lg)" : "var(--shadow-md)",
    overflow: "hidden",
    transform: plan.recommended ? "translateY(-8px)" : "none",
    position: "relative",
  }}
>
  {plan.recommended && (
    <div style={{
      background: "var(--accent)",
      color: "#fff",
      fontSize: "10px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      padding: "6px 0",
      textAlign: "center",
    }}>
      Empfohlen
    </div>
  )}
  ...
</div>
```

**Step 4: Feature list with included/excluded states**

```tsx
{plan.features.map((f) => (
  <li key={f.text} style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    opacity: f.included ? 1 : 0.4,
  }}>
    <Check style={{
      width: 13,
      height: 13,
      color: f.included ? "var(--success)" : "var(--text-3)",
      flexShrink: 0,
    }} />
    <span style={{
      fontSize: "12px",
      color: f.included ? "var(--foreground)" : "var(--text-3)",
      textDecoration: f.included ? "none" : "line-through",
    }}>
      {f.text}
    </span>
  </li>
))}
```

**Step 5: Price display with /Monat suffix**

```tsx
<div style={{ marginBottom: "4px" }}>
  <span style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}>
    {plan.price}
  </span>
  {plan.priceValue > 0 && (
    <span style={{ fontSize: "13px", color: "var(--text-3)", marginLeft: "4px" }}>/Monat</span>
  )}
</div>
```

**Step 6: CTA button with breathe on recommended**

```tsx
<button
  disabled={isCurrent || isFree}
  className={`btn ${isCurrent || isFree ? "btn-secondary" : "btn-primary"} ${plan.recommended && !isCurrent ? "btn-breathe" : ""}`}
  style={{ width: "100%" }}
>
  <CreditCard style={{ width: 13, height: 13 }} />
  {isCurrent ? "Aktueller Plan" : isFree ? "Kostenlos" : "Upgrade – demnächst"}
</button>
```

**Step 7: Staggered reveal on cards**

Add `reveal-stagger` class to the billing grid container so cards fade in one by one.

**Step 8: Commit**

```bash
git add src/app/globals.css src/app/(dashboard)/billing/page.tsx
git commit -m "feat(billing): 4-column layout, recommended plan highlight, feature comparison"
```

---

### Task 7: TopNav – Add "+ Neuer Kunde" Button

**Files:**
- Modify: `src/components/layout/TopNav.tsx`
- Modify: `src/app/(dashboard)/customers/page.tsx`

**Step 1: Add button to TopNav**

In `src/components/layout/TopNav.tsx`, find the `<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>` container (line 124). Add a new Link+button BEFORE the "Neue Rechnung" button (or after, depending on visual hierarchy). Since "Neue Rechnung" is the primary CTA, place "Neuer Kunde" before it as secondary:

```tsx
<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  {/* Secondary: Neuer Kunde */}
  <Link href="/customers/new" style={{ textDecoration: "none" }}>
    <button
      className="btn btn-secondary"
      style={{
        height: "36px",
        padding: "0 12px",
        fontSize: "13px",
      }}
    >
      <Plus size={14} />
      <span className="topnav-new-label">Neuer Kunde</span>
    </button>
  </Link>

  {/* Primary: Neue Rechnung (existing) */}
  <Link href="/invoices/new" style={{ textDecoration: "none" }}>
    ...existing button...
  </Link>

  {/* User menu (existing) */}
  ...
</div>
```

Add `Users` to the lucide-react import if using a Users icon instead of Plus.

**Step 2: Remove "+ Neuer Kunde" from customers page**

In `src/app/(dashboard)/customers/page.tsx`, remove the Link+button at lines 59-64:
```tsx
<Link href="/customers/new">
  <button className="btn btn-primary">
    <Plus size={15} />
    Neuer Kunde
  </button>
</Link>
```

Keep the page header but without the button. The subtitle with customer count stays.

**Step 3: Verify**

- TopNav shows both buttons on all dashboard pages
- Customers page no longer has duplicate button
- "Neuer Kunde" navigates to `/customers/new`

**Step 4: Commit**

```bash
git add src/components/layout/TopNav.tsx src/app/(dashboard)/customers/page.tsx
git commit -m "feat(topnav): add 'Neuer Kunde' button, remove from customers page"
```

---

### Task 8: Add Billing Grid CSS + Stagger Animation to globals.css

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add billing grid responsive class**

Add before the RESPONSIVE section (around line 1047):

```css
/* ═══════════════════════════════════════
   BILLING GRID
═══════════════════════════════════════ */
.billing-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  align-items: start;
}
@media (max-width: 1100px) {
  .billing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .billing-grid {
    grid-template-columns: 1fr;
  }
}
```

**Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(css): add billing grid responsive class"
```

**Note:** This task should be done BEFORE Task 6 since the billing page depends on this CSS class. Alternatively, combine this step into Task 6.

---

### Task 9: Final Visual QA Pass

**Files:** None (verification only)

**Step 1: Check all pages for consistency**

Run `npm run dev` and verify:

1. **Auth pages** (login, register, reset-password): Inputs have bottom-border only, surface-2 bg, accent focus
2. **Settings**: All inputs unified, disabled inputs muted
3. **Invoice new/edit**: All inputs/selects/textareas consistent
4. **Customer new**: Plain inputs, no UI component border
5. **Keyboard shortcuts modal**: Shows `Shift` + `ß` keys
6. **Sidebar hint**: Shows "Drücke Shift + ß für Tastenkürzel"
7. **Billing page**: 4-column layout, Professional highlighted, features with included/excluded
8. **TopNav**: Both "Neuer Kunde" (secondary) and "Neue Rechnung" (primary+breathe)
9. **Customers page**: No duplicate button in header

**Step 2: Check dark mode**

Toggle dark mode and verify all changes look correct.

**Step 3: Check responsive**

Resize browser to check billing grid collapses to 2x2 at <1100px and 1-col at <600px.

**Step 4: Final commit if any fixes needed**

```bash
git commit -m "fix(polish): final QA adjustments"
```
