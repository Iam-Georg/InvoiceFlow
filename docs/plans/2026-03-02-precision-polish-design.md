# Faktura "Precision Polish" Design

**Date:** 2026-03-02
**Approach:** Evolve & polish existing identity with premium micro-interactions
**Inspiration:** Linear's precision + Stripe's data beauty + Apple's smoothness

## 1. Navigation & Transitions

### Sidebar
- **Magnetic hover indicator:** Smooth-gliding accent line (3px left edge) follows hover with spring physics
- **Hover states:** accent-soft bg fade-in (120ms), icon/text color shift to accent/text-1 (180ms)
- **Active state:** Left accent bar + accent-soft bg + inner glow (`inset 0 0 20px var(--accent-soft)`)

### TopNav
- Slide-down entrance on page load (300ms spring)
- "Neue Rechnung" button: subtle breathing glow on idle, stronger on hover
- User menu dropdown: scale + opacity entrance, items highlight with accent-soft sweep left-to-right

### Page Transitions
- Outgoing: fade out + slide down (150ms)
- Incoming: fade in + slide up (240ms, staggered children 60ms delays)
- Sidebar indicator slides in sync with navigation

### Staggered Reveals
- Page title: 0ms, primary cards: 60ms each, secondary: 120ms each
- Cascading "waterfall" fade-in-up effect

## 2. Dashboard & Data Display

### Stat Cards
- Number counter animation: 0 to value (400ms ease-out deceleration)
- Hover: translateY(-3px) + shadow + thin accent top border fade-in (2px, 180ms)
- Primary stat: subtle pulsing accent underline glow
- Trend indicators: up/down arrows with green/red for month-over-month change

### Business Health Score
- Animated progress bar: fills 0% to value (600ms ease-out)
- Color gradient through bar (red -> orange -> green)
- Score number counts up alongside bar

### Invoice List / Tables
- Row hover: full-row accent-soft bg sweep left-to-right (180ms) following accent line
- Status badges: 4px dot indicator, pulse animation on overdue items
- Amount column: smooth fade highlight on value change
- Empty state: illustrated floating animation (translateY oscillating 4px, 3s)

### Charts
- Draw-in animation: bars/lines animate left-to-right on scroll (600ms staggered)
- Hover tooltips: fade + scale
- Active data point: glow ring

## 3. Marketing / Landing Pages

### Hero
- Headline: staggered word-by-word fade-in-up (80ms per word)
- Invoice mockup: float-in from right + continuous float (translateY 6px, 4s loop)
- CTA button: shimmer effect sweeping across (light reflection, every 4s)
- Background: radial gradient from accent-soft center to bg edges

### "How It Works"
- Scroll-triggered reveal: cards fade-in + slide-up (IntersectionObserver, 200ms stagger)
- Large semi-transparent accent step numbers (80px) behind cards
- Dashed connection lines between steps

### Before/After
- Subtle tilt toward cursor on hover (2-3 degree perspective)
- Before: desaturation filter; After: full color + accent border glow

### Testimonials
- Mobile: horizontal scroll carousel with snap points
- Large decorative accent quote marks as background
- Avatar: accent-colored ring border

### Pricing
- Recommended plan: translateY(-8px), accent border, badge with glow
- Hover: lift + shadow, feature checkmarks stagger in
- Price counter animation on toggle

## 4. Forms & Interactions

### Input Fields
- Focus: bottom border grows from center outward (0 -> 100%, 200ms accent)
- Floating labels: translate up + scale(0.85) on focus/filled
- Validation: green flash (success), shake animation (error, 3px, 2 cycles)

### Invoice Creation
- Line item add: slide in from left + fade (200ms)
- Line item remove: slide out right + fade (150ms), smooth reflow
- Amount calculation: counter animation on subtotal/tax/total (200ms)
- AI Draft button: rotating gradient border animation (2s loop)

### Buttons (Global)
- Click ripple: circular accent-soft expanding from click point (300ms)
- Loading: text fades, spinner appears, width stable
- Disabled: reduced opacity + grayscale, no hover

### Dropdowns & Modals
- Dropdown items: stagger-fade-in from top (40ms each)
- Modal: backdrop blur-in (0 -> 8px, 200ms), modal spring-scale from 0.95
- Close: reverse animations

### Toast Notifications
- Entrance: slide from right + fade (200ms spring)
- Auto-dismiss: progress bar shrinks along bottom
- Exit: slide out right (150ms)

## 5. Global Polish

### Cursor & Selection
- Custom `::selection` with accent-soft background
- Thin scrollbar (6px), accent thumb on hover, transparent track

### Loading States
- Enhanced skeleton shimmer with accent color hint
- Top-of-viewport accent progress bar (YouTube/GitHub style)

### Micro-details
- Focus rings: existing 2px outline + soft glow shadow for depth
- Dividers: gradient fade on edges (strongest center, transparent edges)
- Icon transitions: smooth rotation/morph instead of snap
