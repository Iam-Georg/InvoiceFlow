# Design: Physikalische Konsistenz, Input-Vereinheitlichung & UI-Polish

**Datum:** 2026-03-02
**Ansatz:** CSS-First (kein zusätzliches Package)

---

## 1. Globales Animations-System

### Transition-Defaults
Alle interaktiven Elemente erhalten Basis-Transitions auf `background-color`, `color`, `border-color`, `box-shadow`, `transform`, `opacity` mit `var(--duration-fast)` / `var(--ease-smooth)`.

### Hover-States
- **Buttons:** `translateY(-1px)` + Shadow-Lift
- **Cards:** `var(--shadow-hover)` Elevation
- **Links/Nav:** Farb-Transition zu accent
- **Tabellenzeilen:** Background-Sweep von links

### Klick-States
- **Buttons:** `scale(0.97)` auf `:active`
- **Nav-Items:** Sofortiges Feedback, dann smooth transition

### Focus-States
- `box-shadow: 0 0 0 2px var(--accent-soft)` statt `outline`
- Transition auf dem Shadow

### Reduced Motion
- `@media (prefers-reduced-motion: reduce)`: Alle Animationen auf `0.01ms`, Transitions instant

---

## 2. Input-Vereinheitlichung (FeedbackWidget-Referenz)

### Globaler Input-Style in globals.css
```css
input, textarea, select {
  background: var(--surface-2);
  border: none;
  border-bottom: 1.5px solid var(--border);
  height: 44px;
  padding: 0 12px;
  color: var(--text-1);
  font-size: 13px;
  transition: all var(--duration-fast) var(--ease-smooth);
}
input:focus, textarea:focus, select:focus {
  background: var(--surface);
  border-bottom-color: var(--accent);
  box-shadow: 0 1px 0 0 var(--accent);
  outline: none;
}
```

### Betroffene Seiten
- Settings (Profil/Firma)
- Customers/new
- Invoices/new + edit
- Login/Register
- Support

---

## 3. Tastenkürzel Windows/DE-Layout

### Änderungen
- `?` → `Shift + ß` in der Anzeige
- Sidebar-Hint: "Drücke Shift + ß für Tastenkürzel"
- kbd-Elemente zeigen physische Tasten
- Alle anderen Shortcuts (N, K, D, R, S, Esc) sind DE-kompatibel

---

## 4. Billing-Seite Redesign

### Layout
- 4 Spalten horizontal, volle Dashboard-Breite
- Responsive: 2x2 < 900px, 1 Spalte < 600px

### Empfohlener Plan ("Professional") hervorgehoben
- `translateY(-8px)` Elevation
- Accent-Border + stärkerer Shadow
- "Empfohlen"-Badge
- CTA mit Breathe-Glow

### Überzeugungselemente
- Erweiterte Feature-Liste
- Häkchen in Accent für inkludierte Features
- Ausgegraut/durchgestrichen für nicht-inkludierte
- Preis prominent mit "/Monat"
- Staggered fade-in Animation

---

## 5. TopNav: "+ Neuer Kunde"

### Umsetzung
- Zweiter Button neben "Neue Rechnung" (immer sichtbar)
- Style: `btn btn-secondary` (sekundäre Hierarchie)
- Icon: Plus + "Neuer Kunde"
- Link: `/customers/new`
- Button auf Kunden-Seite entfernen

### Button-Hierarchie
1. "Neue Rechnung" → Primary + Breathe-Glow
2. "Neuer Kunde" → Secondary/Ghost
