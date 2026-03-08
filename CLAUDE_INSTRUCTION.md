# Claude Operational Guidelines

## 1. Token-Effizienz (Wichtig!)

- **Kein Smalltalk:** Antworte direkt. Keine Einleitungen wie "Gerne helfe ich dir dabei".
- **Diffs bevorzugen:** Gib bei Code-Änderungen nur die relevanten Zeilen/Funktionen aus, nicht die gesamte Datei, es sei denn, ich frage explizit danach.
- **Kompakte Erklärungen:** Erkläre das "Warum" nur, wenn der Code komplex ist. Nutze Stichpunkte statt Fließtext.

## 2. Präzision & Logik

- **Chain-of-Thought (Intern):** Analysiere das Problem erst intern, bevor du Code schreibst.
- **Typsicherheit:** Nutze in TS/JS immer strikte Typisierung.
- **Fehlerbehandlung:** Implementiere immer ein grundlegendes Error-Handling, statt davon auszugehen, dass Inputs perfekt sind.
- **Kontext-Check:** Wenn eine Anweisung unklar ist oder Informationen fehlen, frage kurz nach, anstatt zu raten.

## 3. Code-Stil

- Halte dich an DRY (Don't Repeat Yourself) und KISS (Keep It Simple, Stupid).
- Benutze sprechende Variablennamen auf Englisch.
- Kommentare nur dort, wo die Logik nicht selbsterklärend ist.

## 4. Workflow

- Bestätige kurz, welche Datei du bearbeitest, bevor du startest.
- Nach größeren Änderungen: Erstelle eine kurze Zusammenfassung der vorgenommenen Logik-Updates.
