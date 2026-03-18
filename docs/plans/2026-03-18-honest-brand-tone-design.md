# Ehrliche Marke - Chirurgische Textkorrektur

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Alle Website-Texte 100% ehrlich, freundlich und nicht-wertend gestalten.

**Architecture:** Reine Text-Edits in 6 Dateien. Keine strukturellen Aenderungen, kein neues Styling. Testimonial-Section wird durch Feedback-Box mit gleichem Layout-Stil ersetzt.

**Tech Stack:** Next.js, React, TSX

---

### Task 1: Homepage — Wertende "Frueher"-Section neutral umschreiben

**Files:**
- Modify: `src/app/page.tsx:210-237`

**Step 1: Aendere den Section-Label**

Zeile 211: `Das kennen wir alle` -> `Rechnungen schreiben kann einfacher sein`

**Step 2: Aendere die Ueberschrift**

Zeile 217: `Schluss mit Excel-Chaos.` -> `Dein Rechnungsprozess, vereinfacht.`

**Step 3: Aendere die 5 "Frueher"-Bulletpoints**

Zeilen 232-237, ersetze das Array:
```
"Word-Dokument als Rechnungsvorlage"       -> "Rechnungen ohne Umwege erstellen"
"Mahnungen vergessen – Geld weg"           -> "Erinnerungen an ausstehende Zahlungen"
"Keine Ahnung, wer noch schuldet"          -> "Offene Posten leicht im Blick behalten"
"Stundenlange Vorbereitung fürs Steuerbüro" -> "Daten fürs Steuerbüro schnell bereit"
"Jede Rechnung kostet 20 Minuten"          -> "Weniger Zeit für Papierkram"
```

**Step 4: Aendere auch den ersten "Mit Faktura"-Punkt**

Zeile 259: `Rechnung in 3 Minuten, professionell` -> `Rechnung schnell erstellt, professionell`

**Step 5: Verifiziere**

Run: `npx next build 2>&1 | head -5` — sollte ohne Fehler kompilieren

---

### Task 2: Homepage — Zeitversprechen abschwaechen

**Files:**
- Modify: `src/app/page.tsx:73,188,337`

**Step 1: Hero-Subheading**

Zeile 73: `Professionelle Rechnungen in unter 3 Minuten.` -> `Professionelle Rechnungen in wenigen Minuten.`

**Step 2: Schritt 02 Text**

Zeile 188: `In unter 3 Minuten versandbereit.` -> `Schnell versandbereit.`

**Step 3: CTA-Headline**

Zeile 337: `Deine erste Rechnung. In 3 Minuten.` -> `Deine erste Rechnung. Schnell erstellt.`

---

### Task 3: Homepage — Fake-Testimonials durch Feedback-Box ersetzen

**Files:**
- Modify: `src/app/page.tsx:276-328`

Ersetze die gesamte Testimonial-Section (Zeilen 276-328) durch:

```tsx
{/* -- SECTION B: Ehrliche Feedback-Box -- */}
<div className="scroll-reveal" style={{ background: "var(--bg)" }}>
  <div style={{ maxWidth: "700px", margin: "0 auto", padding: "72px 40px", textAlign: "center" }}>
    <p className="label-caps" style={{ marginBottom: "16px" }}>Wir sind neu</p>
    <h2 style={{
      fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em",
      color: "var(--text-1)", marginBottom: "12px", lineHeight: 1.2,
    }}>
      Faktura ist ein junges Produkt.
    </h2>
    <p style={{
      fontSize: "15px", color: "var(--text-2)", lineHeight: 1.7,
      marginBottom: "28px", maxWidth: "480px", margin: "0 auto 28px",
    }}>
      Wir arbeiten jeden Tag daran, es besser zu machen.
      Wenn du Feedback hast, freuen wir uns darüber.
    </p>
    <Link href="/register" style={{ textDecoration: "none" }}>
      <button className="btn btn-primary" style={{ height: "44px", padding: "0 28px", fontSize: "14px" }}>
        Kostenlos ausprobieren
      </button>
    </Link>
  </div>
</div>
```

---

### Task 4: Industrie-Seite — Fake-Testimonials durch Feedback-Box ersetzen

**Files:**
- Modify: `src/app/fuer/page.tsx:115-150`

Ersetze die gesamte Social-Proof-Section (Zeilen 115-150) durch die gleiche ehrliche Feedback-Box wie auf der Homepage (angepasst an das Layout der Seite):

```tsx
{/* Ehrliche Feedback-Box */}
<section style={{
  padding: "48px 24px",
  borderTop: "1px solid var(--border)",
  borderBottom: "1px solid var(--border)",
  background: "var(--surface)",
}}>
  <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
    <p style={{
      fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em",
      textTransform: "uppercase", color: "var(--accent)", marginBottom: "12px",
    }}>
      Wir sind neu
    </p>
    <h3 style={{
      fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em",
      color: "var(--text-1)", marginBottom: "10px",
    }}>
      Faktura ist ein junges Produkt.
    </h3>
    <p style={{
      fontSize: "14px", color: "var(--text-2)", lineHeight: 1.7,
    }}>
      Wir arbeiten jeden Tag daran, es besser zu machen.
      Wenn du Feedback hast, freuen wir uns darüber.
    </p>
  </div>
</section>
```

---

### Task 5: Preise-Seite — Tabelle und Karte korrigieren

**Files:**
- Modify: `src/app/preise/page.tsx:27,107,722`

**Step 1: Pricing-Karte Free-Plan korrigieren**

Zeile 27: `"1 Kunde"` -> `"3 Kunden"`

**Step 2: Vergleichstabelle Free-Rechnungen korrigieren**

Zeile 107: `free: "5/Mo"` -> `free: "3/Mo"`

**Step 3: Vergleichstabelle Starter-Rechnungen korrigieren**

Zeile 107: `starter: "50/Mo"` -> `starter: "10/Mo"`

**Step 4: CTA Zeitversprechen abschwaechen**

Zeile 722: `Erstelle deine erste Rechnung in unter 2 Minuten. Kostenlos.` -> `Erstelle deine erste Rechnung. Schnell und kostenlos.`

---

### Task 6: Rechtsseiten — Platzhalter-Hinweis auf Impressum, AGB, Datenschutz

**Files:**
- Modify: `src/app/impressum/page.tsx` (am Anfang der Seite)
- Modify: `src/app/agb/page.tsx` (am Anfang der Seite)
- Modify: `src/app/datenschutz/page.tsx` (am Anfang der Seite)

Auf jeder dieser 3 Seiten einen Hinweis-Banner als erstes Element nach dem Header einfuegen:

```tsx
<div style={{
  maxWidth: "800px", margin: "0 auto", padding: "16px 24px",
  background: "var(--warning-bg, #FFF3CD)", border: "1px solid var(--warning-border, #FFE69C)",
  fontSize: "13px", color: "var(--warning-text, #664D03)", lineHeight: 1.6,
  marginBottom: "24px",
}}>
  Diese Seite befindet sich im Aufbau. Die angezeigten Firmendaten sind Platzhalter und werden vor dem offiziellen Launch durch echte Angaben ersetzt.
</div>
```

**Step 2: AGB korrigieren**

In der AGB `src/app/agb/page.tsx` Zeile 31: `1 Kunde` -> `3 Kunden` (im Text "max. 3 Rechnungen/Monat, 1 Kunde")

---

### Task 7: Verifizieren und Commit

**Step 1:** Run build um sicherzustellen, dass alles kompiliert
**Step 2:** Manuell im Browser pruefen
**Step 3:** Commit mit Nachricht: "refactor: make all marketing texts honest, friendly, and non-judgmental"
