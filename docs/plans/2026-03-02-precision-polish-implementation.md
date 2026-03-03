# Precision Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Evolve Faktura's existing design into a world-class, premium frontend with smooth micro-interactions, magnetic navigation, and polished animations across all surfaces.

**Architecture:** Pure CSS + minimal JS approach. All new animations go into globals.css as reusable classes/keyframes. Component changes are surgical edits to existing files - no new files created. Design tokens already exist and are extended.

**Tech Stack:** CSS custom properties, CSS keyframes, CSS transitions, IntersectionObserver API, React inline style updates

---

### Task 1: Extend Design Tokens & New Keyframes in globals.css

**Files:**
- Modify: `src/app/globals.css:77-87` (animation tokens section)
- Modify: `src/app/globals.css:591-633` (keyframes section)

**Step 1: Add new animation tokens after line 86**

Add these new tokens inside the `:root` block, after `--duration-slow`:

```css
  /* ── Extended Animation Tokens ── */
  --duration-counter: 400ms;
  --duration-fill:    600ms;
  --duration-float:   4s;
  --ease-decel:  cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.8, 0.64, 1);
```

**Step 2: Add new keyframes after existing keyframes block (after line ~633)**

```css
/* ── Precision Polish Keyframes ── */
@keyframes countUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes breatheGlow {
  0%, 100% { box-shadow: 0 0 0 0 var(--accent-soft); }
  50%      { box-shadow: 0 0 16px 4px var(--accent-soft); }
}

@keyframes shimmerSweep {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes floatY {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

@keyframes borderGrowCenter {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

@keyframes shakeSm {
  0%, 100% { transform: translateX(0); }
  25%      { transform: translateX(-3px); }
  75%      { transform: translateX(3px); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes slideOutRight {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(16px); }
}

@keyframes progressShrink {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

@keyframes gradientRotate {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes topNavSlideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

@keyframes revealUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Step 3: Run dev server to verify no CSS errors**

Run: `npm run dev`
Expected: Compiles without errors

**Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(design): add precision polish animation tokens and keyframes"
```

---

### Task 2: Global Polish CSS - Selection, Scrollbar, Dividers, Focus Rings

**Files:**
- Modify: `src/app/globals.css` (multiple sections)

**Step 1: Add custom selection styles after the `html, body` reset (after line ~155)**

```css
/* ── Custom Selection ── */
::selection {
  background: var(--accent-soft);
  color: var(--text-1);
}

/* ── Custom Scrollbar ── */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  transition: background var(--duration-fast) var(--ease-smooth);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
}
```

**Step 2: Enhance focus-visible (find existing focus-visible rule ~line 210 and replace)**

Replace the existing `:focus-visible` rule with:

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--accent-soft);
}
```

**Step 3: Add gradient divider class (after the card section ~line 310)**

```css
/* ── Gradient Divider ── */
.divider-gradient {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--border) 30%, var(--border) 70%, transparent 100%);
  border: none;
}
```

**Step 4: Add top-of-page loading bar class (after page-enter section)**

```css
/* ── Page Loading Bar ── */
.page-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: var(--accent);
  z-index: 9999;
  animation: progressShrink 2s var(--ease-smooth) forwards;
  transform-origin: left;
}
```

**Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(design): add global polish - selection, scrollbar, focus, dividers"
```

---

### Task 3: Enhanced Button System - Ripple, Loading, Disabled States

**Files:**
- Modify: `src/app/globals.css` (button section, lines ~313-380)

**Step 1: Enhance the existing `.btn` base class and add new states**

After the existing `.btn-danger` rule (around line 380), add:

```css
/* ── Button Ripple Effect ── */
.btn {
  position: relative;
  overflow: hidden;
}
.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--ripple-x, 50%) var(--ripple-y, 50%), var(--accent-soft) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0);
  transition: opacity var(--duration-fast), transform var(--duration-normal) var(--ease-decel);
  pointer-events: none;
}
.btn:active::after {
  opacity: 1;
  transform: scale(2.5);
  transition: opacity 0ms, transform var(--duration-normal) var(--ease-decel);
}

/* ── Button Loading State ── */
.btn-loading {
  pointer-events: none;
  position: relative;
}
.btn-loading > * {
  opacity: 0;
  transition: opacity var(--duration-fast);
}
.btn-loading::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid var(--text-3);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ── Button Disabled ── */
.btn:disabled,
.btn[aria-disabled="true"] {
  opacity: 0.5;
  filter: grayscale(0.3);
  pointer-events: none;
  transform: none !important;
  box-shadow: none !important;
}

/* ── Breathing Glow (for primary CTA) ── */
.btn-breathe {
  animation: breatheGlow 3s var(--ease-in-out) infinite;
}
.btn-breathe:hover {
  animation: none;
  box-shadow: 0 0 20px 6px var(--accent-soft);
}
```

**Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(design): add button ripple, loading, disabled, and breathe glow effects"
```

---

### Task 4: Enhanced Input & Form Styles

**Files:**
- Modify: `src/app/globals.css` (input section)

**Step 1: Find the existing input styling section and enhance it**

Add after the existing input styles (around line ~460):

```css
/* ── Enhanced Input Focus ── */
.input-field {
  position: relative;
  border-bottom: 2px solid var(--border);
  transition: border-color var(--duration-normal) var(--ease-smooth);
}
.input-field::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--accent);
  transition: width var(--duration-normal) var(--ease-smooth), left var(--duration-normal) var(--ease-smooth);
}
.input-field:focus-within::after {
  width: 100%;
  left: 0;
}

/* ── Floating Label ── */
.floating-label-wrap {
  position: relative;
}
.floating-label-wrap label {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-3);
  font-size: 14px;
  pointer-events: none;
  transition: all var(--duration-normal) var(--ease-smooth);
  transform-origin: left top;
}
.floating-label-wrap input:focus ~ label,
.floating-label-wrap input:not(:placeholder-shown) ~ label,
.floating-label-wrap textarea:focus ~ label,
.floating-label-wrap textarea:not(:placeholder-shown) ~ label {
  top: -8px;
  transform: translateY(0) scale(0.85);
  color: var(--accent);
  font-weight: 500;
}

/* ── Validation States ── */
.input-success {
  border-color: var(--success) !important;
  animation: none;
}
.input-success::after {
  background: var(--success) !important;
  width: 100% !important;
  left: 0 !important;
}
.input-error {
  border-color: var(--danger) !important;
  animation: shakeSm 0.3s var(--ease-smooth);
}
.input-error::after {
  background: var(--danger) !important;
  width: 100% !important;
  left: 0 !important;
}

/* ── Line Item Animations ── */
.line-item-enter {
  animation: slideInLeft var(--duration-normal) var(--ease-smooth) forwards;
}
.line-item-exit {
  animation: slideOutRight var(--duration-fast) var(--ease-smooth) forwards;
}

/* ── AI Draft Button Gradient Border ── */
.btn-ai-gradient {
  background: linear-gradient(90deg, var(--accent), #6b5ce7, var(--accent));
  background-size: 200% 100%;
  animation: gradientRotate 3s ease infinite;
  color: white;
  border: none;
}
.btn-ai-gradient:hover {
  filter: brightness(1.15);
}
```

**Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(design): add input focus animations, floating labels, validation states"
```

---

### Task 5: Enhanced Card & Invoice Row Styles

**Files:**
- Modify: `src/app/globals.css` (card and invoice-row sections)

**Step 1: Enhance card hover with accent top border (update existing .card-hover)**

Find `.card-hover` (around line ~300) and update it:

```css
.card-hover {
  transition:
    transform var(--duration-normal) var(--ease-spring),
    box-shadow var(--duration-normal) var(--ease-smooth),
    border-color var(--duration-normal) var(--ease-smooth);
  border-top: 2px solid transparent;
}
.card-hover:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
  border-top-color: var(--accent);
}
```

**Step 2: Enhance invoice-row hover (update existing .invoice-row)**

Find `.invoice-row` (around line ~424) and enhance:

```css
.invoice-row {
  position: relative;
  transition: background-color var(--duration-fast) var(--ease-smooth);
}
.invoice-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent);
  transform: scaleY(0);
  transition: transform var(--duration-normal) var(--ease-spring);
}
.invoice-row:hover {
  background: var(--accent-soft);
}
.invoice-row:hover::before {
  transform: scaleY(1);
}
```

**Step 3: Add overdue badge pulse**

```css
/* ── Overdue Pulse Dot ── */
.badge-overdue::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--danger);
  border-radius: 50%;
  margin-right: 4px;
  animation: breatheGlow 2s ease-in-out infinite;
  vertical-align: middle;
}
```

**Step 4: Add staggered reveal utility classes**

```css
/* ── Staggered Reveal ── */
.reveal-stagger > * {
  opacity: 0;
  animation: revealUp var(--duration-slow) var(--ease-decel) forwards;
}
.reveal-stagger > *:nth-child(1) { animation-delay: 0ms; }
.reveal-stagger > *:nth-child(2) { animation-delay: 60ms; }
.reveal-stagger > *:nth-child(3) { animation-delay: 120ms; }
.reveal-stagger > *:nth-child(4) { animation-delay: 180ms; }
.reveal-stagger > *:nth-child(5) { animation-delay: 240ms; }
.reveal-stagger > *:nth-child(6) { animation-delay: 300ms; }
.reveal-stagger > *:nth-child(7) { animation-delay: 360ms; }
.reveal-stagger > *:nth-child(8) { animation-delay: 420ms; }
```

**Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(design): enhance cards, invoice rows, overdue pulse, staggered reveals"
```

---

### Task 6: Sidebar - Magnetic Hover Indicator

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

**Step 1: Refactor the sidebar to use a magnetic left-edge indicator instead of background pill**

The current sidebar has a pill/background indicator that follows the active nav item. Replace it with a left-edge accent bar that magnetically follows hover AND shows on active.

Key changes:
- Track `hoverIndex` state in addition to active index
- The indicator bar uses `hoverIndex ?? activeIndex` for positioning
- Indicator is a 3px wide, accent-colored bar on the left edge
- Active item gets accent-soft background + accent icon/text
- Hover items get subtle text-1 color shift

Replace the nav section (lines ~122-157) with updated code that:
1. Adds `onMouseEnter` per nav item to set `hoverIndex`
2. Adds `onMouseLeave` on the nav container to reset `hoverIndex` to null
3. Changes the indicator div from a background pill to a left-edge bar (3px wide, positioned with `top` transition)
4. Active item: accent-colored icon, text-1 text, accent-soft background, `inset 0 0 20px var(--accent-soft)` inner glow
5. Hovered (non-active) item: icon shifts to accent, text shifts to text-1

**Step 2: Verify sidebar behavior in browser**

Run: `npm run dev`
Navigate to dashboard and test:
- Hover over different nav items - indicator bar should slide smoothly
- Leave nav area - indicator returns to active item
- Click nav item - indicator stays on new active item

**Step 3: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat(design): magnetic hover indicator on sidebar navigation"
```

---

### Task 7: TopNav - Entrance Animation & Enhanced Interactions

**Files:**
- Modify: `src/components/layout/TopNav.tsx`

**Step 1: Add entrance animation to the topnav frame**

On the outer header element (line ~86), add:
```
style={{ animation: 'topNavSlideDown 300ms var(--ease-spring) forwards' }}
```

**Step 2: Add breathing glow to "Neue Rechnung" button**

On the "Neue Rechnung" button (lines ~125-145), add the `btn-breathe` class alongside existing classes.

**Step 3: Enhance dropdown animation**

In the dropdown menu (lines ~194-206), update the entrance to use staggered item fade-in. Add `reveal-stagger` class to the dropdown container.

**Step 4: Verify in browser**

Run: `npm run dev`
- Reload page - topnav should slide down from top
- "Neue Rechnung" button should have subtle breathing glow
- User dropdown items should stagger in

**Step 5: Commit**

```bash
git add src/components/layout/TopNav.tsx
git commit -m "feat(design): topnav entrance animation, button glow, staggered dropdown"
```

---

### Task 8: Dashboard Page - Counter Animations & Enhanced Stats

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

**Step 1: Add a useCountUp hook at the top of the file**

```tsx
function useCountUp(target: number, duration = 400) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>();
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);
  return value;
}
```

**Step 2: Apply counter animation to stat card values**

In the stats cards rendering section (lines ~178-208), use `useCountUp` for numeric stat values so they animate from 0 to their actual value on mount.

**Step 3: Add `reveal-stagger` class to the stats grid container**

The parent grid that holds the 4 stat cards should get `className="reveal-stagger"` so they cascade in.

**Step 4: Enhance Business Health Score progress bar**

In the health score section (lines ~232-240), the bar already has a width transition. Add a color gradient:
```css
background: linear-gradient(90deg, var(--danger) 0%, var(--warning) 50%, var(--success) 100%)
```
And use `clip-path` or width to reveal only the portion matching the score.

**Step 5: Add `reveal-stagger` to recent invoices list**

The recent invoices container should use `reveal-stagger` for cascading row appearance.

**Step 6: Verify in browser**

- Stat numbers should count up from 0
- Cards should cascade in with staggered delays
- Health score bar should fill with gradient
- Recent invoices should stagger in

**Step 7: Commit**

```bash
git add src/app/(dashboard)/dashboard/page.tsx
git commit -m "feat(design): dashboard counter animations, staggered reveals, gradient health bar"
```

---

### Task 9: Invoice List Page - Enhanced Row Interactions

**Files:**
- Modify: `src/app/(dashboard)/invoices/page.tsx`

**Step 1: Add `reveal-stagger` to the invoice list container**

Wrap the invoice rows container in a div with `className="reveal-stagger"`.

**Step 2: Add overdue badge pulse**

The overdue status badges already use `className="badge badge-overdue"`. The CSS from Task 5 adds the `::before` pulse dot automatically - no component change needed.

**Step 3: Add empty state floating animation**

If the empty state exists (lines ~143-189), add to the empty state icon/illustration:
```
style={{ animation: 'floatY 3s ease-in-out infinite' }}
```

**Step 4: Verify and commit**

```bash
git add src/app/(dashboard)/invoices/page.tsx
git commit -m "feat(design): invoice list staggered reveals and empty state animation"
```

---

### Task 10: New Invoice Form - Line Item Animations & AI Button

**Files:**
- Modify: `src/app/(dashboard)/invoices/new/page.tsx`

**Step 1: Add `line-item-enter` class to new line items**

When a line item is rendered, give it `className="line-item-enter"`.

**Step 2: Style the AI Draft button**

Find the AI draft button (lines ~264-295) and add `className="btn-ai-gradient"` to make it stand out with the rotating gradient border.

**Step 3: Add counter animation to totals**

The subtotal/tax/total display should use inline transition:
```
style={{ transition: 'all 200ms ease' }}
```

**Step 4: Verify and commit**

```bash
git add src/app/(dashboard)/invoices/new/page.tsx
git commit -m "feat(design): invoice form line item animations and AI gradient button"
```

---

### Task 11: Marketing Header - Smooth Magnetic Indicator

**Files:**
- Modify: `src/components/layout/MarketingHeader.tsx`

**Step 1: Verify existing indicator behavior**

The marketing header already has a sliding indicator (lines ~157-169). Verify it works smoothly. If the transitions are correct, this may just need minor polish.

**Step 2: Enhance indicator styling**

Update the indicator div to:
- Height: 2px (instead of 1px if current)
- Add a subtle glow: `box-shadow: 0 1px 8px var(--accent-soft)`
- Ensure spring easing is used

**Step 3: Add entrance animation to the header**

```
style={{ animation: 'topNavSlideDown 300ms var(--ease-spring) forwards' }}
```

**Step 4: Commit**

```bash
git add src/components/layout/MarketingHeader.tsx
git commit -m "feat(design): marketing header enhanced indicator and entrance animation"
```

---

### Task 12: Homepage - Hero Animations & Scroll Reveals

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css` (add scroll-reveal utility)

**Step 1: Add scroll-reveal CSS utility to globals.css**

```css
/* ── Scroll Reveal ── */
.scroll-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity var(--duration-slow) var(--ease-decel), transform var(--duration-slow) var(--ease-decel);
}
.scroll-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}
```

**Step 2: Add a useScrollReveal hook in page.tsx**

```tsx
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
```

**Step 3: Apply scroll-reveal to sections below the fold**

Add `className="scroll-reveal"` to:
- "Wie es funktioniert" section (lines ~167-189)
- "Schluss mit Excel-Chaos" section (lines ~193-258)
- Testimonials section (lines ~262-312)
- CTA section (lines ~316-354)

**Step 4: Add floating animation to invoice mockup**

On the invoice mockup card (lines ~97-162), add:
```
style={{ animation: 'floatY 4s ease-in-out infinite' }}
```

**Step 5: Add shimmer sweep to the primary CTA button**

On the main CTA button in the hero, add `className="btn-breathe"`.

**Step 6: Add radial gradient to hero background**

Update the hero section background to include:
```
background: radial-gradient(ellipse at 60% 40%, var(--accent-soft) 0%, transparent 60%)
```

**Step 7: Verify and commit**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "feat(design): homepage scroll reveals, floating mockup, hero gradient, CTA glow"
```

---

### Task 13: Pricing Page - Elevated Recommended Plan & Hover Effects

**Files:**
- Modify: `src/app/preise/page.tsx`

**Step 1: Elevate the recommended plan**

Find the "Professional" or recommended plan card (in the PLANS array, lines ~12-86). Give it:
- `transform: translateY(-8px)`
- Accent left border (or top border): `borderTop: '3px solid var(--accent)'`
- Enhanced shadow: `boxShadow: 'var(--shadow-lg)'`

**Step 2: Add hover lift to all plan cards**

All plan cards should have `className="card-hover"` so they lift on hover.

**Step 3: Add scroll-reveal to pricing section and FAQ**

Add `className="scroll-reveal"` to the plans grid and FAQ section.

**Step 4: Verify and commit**

```bash
git add src/app/preise/page.tsx
git commit -m "feat(design): pricing page elevated recommended plan and hover effects"
```

---

### Task 14: Statistics Page - Chart Animations & Enhanced KPI Cards

**Files:**
- Modify: `src/app/(dashboard)/statistics/page.tsx`

**Step 1: Add `reveal-stagger` to KPI cards grid**

The grid containing KpiCard components (lines ~215-239) should get `className="reveal-stagger"`.

**Step 2: Add counter animation to KPI values**

Import or duplicate the `useCountUp` pattern from the dashboard. Apply to KPI card values.

**Step 3: Add entrance animation to chart containers**

Wrap each chart in a div with `className="scroll-reveal"` or use `anim-fade-in-up` with delays.

**Step 4: Verify and commit**

```bash
git add src/app/(dashboard)/statistics/page.tsx
git commit -m "feat(design): statistics page staggered KPIs and chart entrance animations"
```

---

### Task 15: Dropdown & Modal Polish in globals.css

**Files:**
- Modify: `src/app/globals.css` (dropdown and modal sections)

**Step 1: Enhance dropdown stagger (update .dropdown-enter section ~line 827)**

```css
.dropdown-enter {
  animation: dropdownEnter var(--duration-fast) var(--ease-spring) forwards;
}
.dropdown-enter > * {
  opacity: 0;
  animation: revealUp var(--duration-fast) var(--ease-smooth) forwards;
}
.dropdown-enter > *:nth-child(1) { animation-delay: 0ms; }
.dropdown-enter > *:nth-child(2) { animation-delay: 40ms; }
.dropdown-enter > *:nth-child(3) { animation-delay: 80ms; }
.dropdown-enter > *:nth-child(4) { animation-delay: 120ms; }
.dropdown-enter > *:nth-child(5) { animation-delay: 160ms; }
```

**Step 2: Add modal backdrop blur**

```css
/* ── Modal Backdrop ── */
[data-radix-dialog-overlay] {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.3);
  animation: fadeIn var(--duration-normal) var(--ease-smooth) forwards;
}
[data-radix-dialog-content] {
  animation: dropdownEnter var(--duration-normal) var(--ease-spring) forwards;
}
```

**Step 3: Enhance toast styles (for sonner)**

```css
/* ── Toast Polish ── */
[data-sonner-toaster] [data-sonner-toast] {
  border-radius: 0 !important;
  box-shadow: var(--shadow-lg) !important;
  border: 1px solid var(--border) !important;
}
```

**Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(design): dropdown stagger, modal backdrop blur, toast polish"
```

---

### Task 16: Icon Transitions & Micro-details

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add smooth icon transition utility**

```css
/* ── Icon Transitions ── */
.icon-transition {
  transition: transform var(--duration-normal) var(--ease-spring), color var(--duration-fast) var(--ease-smooth);
}
.icon-transition:hover {
  transform: scale(1.1);
}

/* ── Smooth Chevron ── */
.chevron-rotate {
  transition: transform var(--duration-normal) var(--ease-spring);
}
.chevron-rotate[data-open="true"],
.chevron-rotate.open {
  transform: rotate(180deg);
}

/* ── Number Animation Utility ── */
.number-animate {
  font-variant-numeric: tabular-nums;
  transition: all var(--duration-counter) var(--ease-decel);
}
```

**Step 2: Enhance skeleton shimmer with accent hint**

Find the existing `@keyframes shimmer` and update the gradient to include a subtle accent color:

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-2) 25%,
    var(--accent-soft) 50%,
    var(--surface-2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
```

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(design): icon transitions, chevron rotation, enhanced skeleton shimmer"
```

---

### Task 17: Final Integration Test & Reduced Motion

**Files:**
- Modify: `src/app/globals.css` (update prefers-reduced-motion section ~line 1001)

**Step 1: Ensure all new animations respect reduced motion**

Update the `@media (prefers-reduced-motion: reduce)` section:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .scroll-reveal {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

**Step 2: Full browser verification**

Run: `npm run dev`
Test all pages:
- [ ] Dashboard: stat counters animate, cards stagger in, health bar fills
- [ ] Sidebar: magnetic hover indicator slides smoothly
- [ ] TopNav: slides down on load, button glows, dropdown staggers
- [ ] Invoices list: rows highlight with accent sweep, overdue badges pulse
- [ ] New invoice: line items animate, AI button has gradient
- [ ] Homepage: scroll reveals work, mockup floats, CTA glows
- [ ] Pricing: recommended plan elevated, cards hover-lift
- [ ] Statistics: KPIs stagger, charts animate in
- [ ] Dark mode: all effects work correctly in both themes
- [ ] Reduced motion: animations disabled gracefully

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(design): reduced motion support and final polish pass"
```

---

## Task Dependency Order

```
Task 1 (tokens/keyframes) → Task 2 (global polish) → Task 3 (buttons)
    ↓
Task 4 (inputs) → Task 5 (cards/rows) → Task 15 (dropdowns) → Task 16 (micro-details)
    ↓
Task 6 (sidebar) → Task 7 (topnav) → Task 8 (dashboard) → Task 9 (invoices)
    ↓
Task 10 (new invoice) → Task 11 (marketing header) → Task 12 (homepage)
    ↓
Task 13 (pricing) → Task 14 (statistics) → Task 17 (final test)
```

Tasks 1-5 are CSS-only foundation work. Tasks 6-16 are component integration. Task 17 is verification.
