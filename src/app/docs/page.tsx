import type { Metadata } from "next";
import Link from "next/link";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

export const metadata: Metadata = {
  title: "Dokumentation",
  description:
    "Vollständige Übersicht aller Faktura-Funktionen. Erfahre wie Rechnungserstellung, KI-Assistent, Statistiken und Automatisierung funktionieren – und welcher Plan was enthält.",
};

/* ── Plan Badge ──────────────────────────────────────────────── */
type Plan = "free" | "starter" | "professional" | "business";

const PLAN_CFG: Record<Plan, { label: string; bg: string; color: string; border: string }> = {
  free:         { label: "Kostenlos",    bg: "var(--badge-draft-bg)", color: "var(--text-2)",  border: "transparent" },
  starter:      { label: "Starter",      bg: "var(--accent-soft)",    color: "var(--accent)",  border: "var(--accent-soft)" },
  professional: { label: "Professional", bg: "rgba(96,64,204,0.08)", color: "#6040CC",        border: "rgba(96,64,204,0.15)" },
  business:     { label: "Business",     bg: "var(--text-1)",         color: "var(--surface)", border: "transparent" },
};

function Badge({ plan }: { plan: Plan }) {
  const c = PLAN_CFG[plan];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 8px",
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      fontSize: "9px", fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase",
      whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {c.label}
    </span>
  );
}

/* ── Mockup Shell ────────────────────────────────────────────── */
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

/* ── Individual Mockups ──────────────────────────────────────── */
function MockInvoiceList() {
  const rows = [
    { nr: "RE-2025-001", cust: "Müller GmbH",  status: "offen",    bg: "var(--warning-bg)", tc: "var(--warning)",   amt: "1.904,00 €" },
    { nr: "RE-2025-002", cust: "Meyer & Co.",  status: "bezahlt",  bg: "var(--success-bg)", tc: "var(--success)",   amt: "3.570,00 €" },
    { nr: "RE-2025-003", cust: "Schulz AG",    status: "entwurf",  bg: "var(--badge-draft-bg)", tc: "var(--text-2)",   amt: "714,00 €"   },
    { nr: "RE-2025-004", cust: "Weber IT",     status: "überfällig",bg: "var(--danger-bg)", tc: "var(--danger)",  amt: "2.261,00 €" },
  ];
  return (
    <MockShell>
      <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid var(--divider)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-1)" }}>Rechnungen</span>
        <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", background: "var(--accent)", padding: "2px 8px" }}>+ Neu</span>
      </div>
      {rows.map((r) => (
        <div key={r.nr} style={{ display: "flex", alignItems: "center", padding: "7px 14px", borderBottom: "1px solid var(--divider)", gap: "8px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.3 }}>{r.nr}</p>
            <p style={{ fontSize: "9px", color: "var(--text-3)", lineHeight: 1.3 }}>{r.cust}</p>
          </div>
          <span style={{ fontSize: "8px", fontWeight: 700, padding: "1px 5px", background: r.bg, color: r.tc, textTransform: "uppercase", letterSpacing: "0.04em" }}>{r.status}</span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-1)", fontVariantNumeric: "tabular-nums" }}>{r.amt}</span>
        </div>
      ))}
    </MockShell>
  );
}

function MockAI() {
  return (
    <MockShell>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--divider)" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-1)", marginBottom: "6px" }}>KI-Rechnungserstellung</p>
        <div style={{ border: "1px solid var(--border)", padding: "6px 8px", background: "var(--surface-2)", fontSize: "9px", color: "var(--text-2)" }}>
          Website Redesign, 12h à 75€, plus 3h Beratung à 90€...
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
          <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", background: "var(--accent)", padding: "2px 8px" }}>✦ Positionen erzeugen</span>
        </div>
      </div>
      <div style={{ padding: "8px 14px" }}>
        {[
          { desc: "Website Redesign", qty: "12h", price: "75,00 €", total: "900,00 €" },
          { desc: "Beratung & Konzept", qty: "3h",  price: "90,00 €", total: "270,00 €" },
        ].map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 30px 52px 52px", gap: "6px", padding: "3px 0", borderBottom: i === 0 ? "1px solid var(--divider)" : "none", alignItems: "center" }}>
            <span style={{ fontSize: "9px", color: "var(--text-1)", fontWeight: 500 }}>{r.desc}</span>
            <span style={{ fontSize: "9px", color: "var(--text-3)", textAlign: "right" }}>{r.qty}</span>
            <span style={{ fontSize: "9px", color: "var(--text-3)", textAlign: "right" }}>{r.price}</span>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-1)", textAlign: "right" }}>{r.total}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px", padding: "4px 6px", background: "var(--accent)" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff" }}>Gesamt: 1.404,00 €</span>
        </div>
      </div>
    </MockShell>
  );
}

function MockPDF() {
  return (
    <MockShell width="200px">
      <div style={{ padding: "12px 14px", background: "var(--surface-2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.01em" }}>FAKTURA</p>
            <p style={{ fontSize: "8px", color: "var(--text-3)" }}>Jan Müller · Freelancer</p>
          </div>
          <p style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-1)" }}>RECHNUNG</p>
        </div>
        <div style={{ fontSize: "8px", color: "var(--text-2)", marginBottom: "8px", lineHeight: 1.5 }}>
          <p style={{ fontWeight: 600, color: "var(--text-1)" }}>An: Muster GmbH</p>
          <p>RE-2025-0042</p>
          <p>Fällig: 14.03.2025</p>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "6px", display: "flex", flexDirection: "column", gap: "3px" }}>
          {["Website Redesign", "Beratung"].map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "8px" }}>
              <span style={{ color: "var(--text-2)" }}>{t}</span>
              <span style={{ fontWeight: 600, color: "var(--text-1)" }}>{i === 0 ? "900,00 €" : "270,00 €"}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 5px", background: "var(--accent)", marginTop: "4px" }}>
            <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff" }}>Gesamt inkl. MwSt.</span>
            <span style={{ fontSize: "8px", fontWeight: 700, color: "#fff" }}>1.670,76 €</span>
          </div>
        </div>
      </div>
    </MockShell>
  );
}

function MockHealthScore() {
  return (
    <MockShell>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div>
            <p style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Unternehmens-Gesundheit</p>
            <p style={{ fontSize: "9px", color: "var(--text-3)", marginTop: "2px" }}>Einzugsquote · Zahlungsdauer · Überfälligkeit</p>
          </div>
          <span style={{ fontSize: "8px", fontWeight: 800, padding: "2px 7px", background: "var(--success-bg)", color: "var(--success)", textTransform: "uppercase" }}>Gut</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{ flex: 1, height: "5px", background: "var(--badge-draft-bg)", overflow: "hidden" }}>
            <div style={{ width: "82%", height: "100%", background: "var(--success)" }} />
          </div>
          <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--success)", letterSpacing: "-0.02em", minWidth: "36px" }}>82</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", borderTop: "1px solid var(--divider)", paddingTop: "8px" }}>
          {[
            { label: "Einzugsquote", val: "89%" },
            { label: "Ø Zahlung",    val: "11 Tage" },
            { label: "Überfällig",   val: "0" },
          ].map(({ label, val }) => (
            <div key={label}>
              <p style={{ fontSize: "8px", color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>{label}</p>
              <p style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-1)" }}>{val}</p>
            </div>
          ))}
        </div>
      </div>
    </MockShell>
  );
}

function MockPressure() {
  return (
    <MockShell>
      <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid var(--divider)" }}>
        <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rechnungen</span>
      </div>
      {[
        { nr: "RE-2025-001", cust: "Müller GmbH",  days: "12 Tage überfällig",  score: 76, scoreColor: "var(--danger)", scoreBg: "var(--danger-bg)",   label: "Hoch" },
        { nr: "RE-2025-002", cust: "Meyer AG",     days: "3 Tage offen",         score: 31, scoreColor: "var(--warning)", scoreBg: "var(--warning-bg)",  label: "Mittel" },
        { nr: "RE-2025-003", cust: "Schulz & Co.", days: "heute fällig",         score: 12, scoreColor: "var(--success)", scoreBg: "var(--success-bg)",   label: "Niedrig" },
      ].map((r) => (
        <div key={r.nr} style={{ padding: "8px 14px", borderBottom: "1px solid var(--divider)", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-1)" }}>{r.nr} · {r.cust}</p>
            <p style={{ fontSize: "9px", color: "var(--text-3)" }}>{r.days}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "13px", fontWeight: 800, color: r.scoreColor }}>{r.score}</p>
            <span style={{ fontSize: "8px", fontWeight: 700, padding: "1px 5px", background: r.scoreBg, color: r.scoreColor, textTransform: "uppercase" }}>{r.label}</span>
          </div>
        </div>
      ))}
    </MockShell>
  );
}

function MockStats() {
  const bars = [
    { month: "Okt", h: 40, val: "2.1k" }, { month: "Nov", h: 65, val: "3.4k" },
    { month: "Dez", h: 30, val: "1.6k" }, { month: "Jan", h: 80, val: "4.2k" },
    { month: "Feb", h: 55, val: "2.9k" }, { month: "Mär", h: 100, val: "5.2k" },
  ];
  return (
    <MockShell>
      <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid var(--divider)", display: "flex", gap: "10px" }}>
        {[
          { label: "Umsatz 12M", val: "38.420 €", color: "var(--success)" },
          { label: "Überfällig",  val: "1.904 €",  color: "var(--danger)" },
          { label: "Ø Zahlung",   val: "11 Tage",  color: "var(--warning)" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ flex: 1 }}>
            <p style={{ fontSize: "8px", color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
            <p style={{ fontSize: "12px", fontWeight: 800, color, letterSpacing: "-0.02em" }}>{val}</p>
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 14px" }}>
        <p style={{ fontSize: "9px", fontWeight: 600, color: "var(--text-3)", marginBottom: "8px" }}>Umsatz pro Monat</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "56px" }}>
          {bars.map((b) => (
            <div key={b.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", height: "100%", justifyContent: "flex-end" }}>
              <span style={{ fontSize: "7px", color: "var(--text-3)" }}>{b.h === 100 ? b.val : ""}</span>
              <div style={{ width: "100%", height: `${b.h * 0.42}px`, background: b.h === 100 ? "var(--accent)" : "var(--accent-soft)" }} />
              <span style={{ fontSize: "7px", color: "var(--text-3)" }}>{b.month}</span>
            </div>
          ))}
        </div>
      </div>
    </MockShell>
  );
}

function MockImport() {
  return (
    <MockShell>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "14px" }}>
          {["Methode", "Daten", "Vorschau"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{
                  width: "16px", height: "16px",
                  background: i < 2 ? "var(--accent)" : "var(--badge-draft-bg)",
                  color: i < 2 ? "#fff" : "var(--text-3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "8px", fontWeight: 800,
                }}>
                  {i < 2 ? "✓" : "3"}
                </div>
                <span style={{ fontSize: "8px", color: i < 2 ? "var(--accent)" : "var(--text-3)", fontWeight: i < 2 ? 700 : 400 }}>{s}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: "1px", background: i === 0 ? "var(--accent)" : "var(--border)", margin: "0 6px" }} />}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {[
            { icon: "⚡", label: "Schnell-Import",  desc: "Betrag & Datum" },
            { icon: "📄", label: "Vollständig",     desc: "Mit Positionen" },
            { icon: "🔍", label: "PDF-Import (KI)", desc: "KI extrahiert" },
          ].map((m, i) => (
            <div key={m.label} style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px",
              border: `2px solid ${i === 1 ? "var(--accent)" : "var(--border)"}`,
              background: i === 1 ? "var(--accent-soft)" : "var(--surface)",
            }}>
              <span style={{ fontSize: "12px" }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-1)" }}>{m.label}</p>
                <p style={{ fontSize: "8px", color: "var(--text-3)" }}>{m.desc}</p>
              </div>
              {i === 1 && <div style={{ width: "12px", height: "12px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "8px", color: "#fff" }}>✓</span></div>}
            </div>
          ))}
        </div>
      </div>
    </MockShell>
  );
}

function MockReminders() {
  return (
    <MockShell>
      <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid var(--divider)" }}>
        <p style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Automatischer Mahnprozess</p>
      </div>
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: "0" }}>
        {[
          { day: "Tag 0",  label: "Rechnung gesendet",   color: "var(--accent)", done: true },
          { day: "Tag 14", label: "Fälligkeitsdatum",     color: "var(--warning)", done: true },
          { day: "Tag 21", label: "1. Erinnerung gesendet", color: "var(--warning)", done: true },
          { day: "Tag 35", label: "2. Mahnung",           color: "var(--danger)", done: false },
          { day: "Tag 50", label: "Letzte Mahnung",       color: "var(--danger)", done: false },
        ].map((e, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", paddingBottom: "8px", position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                width: "10px", height: "10px", flexShrink: 0,
                background: e.done ? e.color : "transparent",
                border: `2px solid ${e.color}`,
              }} />
              {i < 4 && <div style={{ width: "1px", height: "18px", background: "var(--border)" }} />}
            </div>
            <div>
              <p style={{ fontSize: "8px", color: "var(--text-3)" }}>{e.day}</p>
              <p style={{ fontSize: "9px", fontWeight: e.done ? 600 : 400, color: e.done ? "var(--text-1)" : "var(--text-3)" }}>{e.label}</p>
            </div>
          </div>
        ))}
      </div>
    </MockShell>
  );
}

function MockShortcuts() {
  return (
    <MockShell width="220px">
      <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--divider)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "9px" }}>⌨</span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-1)" }}>Tastenkürzel</span>
        </div>
        <span style={{ fontSize: "10px", color: "var(--text-3)", cursor: "pointer" }}>✕</span>
      </div>
      <div style={{ padding: "4px 0" }}>
        {[
          { label: "Neue Rechnung", key: "N" },
          { label: "Neuer Kunde",   key: "K" },
          { label: "Dashboard",     key: "D" },
          { label: "Rechnungen",    key: "R" },
          { label: "Hilfe öffnen",  key: "?" },
        ].map(({ label, key }) => (
          <div key={key} style={{ padding: "5px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "9px", color: "var(--text-2)" }}>{label}</span>
            <kbd style={{ background: "var(--badge-draft-bg)", border: "1px solid var(--border)", padding: "1px 6px", fontSize: "9px", fontWeight: 800, color: "var(--text-1)", fontFamily: "monospace" }}>{key}</kbd>
          </div>
        ))}
      </div>
    </MockShell>
  );
}

function MockCustomer() {
  return (
    <MockShell>
      <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--divider)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "8px" }}>
          {[
            { label: "Gesamt",   val: "12.480 €", color: "var(--accent)" },
            { label: "Bezahlt",  val: "9.240 €",  color: "var(--success)" },
            { label: "Offen",    val: "3.240 €",  color: "var(--warning)" },
            { label: "Ø Zahlung",val: "9 Tage",   color: "var(--text-2)" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: "var(--surface-2)", padding: "6px 8px" }}>
              <p style={{ fontSize: "7px", color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "2px" }}>{label}</p>
              <p style={{ fontSize: "11px", fontWeight: 800, color, letterSpacing: "-0.01em" }}>{val}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            { label: "Firma",   val: "Muster GmbH" },
            { label: "E-Mail",  val: "max@muster.de" },
            { label: "Stadt",   val: "Berlin, 10115" },
            { label: "Land",    val: "Deutschland" },
          ].map(({ label, val }) => (
            <div key={label}>
              <p style={{ fontSize: "7px", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{label}</p>
              <p style={{ fontSize: "9px", color: "var(--text-1)", fontWeight: 500 }}>{val}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "6px 14px" }}>
        <p style={{ fontSize: "8px", color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Rechnungshistorie</p>
        {["RE-2025-004 · 3.570 €  Bezahlt", "RE-2025-002 · 2.261 €  Offen"].map((r, i) => (
          <div key={i} style={{ fontSize: "9px", color: "var(--text-2)", padding: "3px 0", borderBottom: "1px solid var(--divider)" }}>{r}</div>
        ))}
      </div>
    </MockShell>
  );
}

function MockAccordion() {
  return (
    <MockShell>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--divider)" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-1)", marginBottom: "8px" }}>Rechnungsdetails</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            { label: "Rechnungsnummer", val: "RE-2025-0042" },
            { label: "Kunde",          val: "Müller GmbH" },
            { label: "Datum",          val: "01.03.2025" },
            { label: "Fälligkeit",     val: "15.03.2025" },
          ].map(({ label, val }) => (
            <div key={label}>
              <p style={{ fontSize: "7px", color: "var(--text-3)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em", marginBottom: "1px" }}>{label}</p>
              <div style={{ height: "20px", background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 6px" }}>
                <span style={{ fontSize: "9px", color: "var(--text-1)" }}>{val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 14px", background: "var(--surface-2)", borderBottom: "1px solid var(--divider)" }}>
        <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-1)" }}>Weitere Einstellungen</span>
        <span style={{ fontSize: "9px", color: "var(--text-3)" }}>▼</span>
      </div>
      <div style={{ padding: "8px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <div>
          <p style={{ fontSize: "7px", color: "var(--text-3)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em", marginBottom: "2px" }}>E-Mail CC</p>
          <div style={{ height: "20px", background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 6px", gap: "4px" }}>
            <span style={{ fontSize: "8px", color: "var(--text-3)" }}>🔒</span>
            <span style={{ fontSize: "8px", color: "var(--text-3)" }}>Ab Professional</span>
          </div>
        </div>
        <div>
          <p style={{ fontSize: "7px", color: "var(--text-3)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em", marginBottom: "2px" }}>Wiederholen</p>
          <div style={{ height: "20px", background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 6px" }}>
            <span style={{ fontSize: "9px", color: "var(--text-1)" }}>Monatlich</span>
          </div>
        </div>
      </div>
    </MockShell>
  );
}

function MockFeedback() {
  return (
    <MockShell width="220px">
      <div style={{ padding: "10px 12px" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-1)", marginBottom: "8px" }}>Feedback senden</p>
        <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
          {[
            { label: "Bug", active: true },
            { label: "Feature", active: false },
            { label: "Lob", active: false },
          ].map(({ label, active }) => (
            <span key={label} style={{ padding: "2px 8px", fontSize: "9px", fontWeight: 700, background: active ? "var(--accent)" : "var(--badge-draft-bg)", color: active ? "#fff" : "var(--text-2)" }}>{label}</span>
          ))}
        </div>
        <div style={{ height: "18px", border: "1px solid var(--border)", background: "var(--surface-2)", marginBottom: "5px", display: "flex", alignItems: "center", padding: "0 6px" }}>
          <span style={{ fontSize: "9px", color: "var(--text-3)" }}>Titel...</span>
        </div>
        <div style={{ height: "36px", border: "1px solid var(--border)", background: "var(--surface-2)", marginBottom: "6px", padding: "4px 6px" }}>
          <span style={{ fontSize: "9px", color: "var(--text-3)" }}>Beschreibung...</span>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ padding: "3px 10px", background: "var(--accent)", color: "#fff", fontSize: "9px", fontWeight: 700 }}>Senden</span>
        </div>
      </div>
    </MockShell>
  );
}

/* ── Bento Grid ──────────────────────────────────────────────── */
type CardSpan = "1x1" | "2x1" | "1x2" | "2x2";

function BentoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="bento-grid" style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "16px",
    }}>
      {children}
    </div>
  );
}

/* ── Stat Card ───────────────────────────────────────────────── */
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

/* ── Feature Card ────────────────────────────────────────────── */
function FeatureCard({
  title, plan, description, bullets, mockup, id, span = "1x1",
}: {
  title: string; plan: Plan; description: string;
  bullets?: string[]; mockup: React.ReactNode; id?: string; span?: CardSpan;
}) {
  const gridStyle: React.CSSProperties = {
    "1x1": {},
    "2x1": { gridColumn: "span 2" },
    "1x2": { gridRow: "span 2" },
    "2x2": { gridColumn: "span 2", gridRow: "span 2" },
  }[span];

  return (
    <div
      id={id}
      style={{
        ...gridStyle,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}
    >
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

/* ── Section ─────────────────────────────────────────────────── */
function Section({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: "100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{label}</h2>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      </div>
      <BentoGrid>
        {children}
      </BentoGrid>
    </section>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function DocsPage() {
  const navLinks = [
    { href: "#rechnungen",       label: "Rechnungen" },
    { href: "#kunden",           label: "Kunden" },
    { href: "#analysen",         label: "Analysen" },
    { href: "#automatisierung",  label: "Automatisierung" },
    { href: "#workflow",         label: "Workflow" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <MarketingHeader />

      {/* Responsive + hover styles */}
      <style>{`
        @media (max-width: 900px) {
          .bento-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .bento-grid { grid-template-columns: 1fr !important; }
          .bento-grid > * { grid-column: span 1 !important; grid-row: span 1 !important; }
        }
        .plan-table tr:hover td { background: var(--surface-2); }
        .docs-nav-link:hover { color: var(--accent) !important; border-bottom-color: var(--accent) !important; }
      `}</style>

      <main style={{ paddingTop: "58px" }}>

        {/* Hero */}
        <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "64px 40px 48px" }}>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              Dokumentation
            </p>
            <h1 style={{ fontSize: "40px", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "16px", maxWidth: "600px" }}>
              Alle Funktionen im Überblick
            </h1>
            <p style={{ fontSize: "16px", color: "var(--text-2)", maxWidth: "560px", lineHeight: 1.6, marginBottom: "32px" }}>
              Faktura ist ein Rechnungsprogramm für Freelancer und Selbstständige. Hier findest du eine vollständige Übersicht aller Funktionen — mit visuellen Vorschauen und Informationen dazu, welcher Plan was enthält.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-3)", marginRight: "4px" }}>Verfügbar in:</span>
              {(Object.entries(PLAN_CFG) as [Plan, typeof PLAN_CFG[Plan]][]).map(([id]) => (
                <Badge key={id} plan={id} />
              ))}
            </div>
          </div>
        </div>

        {/* Sticky section nav */}
        <div style={{
          position: "sticky", top: "56px", zIndex: 10,
          background: "var(--surface)", backdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 1px 0 var(--divider)",
        }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 40px", display: "flex", gap: "0", overflowX: "auto" }}>
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="docs-nav-link"
                style={{
                  display: "inline-flex", alignItems: "center", padding: "14px 20px",
                  fontSize: "13px", fontWeight: 600, color: "var(--text-2)",
                  textDecoration: "none", whiteSpace: "nowrap",
                  borderBottom: "2px solid transparent",
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 40px", display: "flex", flexDirection: "column", gap: "72px" }}>

          {/* Rechnungen */}
          <Section id="rechnungen" label="Rechnungen">
            <FeatureCard
              span="2x1"
              title="Rechnungen erstellen"
              plan="free"
              description="Erstelle professionelle Rechnungen in weniger als einer Minute. Wähle einen Kunden, trage Positionen ein, lege Fälligkeit und MwSt.-Satz fest – fertig."
              bullets={["Automatische Rechnungsnummer-Vergabe", "Mehrere Positionen mit Menge × Preis", "MwSt. 0%, 7% oder 19%", "Anmerkungen für Zahlungsbedingungen"]}
              mockup={<MockInvoiceList />}
            />
            <StatCard value="60s" label="pro Rechnung" />
            <FeatureCard
              title="KI-Rechnungserstellung"
              plan="free"
              description="Beschreibe dein Projekt in Alltagssprache – die KI erstellt daraus strukturierte Rechnungspositionen mit Mengen und Preisen."
              bullets={["Erkennt Stunden, Stundensätze und Projektnamen", "Schlägt Zahlungsziel automatisch vor", "Groq LLM (kostenlos) + Heuristik-Fallback"]}
              mockup={<MockAI />}
            />
            <FeatureCard
              title="PDF-Export & E-Mail-Versand"
              plan="free"
              description="Jede Rechnung kann als professionelles PDF heruntergeladen oder direkt per E-Mail mit dem PDF als Anhang an den Kunden gesendet werden."
              bullets={["Anpassbare E-Mail-Betreff- und Textvorlage", "Vorlagen lokal gespeichert", "Versand über Resend (eigene Domain möglich)"]}
              mockup={<div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <MockPDF />
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "12px 14px", width: "180px", boxShadow: "var(--shadow-md)" }}>
                  <p style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>E-Mail senden</p>
                  {["Betreff", "An", "Text"].map((f, i) => (
                    <div key={f} style={{ marginBottom: "4px" }}>
                      <p style={{ fontSize: "8px", color: "var(--text-3)", marginBottom: "1px" }}>{f}</p>
                      <div style={{ height: i === 2 ? "32px" : "16px", background: "var(--surface-2)", border: "1px solid var(--border)" }} />
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", background: "var(--accent)", padding: "3px 10px" }}>Senden</span>
                  </div>
                </div>
              </div>}
            />
            <FeatureCard
              title="Rechnung importieren"
              plan="starter"
              description="Importiere bestehende Rechnungen über einen 3-Schritte-Wizard: Schnell-Import, vollständiger Import oder PDF-Upload mit KI-Extraktion."
              bullets={["Schnell-Import: nur Betrag + Datum", "Normal: vollständige Positionen", "PDF-Import: KI liest Daten aus PDF"]}
              mockup={<MockImport />}
            />
            <FeatureCard
              title="Wiederkehrende Rechnungen"
              plan="starter"
              description="Stelle Rechnungen als monatlich, vierteljährlich oder jährlich wiederkehrend ein. Ideal für Retainer und Abo-basierte Leistungen."
              bullets={["Monatlich, vierteljährlich, jährlich", "Im Accordion unter 'Weitere Einstellungen'", "Kombination mit weiteren Optionen möglich"]}
              mockup={<MockAccordion />}
            />
          </Section>

          {/* Kunden */}
          <Section id="kunden" label="Kunden">
            <FeatureCard
              span="2x1"
              title="Kundenverwaltung"
              plan="free"
              description="Verwalte alle Kundendaten zentral. Jeder Kunde hat ein eigenes Profil mit vollständigen Kontaktdaten, Statistiken und Rechnungshistorie."
              bullets={["Name, E-Mail, Firma, Adresse, PLZ, Stadt, Land", "Gesamtumsatz pro Kunde", "Ø Zahlungsdauer pro Kunde"]}
              mockup={<MockCustomer />}
            />
            <FeatureCard
              title="Zahlungsverhalten & Statistiken"
              plan="free"
              description="Pro Kunde siehst du sofort: Gesamt berechnet, bezahlt, ausstehend und die durchschnittliche Zahlungsdauer."
              bullets={["4 Statistik-Karten pro Kunde", "Vollständige Rechnungshistorie", "Link zu jeder Rechnung direkt vom Kundenprofil"]}
              mockup={<MockCustomer />}
            />
            <FeatureCard
              title="Kundenrabatt"
              plan="starter"
              description="Vergib Stammkunden-Rabatte in Prozent direkt im Kundenprofil. Der Rabatt wird als optionales Feld im Akkordeon unter 'Erweiterte Einstellungen' gesetzt."
              bullets={["Prozentangabe (0–100%)", "Sichtbar im Bearbeitungsmodus", "Erweiterbar auf weitere Felder"]}
              mockup={<div style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                boxShadow: "var(--shadow-md)", overflow: "hidden",
              }}>
                <div style={{ padding: "8px 14px", background: "var(--surface-2)", borderBottom: "1px solid var(--divider)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-1)" }}>Erweiterte Einstellungen</span>
                  <span style={{ fontSize: "9px", color: "var(--text-3)" }}>▼</span>
                </div>
                <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <p style={{ fontSize: "8px", color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "3px" }}>Kundenrabatt (%)</p>
                    <div style={{ height: "24px", border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", alignItems: "center", padding: "0 8px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-1)" }}>10</span>
                    </div>
                    <p style={{ fontSize: "8px", color: "var(--success)", marginTop: "2px" }}>✓ Im Starter-Plan</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "8px", color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "3px" }}>Kreditlimit (€)</p>
                    <div style={{ height: "24px", border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", alignItems: "center", padding: "0 8px", gap: "4px" }}>
                      <span style={{ fontSize: "9px" }}>🔒</span>
                      <span style={{ fontSize: "8px", color: "var(--text-3)" }}>Ab Professional</span>
                    </div>
                  </div>
                </div>
              </div>}
            />
          </Section>

          {/* Analysen */}
          <Section id="analysen" label="Analysen & Einblicke">
            <FeatureCard
              span="2x1"
              title="Dashboard"
              plan="free"
              description="Der Dashboard gibt dir auf einen Blick: offene Rechnungen, überfällige Beträge, diesen Monat bezahltes und die durchschnittliche Zahlungsdauer – mit Monatschart."
              bullets={["4 Stat-Karten mit Echtzeit-Daten", "Monatliches Balkendiagramm (6 Monate)", "Liste der letzten 5 Rechnungen"]}
              mockup={<MockStats />}
            />
            <StatCard value="82" label="Health Score Durchschnitt" color="var(--success)" />
            <FeatureCard
              title="Business Health Score"
              plan="free"
              description="Ein einzigartiges Widget zeigt dir die finanzielle Gesundheit deines Unternehmens auf einer Skala von 0–100."
              bullets={["Einzugsquote (Anteil bezahlter Rechnungen)", "Durchschnittliche Zahlungsdauer", "Status: Gut / Aufmerksamkeit / Kritisch"]}
              mockup={<MockHealthScore />}
            />
            <FeatureCard
              title="Zahlungsdruck-Score"
              plan="free"
              description="Jede offene Rechnung bekommt automatisch einen Zahlungsdruck-Score (0–100). Er zeigt dir sofort, bei welchen Rechnungen Handlungsbedarf besteht."
              bullets={["Überfälligkeitstage (bis 40 Punkte)", "Kundenhistorie (bis 20 Punkte)", "Rechnungsbetrag (bis 20 Punkte)"]}
              mockup={<MockPressure />}
            />
            <FeatureCard
              span="2x1"
              title="Statistiken & Trends"
              plan="free"
              description="Die Statistikseite zeigt dir Umsatztrend (12 Monate), Statusverteilung aller Rechnungen als Tortendiagramm und eine Überfälligkeits-Alterungsanalyse."
              bullets={["12-Monats-Umsatzkurve", "Tortendiagramm Statusverteilung", "Aging-Analyse: 1–14, 15–30, 31–60, >60 Tage"]}
              mockup={<MockStats />}
            />
          </Section>

          {/* Automatisierung */}
          <Section id="automatisierung" label="Automatisierung">
            <FeatureCard
              span="2x1"
              title="Automatische Erinnerungen"
              plan="free"
              description="Faktura sendet automatisch Zahlungserinnerungen an Kunden, wenn Rechnungen überfällig werden. Du musst nichts manuell tun."
              bullets={["Konfigurierbar über ENV-Variablen", "Maximale Anzahl pro Lauf einstellbar", "Jede Erinnerung wird in der Datenbank protokolliert"]}
              mockup={<MockReminders />}
            />
            <FeatureCard
              title="Manuelle Mahnung"
              plan="free"
              description="Sende jederzeit manuell eine Zahlungserinnerung direkt von der Rechnungsdetailseite – mit einem Klick auf 'Erinnerung senden'."
              bullets={["Sofortige Mahnung per E-Mail", "Wird in Erinnerungshistorie gespeichert", "Fließt in den Zahlungsdruck-Score ein"]}
              mockup={<div style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                boxShadow: "var(--shadow-md)", overflow: "hidden",
              }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--divider)" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {[
                      { label: "PDF", color: "var(--badge-draft-bg)", tc: "var(--text-2)" },
                      { label: "Senden", color: "var(--badge-draft-bg)", tc: "var(--text-2)" },
                      { label: "Erinnerung", color: "var(--warning-bg)", tc: "var(--warning)" },
                      { label: "Bezahlt ✓", color: "var(--success-bg)", tc: "var(--success)" },
                    ].map(({ label, color, tc }) => (
                      <span key={label} style={{ fontSize: "9px", fontWeight: 700, padding: "3px 9px", background: color, color: tc, cursor: "pointer" }}>{label}</span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "10px 14px" }}>
                  <div style={{ background: "var(--warning-bg)", border: "1px solid rgba(204,112,0,0.15)", padding: "8px 10px", marginBottom: "8px" }}>
                    <p style={{ fontSize: "9px", fontWeight: 700, color: "var(--warning)" }}>Erinnerung gesendet</p>
                    <p style={{ fontSize: "8px", color: "var(--text-3)", marginTop: "2px" }}>01.03.2025 – an max@muster.de</p>
                  </div>
                  <div style={{ fontSize: "8px", color: "var(--text-2)", lineHeight: 1.6 }}>
                    <p>Zahlungsdruck-Score: <strong style={{ color: "var(--danger)" }}>76 / 100</strong></p>
                    <p>2 Erinnerungen gesendet</p>
                  </div>
                </div>
              </div>}
            />
          </Section>

          {/* Workflow */}
          <Section id="workflow" label="Workflow & Extras">
            <FeatureCard
              title="Tastenkürzel"
              plan="free"
              description="Power-User-Feature: Navigiere durch die gesamte App ohne Maus. Drücke ? um die Hilfe zu öffnen."
              bullets={["N → Neue Rechnung", "K → Neuer Kunde", "D → Dashboard", "R → Rechnungen", "? → Hilfe öffnen"]}
              mockup={<MockShortcuts />}
            />
            <FeatureCard
              span="2x1"
              title="Feedback & Support"
              plan="free"
              description="Das integrierte Feedback-Widget ermöglicht es dir, Bugs, Feature-Wünsche oder Lob direkt aus der App zu senden."
              bullets={["Floating-Button unten rechts im Dashboard", "3 Kategorien: Bug / Feature / Lob", "Status-Updates sichtbar in der Support-Übersicht"]}
              mockup={<div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <MockFeedback />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "8px 10px", boxShadow: "var(--shadow-sm)", width: "140px" }}>
                    <p style={{ fontSize: "8px", fontWeight: 700, color: "var(--text-1)", marginBottom: "2px" }}>Login-Fehler</p>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "7px", color: "var(--text-3)" }}>Bug</span>
                      <span style={{ fontSize: "7px", fontWeight: 700, color: "var(--warning)", background: "var(--warning-bg)", padding: "1px 4px" }}>Offen</span>
                    </div>
                  </div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "8px 10px", boxShadow: "var(--shadow-sm)", width: "140px" }}>
                    <p style={{ fontSize: "8px", fontWeight: 700, color: "var(--text-1)", marginBottom: "2px" }}>Dark Mode bitte</p>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "7px", color: "var(--text-3)" }}>Feature</span>
                      <span style={{ fontSize: "7px", fontWeight: 700, color: "var(--success)", background: "var(--success-bg)", padding: "1px 4px" }}>Gelöst</span>
                    </div>
                  </div>
                </div>
              </div>}
            />
          </Section>

          {/* CTA */}
          <div style={{
            background: "var(--accent)",
            padding: "48px 40px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              Bereit loszulegen?
            </p>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: "12px" }}>
              Kostenlos starten, sofort loslegen
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", marginBottom: "28px" }}>
              Keine Kreditkarte nötig. Deine ersten 5 Rechnungen sind gratis.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" style={{ textDecoration: "none" }}>
                <div style={{ padding: "12px 28px", background: "#ffffff", color: "var(--accent)", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>
                  Jetzt registrieren
                </div>
              </Link>
              <Link href="/preise" style={{ textDecoration: "none" }}>
                <div style={{ padding: "12px 28px", border: "1px solid rgba(255,255,255,0.3)", color: "#ffffff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                  Alle Pläne ansehen
                </div>
              </Link>
            </div>
          </div>

        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
