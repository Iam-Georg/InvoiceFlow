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
  free:         { label: "Kostenlos",    bg: "#F0F0F5",              color: "#5C5C6E", border: "transparent" },
  starter:      { label: "Starter",      bg: "rgba(0,64,204,0.08)",  color: "#0040CC", border: "rgba(0,64,204,0.15)" },
  professional: { label: "Professional", bg: "rgba(96,64,204,0.08)", color: "#6040CC", border: "rgba(96,64,204,0.15)" },
  business:     { label: "Business",     bg: "#0C0C14",              color: "#FFFFFF", border: "transparent" },
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
      background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.07), 0 12px 28px rgba(0,0,0,0.05)",
      width, overflow: "hidden",
    }}>
      {/* Window chrome */}
      <div style={{ padding: "7px 12px", background: "#f7f7fa", borderBottom: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: "5px" }}>
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
    { nr: "RE-2025-001", cust: "Müller GmbH",  status: "offen",    bg: "rgba(204,112,0,0.08)", tc: "#CC7000",   amt: "1.904,00 €" },
    { nr: "RE-2025-002", cust: "Meyer & Co.",  status: "bezahlt",  bg: "rgba(0,160,96,0.08)",  tc: "#00A060",   amt: "3.570,00 €" },
    { nr: "RE-2025-003", cust: "Schulz AG",    status: "entwurf",  bg: "#F0F0F5",              tc: "#5C5C6E",   amt: "714,00 €"   },
    { nr: "RE-2025-004", cust: "Weber IT",     status: "überfällig",bg: "rgba(204,32,32,0.08)",tc: "#CC2020",  amt: "2.261,00 €" },
  ];
  return (
    <MockShell>
      <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#0c0c14" }}>Rechnungen</span>
        <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", background: "#0040CC", padding: "2px 8px" }}>+ Neu</span>
      </div>
      {rows.map((r) => (
        <div key={r.nr} style={{ display: "flex", alignItems: "center", padding: "7px 14px", borderBottom: "1px solid rgba(0,0,0,0.04)", gap: "8px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#0c0c14", lineHeight: 1.3 }}>{r.nr}</p>
            <p style={{ fontSize: "9px", color: "#9898AA", lineHeight: 1.3 }}>{r.cust}</p>
          </div>
          <span style={{ fontSize: "8px", fontWeight: 700, padding: "1px 5px", background: r.bg, color: r.tc, textTransform: "uppercase", letterSpacing: "0.04em" }}>{r.status}</span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#0c0c14", fontVariantNumeric: "tabular-nums" }}>{r.amt}</span>
        </div>
      ))}
    </MockShell>
  );
}

function MockAI() {
  return (
    <MockShell>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "#0c0c14", marginBottom: "6px" }}>KI-Rechnungserstellung</p>
        <div style={{ border: "1px solid rgba(0,0,0,0.08)", padding: "6px 8px", background: "#f7f7fa", fontSize: "9px", color: "#5c5c6e" }}>
          Website Redesign, 12h à 75€, plus 3h Beratung à 90€...
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
          <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", background: "#0040CC", padding: "2px 8px" }}>✦ Positionen erzeugen</span>
        </div>
      </div>
      <div style={{ padding: "8px 14px" }}>
        {[
          { desc: "Website Redesign", qty: "12h", price: "75,00 €", total: "900,00 €" },
          { desc: "Beratung & Konzept", qty: "3h",  price: "90,00 €", total: "270,00 €" },
        ].map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 30px 52px 52px", gap: "6px", padding: "3px 0", borderBottom: i === 0 ? "1px solid rgba(0,0,0,0.05)" : "none", alignItems: "center" }}>
            <span style={{ fontSize: "9px", color: "#0c0c14", fontWeight: 500 }}>{r.desc}</span>
            <span style={{ fontSize: "9px", color: "#9898AA", textAlign: "right" }}>{r.qty}</span>
            <span style={{ fontSize: "9px", color: "#9898AA", textAlign: "right" }}>{r.price}</span>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#0c0c14", textAlign: "right" }}>{r.total}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px", padding: "4px 6px", background: "#0040CC" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff" }}>Gesamt: 1.404,00 €</span>
        </div>
      </div>
    </MockShell>
  );
}

function MockPDF() {
  return (
    <MockShell width="200px">
      <div style={{ padding: "12px 14px", background: "#fafafa" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "#0040CC", letterSpacing: "-0.01em" }}>FAKTURA</p>
            <p style={{ fontSize: "8px", color: "#9898AA" }}>Jan Müller · Freelancer</p>
          </div>
          <p style={{ fontSize: "9px", fontWeight: 700, color: "#0c0c14" }}>RECHNUNG</p>
        </div>
        <div style={{ fontSize: "8px", color: "#5c5c6e", marginBottom: "8px", lineHeight: 1.5 }}>
          <p style={{ fontWeight: 600, color: "#0c0c14" }}>An: Muster GmbH</p>
          <p>RE-2025-0042</p>
          <p>Fällig: 14.03.2025</p>
        </div>
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "6px", display: "flex", flexDirection: "column", gap: "3px" }}>
          {["Website Redesign", "Beratung"].map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "8px" }}>
              <span style={{ color: "#5c5c6e" }}>{t}</span>
              <span style={{ fontWeight: 600, color: "#0c0c14" }}>{i === 0 ? "900,00 €" : "270,00 €"}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 5px", background: "#0040CC", marginTop: "4px" }}>
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
            <p style={{ fontSize: "9px", fontWeight: 700, color: "#9898AA", textTransform: "uppercase", letterSpacing: "0.06em" }}>Unternehmens-Gesundheit</p>
            <p style={{ fontSize: "9px", color: "#9898AA", marginTop: "2px" }}>Einzugsquote · Zahlungsdauer · Überfälligkeit</p>
          </div>
          <span style={{ fontSize: "8px", fontWeight: 800, padding: "2px 7px", background: "rgba(0,160,96,0.1)", color: "#00A060", textTransform: "uppercase" }}>Gut</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{ flex: 1, height: "5px", background: "#f0f0f5", overflow: "hidden" }}>
            <div style={{ width: "82%", height: "100%", background: "#00A060" }} />
          </div>
          <span style={{ fontSize: "18px", fontWeight: 800, color: "#00A060", letterSpacing: "-0.02em", minWidth: "36px" }}>82</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "8px" }}>
          {[
            { label: "Einzugsquote", val: "89%" },
            { label: "Ø Zahlung",    val: "11 Tage" },
            { label: "Überfällig",   val: "0" },
          ].map(({ label, val }) => (
            <div key={label}>
              <p style={{ fontSize: "8px", color: "#9898AA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>{label}</p>
              <p style={{ fontSize: "13px", fontWeight: 800, color: "#0c0c14" }}>{val}</p>
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
      <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <span style={{ fontSize: "9px", fontWeight: 700, color: "#9898AA", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rechnungen</span>
      </div>
      {[
        { nr: "RE-2025-001", cust: "Müller GmbH",  days: "12 Tage überfällig",  score: 76, scoreColor: "#CC2020", scoreBg: "rgba(204,32,32,0.08)",   label: "Hoch" },
        { nr: "RE-2025-002", cust: "Meyer AG",     days: "3 Tage offen",         score: 31, scoreColor: "#CC7000", scoreBg: "rgba(204,112,0,0.08)",  label: "Mittel" },
        { nr: "RE-2025-003", cust: "Schulz & Co.", days: "heute fällig",         score: 12, scoreColor: "#00A060", scoreBg: "rgba(0,160,96,0.08)",   label: "Niedrig" },
      ].map((r) => (
        <div key={r.nr} style={{ padding: "8px 14px", borderBottom: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#0c0c14" }}>{r.nr} · {r.cust}</p>
            <p style={{ fontSize: "9px", color: "#9898AA" }}>{r.days}</p>
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
      <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: "10px" }}>
        {[
          { label: "Umsatz 12M", val: "38.420 €", color: "#00A060" },
          { label: "Überfällig",  val: "1.904 €",  color: "#CC2020" },
          { label: "Ø Zahlung",   val: "11 Tage",  color: "#CC7000" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ flex: 1 }}>
            <p style={{ fontSize: "8px", color: "#9898AA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
            <p style={{ fontSize: "12px", fontWeight: 800, color, letterSpacing: "-0.02em" }}>{val}</p>
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 14px" }}>
        <p style={{ fontSize: "9px", fontWeight: 600, color: "#9898AA", marginBottom: "8px" }}>Umsatz pro Monat</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "56px" }}>
          {bars.map((b) => (
            <div key={b.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", height: "100%", justifyContent: "flex-end" }}>
              <span style={{ fontSize: "7px", color: "#9898AA" }}>{b.h === 100 ? b.val : ""}</span>
              <div style={{ width: "100%", height: `${b.h * 0.42}px`, background: b.h === 100 ? "#0040CC" : "rgba(0,64,204,0.2)" }} />
              <span style={{ fontSize: "7px", color: "#9898AA" }}>{b.month}</span>
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
        {/* Steps */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "14px" }}>
          {["Methode", "Daten", "Vorschau"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{
                  width: "16px", height: "16px",
                  background: i === 0 ? "#0040CC" : i === 1 ? "#0040CC" : "#F0F0F5",
                  color: i < 2 ? "#fff" : "#9898AA",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "8px", fontWeight: 800,
                }}>
                  {i < 2 ? "✓" : "3"}
                </div>
                <span style={{ fontSize: "8px", color: i < 2 ? "#0040CC" : "#9898AA", fontWeight: i < 2 ? 700 : 400 }}>{s}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: "1px", background: i === 0 ? "#0040CC" : "#E0E0E8", margin: "0 6px" }} />}
            </div>
          ))}
        </div>
        {/* Mode cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {[
            { icon: "⚡", label: "Schnell-Import",  desc: "Betrag & Datum" },
            { icon: "📄", label: "Vollständig",     desc: "Mit Positionen" },
            { icon: "🔍", label: "PDF-Import (KI)", desc: "KI extrahiert" },
          ].map((m, i) => (
            <div key={m.label} style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px",
              border: `2px solid ${i === 1 ? "#0040CC" : "rgba(0,0,0,0.07)"}`,
              background: i === 1 ? "rgba(0,64,204,0.04)" : "#fff",
            }}>
              <span style={{ fontSize: "12px" }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#0c0c14" }}>{m.label}</p>
                <p style={{ fontSize: "8px", color: "#9898AA" }}>{m.desc}</p>
              </div>
              {i === 1 && <div style={{ width: "12px", height: "12px", background: "#0040CC", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "8px", color: "#fff" }}>✓</span></div>}
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
      <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <p style={{ fontSize: "9px", fontWeight: 700, color: "#9898AA", textTransform: "uppercase", letterSpacing: "0.05em" }}>Automatischer Mahnprozess</p>
      </div>
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: "0" }}>
        {[
          { day: "Tag 0",  label: "Rechnung gesendet",   color: "#0040CC", done: true },
          { day: "Tag 14", label: "Fälligkeitsdatum",     color: "#CC7000", done: true },
          { day: "Tag 21", label: "1. Erinnerung gesendet", color: "#CC7000", done: true },
          { day: "Tag 35", label: "2. Mahnung",           color: "#CC2020", done: false },
          { day: "Tag 50", label: "Letzte Mahnung",       color: "#CC2020", done: false },
        ].map((e, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", paddingBottom: "8px", position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                width: "10px", height: "10px", flexShrink: 0,
                background: e.done ? e.color : "transparent",
                border: `2px solid ${e.color}`,
              }} />
              {i < 4 && <div style={{ width: "1px", height: "18px", background: "rgba(0,0,0,0.08)" }} />}
            </div>
            <div>
              <p style={{ fontSize: "8px", color: "#9898AA" }}>{e.day}</p>
              <p style={{ fontSize: "9px", fontWeight: e.done ? 600 : 400, color: e.done ? "#0c0c14" : "#9898AA" }}>{e.label}</p>
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
      <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "9px" }}>⌨</span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#0c0c14" }}>Tastenkürzel</span>
        </div>
        <span style={{ fontSize: "10px", color: "#9898AA", cursor: "pointer" }}>✕</span>
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
            <span style={{ fontSize: "9px", color: "#5c5c6e" }}>{label}</span>
            <kbd style={{ background: "#F0F0F5", border: "1px solid rgba(0,0,0,0.1)", padding: "1px 6px", fontSize: "9px", fontWeight: 800, color: "#0c0c14", fontFamily: "monospace" }}>{key}</kbd>
          </div>
        ))}
      </div>
    </MockShell>
  );
}

function MockCustomer() {
  return (
    <MockShell>
      <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "8px" }}>
          {[
            { label: "Gesamt",   val: "12.480 €", color: "#0040CC" },
            { label: "Bezahlt",  val: "9.240 €",  color: "#00A060" },
            { label: "Offen",    val: "3.240 €",  color: "#CC7000" },
            { label: "Ø Zahlung",val: "9 Tage",   color: "#5C5C6E" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: "#f7f7fa", padding: "6px 8px" }}>
              <p style={{ fontSize: "7px", color: "#9898AA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "2px" }}>{label}</p>
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
              <p style={{ fontSize: "7px", color: "#9898AA", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{label}</p>
              <p style={{ fontSize: "9px", color: "#0c0c14", fontWeight: 500 }}>{val}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "6px 14px" }}>
        <p style={{ fontSize: "8px", color: "#9898AA", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Rechnungshistorie</p>
        {["RE-2025-004 · 3.570 €  Bezahlt", "RE-2025-002 · 2.261 €  Offen"].map((r, i) => (
          <div key={i} style={{ fontSize: "9px", color: "#5c5c6e", padding: "3px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>{r}</div>
        ))}
      </div>
    </MockShell>
  );
}

function MockAccordion() {
  return (
    <MockShell>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "#0c0c14", marginBottom: "8px" }}>Rechnungsdetails</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            { label: "Rechnungsnummer", val: "RE-2025-0042" },
            { label: "Kunde",          val: "Müller GmbH" },
            { label: "Datum",          val: "01.03.2025" },
            { label: "Fälligkeit",     val: "15.03.2025" },
          ].map(({ label, val }) => (
            <div key={label}>
              <p style={{ fontSize: "7px", color: "#9898AA", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em", marginBottom: "1px" }}>{label}</p>
              <div style={{ height: "20px", background: "#f7f7fa", border: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", padding: "0 6px" }}>
                <span style={{ fontSize: "9px", color: "#0c0c14" }}>{val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Accordion trigger */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 14px", background: "#f7f7fa", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <span style={{ fontSize: "9px", fontWeight: 700, color: "#0c0c14" }}>Weitere Einstellungen</span>
        <span style={{ fontSize: "9px", color: "#9898AA" }}>▼</span>
      </div>
      <div style={{ padding: "8px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <div>
          <p style={{ fontSize: "7px", color: "#9898AA", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em", marginBottom: "2px" }}>E-Mail CC</p>
          <div style={{ height: "20px", background: "#f7f7fa", border: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", padding: "0 6px", gap: "4px" }}>
            <span style={{ fontSize: "8px", color: "#9898AA" }}>🔒</span>
            <span style={{ fontSize: "8px", color: "#9898AA" }}>Ab Professional</span>
          </div>
        </div>
        <div>
          <p style={{ fontSize: "7px", color: "#9898AA", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em", marginBottom: "2px" }}>Wiederholen</p>
          <div style={{ height: "20px", background: "#f7f7fa", border: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", padding: "0 6px" }}>
            <span style={{ fontSize: "9px", color: "#0c0c14" }}>Monatlich</span>
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
        <p style={{ fontSize: "10px", fontWeight: 700, color: "#0c0c14", marginBottom: "8px" }}>Feedback senden</p>
        <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
          {[
            { label: "Bug", active: true },
            { label: "Feature", active: false },
            { label: "Lob", active: false },
          ].map(({ label, active }) => (
            <span key={label} style={{ padding: "2px 8px", fontSize: "9px", fontWeight: 700, background: active ? "#0040CC" : "#f0f0f5", color: active ? "#fff" : "#5c5c6e" }}>{label}</span>
          ))}
        </div>
        <div style={{ height: "18px", border: "1px solid rgba(0,0,0,0.08)", background: "#f7f7fa", marginBottom: "5px", display: "flex", alignItems: "center", padding: "0 6px" }}>
          <span style={{ fontSize: "9px", color: "#9898AA" }}>Titel...</span>
        </div>
        <div style={{ height: "36px", border: "1px solid rgba(0,0,0,0.08)", background: "#f7f7fa", marginBottom: "6px", padding: "4px 6px" }}>
          <span style={{ fontSize: "9px", color: "#9898AA" }}>Beschreibung...</span>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ padding: "3px 10px", background: "#0040CC", color: "#fff", fontSize: "9px", fontWeight: 700 }}>Senden</span>
        </div>
      </div>
    </MockShell>
  );
}

/* ── Feature Card ────────────────────────────────────────────── */
function FeatureCard({
  title, plan, description, bullets, mockup, id,
}: {
  title: string; plan: Plan; description: string;
  bullets?: string[]; mockup: React.ReactNode; id?: string;
}) {
  return (
    <div
      id={id}
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.04)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Mockup area */}
      <div style={{
        background: "linear-gradient(145deg, #EEEEF4 0%, #E8E8F0 100%)",
        padding: "28px 24px",
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "220px",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        {mockup}
      </div>

      {/* Description */}
      <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "#0c0c14", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{title}</p>
          <Badge plan={plan} />
        </div>
        <p style={{ fontSize: "13px", color: "#5c5c6e", lineHeight: 1.65 }}>{description}</p>
        {bullets && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "5px", marginTop: "4px" }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "7px", fontSize: "12px", color: "#5c5c6e", lineHeight: 1.5 }}>
                <span style={{ color: "#0040CC", flexShrink: 0, fontWeight: 800, fontSize: "11px", marginTop: "1px" }}>→</span>
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
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0c0c14", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{label}</h2>
        <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.07)" }} />
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "20px",
      }}>
        {children}
      </div>
    </section>
  );
}

/* ── Plan Comparison ─────────────────────────────────────────── */
function PlanComparison() {
  const plans: { id: Plan; price: string; features: string[] }[] = [
    {
      id: "free", price: "0 €/Monat",
      features: ["5 Rechnungen/Monat", "3 Kunden", "PDF-Export", "E-Mail-Versand", "Dashboard & Statistiken", "Business Health Score", "Zahlungsdruck-Score", "Automatische Erinnerungen", "Tastenkürzel"],
    },
    {
      id: "starter", price: "9 €/Monat",
      features: ["Unbegrenzte Rechnungen", "Unbegrenzte Kunden", "Rechnung importieren", "Wiederkehrende Rechnungen", "E-Mail-Vorlagen", "Kundenrabatt (%)", "+ alle Kostenlos-Features"],
    },
    {
      id: "professional", price: "19 €/Monat",
      features: ["KI-Features (Groq)", "E-Mail CC/BCC", "Anhänge", "Kreditlimit", "Steuerbefreiung", "Mehrwährung", "Mehrsprachig", "Kundenkonto-Portal", "Mehrere Ansprechpartner", "+ alle Starter-Features"],
    },
    {
      id: "business", price: "39 €/Monat",
      features: ["Für Teams & Agenturen", "Prioritäts-Support", "API-Zugang (geplant)", "White-Label (geplant)", "Individuelle Einrichtung", "+ alle Professional-Features"],
    },
  ];

  return (
    <section id="plaene" style={{ scrollMarginTop: "100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0c0c14", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>Pläne & Tarife</h2>
        <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.07)" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
        {plans.map((p) => {
          const cfg = PLAN_CFG[p.id];
          return (
            <div key={p.id} style={{
              background: p.id === "professional" ? "#0040CC" : "#ffffff",
              border: p.id === "professional" ? "2px solid #0040CC" : "1px solid rgba(0,0,0,0.07)",
              boxShadow: p.id === "professional" ? "0 8px 32px rgba(0,64,204,0.25)" : "0 1px 3px rgba(0,0,0,0.05)",
              overflow: "hidden",
              position: "relative",
            }}>
              {p.id === "professional" && (
                <div style={{ position: "absolute", top: "12px", right: "12px", background: "#ffffff", color: "#0040CC", fontSize: "8px", fontWeight: 800, padding: "2px 7px", letterSpacing: "0.05em" }}>BELIEBT</div>
              )}
              <div style={{ padding: "20px 20px 16px" }}>
                <p style={{ fontSize: "12px", fontWeight: 800, color: p.id === "professional" ? "rgba(255,255,255,0.6)" : cfg.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  {cfg.label}
                </p>
                <p style={{ fontSize: "22px", fontWeight: 800, color: p.id === "professional" ? "#ffffff" : "#0c0c14", letterSpacing: "-0.02em" }}>
                  {p.price.split("/")[0]}<span style={{ fontSize: "12px", fontWeight: 500, opacity: 0.6 }}>/Mo.</span>
                </p>
              </div>
              <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${p.id === "professional" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)"}`, paddingTop: "14px" }}>
                {p.features.map((f) => (
                  <p key={f} style={{ fontSize: "12px", color: p.id === "professional" ? "rgba(255,255,255,0.85)" : "#5c5c6e", padding: "3px 0", display: "flex", alignItems: "flex-start", gap: "6px", lineHeight: 1.4 }}>
                    <span style={{ color: p.id === "professional" ? "#ffffff" : "#0040CC", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {f}
                  </p>
                ))}
              </div>
              <div style={{ padding: "0 20px 20px" }}>
                <Link href={p.id === "free" ? "/register" : "/billing"} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "9px 0", textAlign: "center", fontSize: "12px", fontWeight: 700,
                    background: p.id === "professional" ? "#ffffff" : p.id === "free" ? "#f0f0f5" : "#0040CC",
                    color: p.id === "professional" ? "#0040CC" : p.id === "free" ? "#5c5c6e" : "#ffffff",
                    cursor: "pointer",
                  }}>
                    {p.id === "free" ? "Kostenlos starten" : "Plan wählen"}
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
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
    { href: "#plaene",           label: "Pläne" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#EFEFF4" }}>
      <MarketingHeader />

      <main style={{ paddingTop: "58px" }}>

        {/* Hero */}
        <div style={{ background: "#ffffff", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "64px 40px 48px" }}>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "#0040CC", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              Dokumentation
            </p>
            <h1 style={{ fontSize: "40px", fontWeight: 800, color: "#0c0c14", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "16px", maxWidth: "600px" }}>
              Alle Funktionen im Überblick
            </h1>
            <p style={{ fontSize: "16px", color: "#5c5c6e", maxWidth: "560px", lineHeight: 1.6, marginBottom: "32px" }}>
              Faktura ist ein Rechnungsprogramm für Freelancer und Selbstständige. Hier findest du eine vollständige Übersicht aller Funktionen — mit visuellen Vorschauen und Informationen dazu, welcher Plan was enthält.
            </p>

            {/* Plan legend */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#9898AA", marginRight: "4px" }}>Verfügbar in:</span>
              {(Object.entries(PLAN_CFG) as [Plan, typeof PLAN_CFG[Plan]][]).map(([id, cfg]) => (
                <Badge key={id} plan={id} />
              ))}
            </div>
          </div>
        </div>

        {/* Sticky section nav */}
        <div style={{
          position: "sticky", top: "56px", zIndex: 10,
          background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
        }}>
          <style>{`.docs-nav-link:hover{color:#0040CC!important;border-bottom-color:#0040CC!important}`}</style>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 40px", display: "flex", gap: "0", overflowX: "auto" }}>
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="docs-nav-link"
                style={{
                  display: "inline-flex", alignItems: "center", padding: "14px 20px",
                  fontSize: "13px", fontWeight: 600, color: "#5c5c6e",
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
              title="Rechnungen erstellen"
              plan="free"
              description="Erstelle professionelle Rechnungen in weniger als einer Minute. Wähle einen Kunden, trage Positionen ein, lege Fälligkeit und MwSt.-Satz fest – fertig."
              bullets={["Automatische Rechnungsnummer-Vergabe", "Mehrere Positionen mit Menge × Preis", "MwSt. 0%, 7% oder 19%", "Anmerkungen für Zahlungsbedingungen"]}
              mockup={<MockInvoiceList />}
            />
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
                <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", padding: "12px 14px", width: "180px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                  <p style={{ fontSize: "9px", fontWeight: 700, color: "#9898AA", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>E-Mail senden</p>
                  {["Betreff", "An", "Text"].map((f, i) => (
                    <div key={f} style={{ marginBottom: "4px" }}>
                      <p style={{ fontSize: "8px", color: "#9898AA", marginBottom: "1px" }}>{f}</p>
                      <div style={{ height: i === 2 ? "32px" : "16px", background: "#f7f7fa", border: "1px solid rgba(0,0,0,0.07)" }} />
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", background: "#0040CC", padding: "3px 10px" }}>Senden</span>
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
              title="Kundenverwaltung"
              plan="free"
              description="Verwalte alle Kundendaten zentral. Jeder Kunde hat ein eigenes Profil mit vollständigen Kontaktdaten, Statistiken und Rechnungshistorie."
              bullets={["Name, E-Mail, Firma, Adresse, PLZ, Stadt, Land", "Gesamtumsatz pro Kunde", "Ø Zahlungsdauer pro Kunde"]}
              mockup={<MockCustomer />}
            />
            <FeatureCard
              title="Zahlungsverhalten & Statistiken"
              plan="free"
              description="Pro Kunde siehst du sofort: Gesamt berechnet, bezahlt, ausstehend und die durchschnittliche Zahlungsdauer. Diese Daten fließen direkt in den Zahlungsdruck-Score ein."
              bullets={["4 Statistik-Karten pro Kunde", "Vollständige Rechnungshistorie", "Link zu jeder Rechnung direkt vom Kundenprofil"]}
              mockup={<MockCustomer />}
            />
            <FeatureCard
              title="Kundenrabatt"
              plan="starter"
              description="Vergib Stammkunden-Rabatte in Prozent direkt im Kundenprofil. Der Rabatt wird als optionales Feld im Akkordeon unter 'Erweiterte Einstellungen' gesetzt."
              bullets={["Prozentangabe (0–100%)", "Sichtbar im Bearbeitungsmodus", "Erweiterbar auf weitere Felder"]}
              mockup={<div style={{
                background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)", overflow: "hidden",
              }}>
                <div style={{ padding: "8px 14px", background: "#f7f7fa", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#0c0c14" }}>Erweiterte Einstellungen</span>
                  <span style={{ fontSize: "9px", color: "#9898AA" }}>▼</span>
                </div>
                <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <p style={{ fontSize: "8px", color: "#9898AA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "3px" }}>Kundenrabatt (%)</p>
                    <div style={{ height: "24px", border: "1px solid rgba(0,0,0,0.08)", background: "#f7f7fa", display: "flex", alignItems: "center", padding: "0 8px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "#0c0c14" }}>10</span>
                    </div>
                    <p style={{ fontSize: "8px", color: "#00A060", marginTop: "2px" }}>✓ Im Starter-Plan</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "8px", color: "#9898AA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "3px" }}>Kreditlimit (€)</p>
                    <div style={{ height: "24px", border: "1px solid rgba(0,0,0,0.08)", background: "#f7f7fa", display: "flex", alignItems: "center", padding: "0 8px", gap: "4px" }}>
                      <span style={{ fontSize: "9px" }}>🔒</span>
                      <span style={{ fontSize: "8px", color: "#9898AA" }}>Ab Professional</span>
                    </div>
                  </div>
                </div>
              </div>}
            />
          </Section>

          {/* Analysen */}
          <Section id="analysen" label="Analysen & Einblicke">
            <FeatureCard
              title="Dashboard"
              plan="free"
              description="Der Dashboard gibt dir auf einen Blick: offene Rechnungen, überfällige Beträge, diesen Monat bezahltes und die durchschnittliche Zahlungsdauer – mit Monatschart."
              bullets={["4 Stat-Karten mit Echtzeit-Daten", "Monatliches Balkendiagramm (6 Monate)", "Liste der letzten 5 Rechnungen"]}
              mockup={<MockStats />}
            />
            <FeatureCard
              title="Business Health Score"
              plan="free"
              description="Ein einzigartiges Widget zeigt dir die finanzielle Gesundheit deines Unternehmens auf einer Skala von 0–100. Automatisch berechnet aus drei Kennzahlen."
              bullets={["Einzugsquote (Anteil bezahlter Rechnungen)", "Durchschnittliche Zahlungsdauer", "Anteil überfälliger Rechnungen", "Status: Gut / Aufmerksamkeit / Kritisch"]}
              mockup={<MockHealthScore />}
            />
            <FeatureCard
              title="Zahlungsdruck-Score"
              plan="free"
              description="Jede offene Rechnung bekommt automatisch einen Zahlungsdruck-Score (0–100). Er zeigt dir sofort, bei welchen Rechnungen Handlungsbedarf besteht."
              bullets={["Überfälligkeitstage (bis 40 Punkte)", "Kundenhistorie (bis 20 Punkte)", "Anzahl gesendeter Erinnerungen", "Rechnungsbetrag (bis 20 Punkte)"]}
              mockup={<MockPressure />}
            />
            <FeatureCard
              title="Statistiken & Trends"
              plan="free"
              description="Die Statistikseite zeigt dir Umsatztrend (12 Monate), Statusverteilung aller Rechnungen als Tortendiagramm und eine Überfälligkeits-Alterungsanalyse."
              bullets={["12-Monats-Umsatzkurve (Recharts)", "Tortendiagramm Statusverteilung", "Aging-Analyse: 1–14, 15–30, 31–60, >60 Tage", "KPI-Karten: Umsatz, Ø Zahlung, Erinnerungen"]}
              mockup={<MockStats />}
            />
          </Section>

          {/* Automatisierung */}
          <Section id="automatisierung" label="Automatisierung">
            <FeatureCard
              title="Automatische Erinnerungen"
              plan="free"
              description="Faktura sendet automatisch Zahlungserinnerungen an Kunden, wenn Rechnungen überfällig werden. Du musst nichts manuell tun."
              bullets={["Konfigurierbar über ENV-Variablen", "Maximale Anzahl pro Lauf einstellbar", "Jede Erinnerung wird in der Datenbank protokolliert", "Cron-Endpunkt: POST /api/cron/check-overdue"]}
              mockup={<MockReminders />}
            />
            <FeatureCard
              title="Manuelle Mahnung"
              plan="free"
              description="Sende jederzeit manuell eine Zahlungserinnerung direkt von der Rechnungsdetailseite – mit einem Klick auf 'Erinnerung senden'."
              bullets={["Sofortige Mahnung per E-Mail", "Wird in Erinnerungshistorie gespeichert", "Fließt in den Zahlungsdruck-Score ein"]}
              mockup={<div style={{
                background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)", overflow: "hidden",
              }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {[
                      { label: "PDF", color: "#f0f0f5", tc: "#5c5c6e" },
                      { label: "Senden", color: "#f0f0f5", tc: "#5c5c6e" },
                      { label: "Erinnerung", color: "rgba(204,112,0,0.1)", tc: "#CC7000" },
                      { label: "Bezahlt ✓", color: "rgba(0,160,96,0.1)", tc: "#00A060" },
                    ].map(({ label, color, tc }) => (
                      <span key={label} style={{ fontSize: "9px", fontWeight: 700, padding: "3px 9px", background: color, color: tc, cursor: "pointer" }}>{label}</span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "10px 14px" }}>
                  <div style={{ background: "rgba(204,112,0,0.06)", border: "1px solid rgba(204,112,0,0.15)", padding: "8px 10px", marginBottom: "8px" }}>
                    <p style={{ fontSize: "9px", fontWeight: 700, color: "#CC7000" }}>Erinnerung gesendet</p>
                    <p style={{ fontSize: "8px", color: "#9898AA", marginTop: "2px" }}>01.03.2025 – an max@muster.de</p>
                  </div>
                  <div style={{ fontSize: "8px", color: "#5c5c6e", lineHeight: 1.6 }}>
                    <p>Zahlungsdruck-Score: <strong style={{ color: "#CC2020" }}>76 / 100</strong></p>
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
              description="Power-User-Feature: Navigiere durch die gesamte App ohne Maus. Drücke ? um die Hilfe zu öffnen, dann navigiere mit Einzeltasten."
              bullets={["N → Neue Rechnung", "K → Neuer Kunde", "D → Dashboard", "R → Rechnungen", "S → Einstellungen", "? → Diese Hilfe öffnen"]}
              mockup={<MockShortcuts />}
            />
            <FeatureCard
              title="Feedback & Support"
              plan="free"
              description="Das integrierte Feedback-Widget ermöglicht es dir, Bugs, Feature-Wünsche oder Lob direkt aus der App zu senden – ohne extra E-Mail oder Formular."
              bullets={["Floating-Button unten rechts im Dashboard", "3 Kategorien: Bug / Feature / Lob", "Seiten-Kontext wird automatisch erfasst", "Status-Updates sichtbar in der Support-Übersicht"]}
              mockup={<div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <MockFeedback />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", padding: "8px 10px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)", width: "140px" }}>
                    <p style={{ fontSize: "8px", fontWeight: 700, color: "#0c0c14", marginBottom: "2px" }}>Login-Fehler</p>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "7px", color: "#9898AA" }}>Bug</span>
                      <span style={{ fontSize: "7px", fontWeight: 700, color: "#CC7000", background: "rgba(204,112,0,0.08)", padding: "1px 4px" }}>Offen</span>
                    </div>
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", padding: "8px 10px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)", width: "140px" }}>
                    <p style={{ fontSize: "8px", fontWeight: 700, color: "#0c0c14", marginBottom: "2px" }}>Dark Mode bitte</p>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "7px", color: "#9898AA" }}>Feature</span>
                      <span style={{ fontSize: "7px", fontWeight: 700, color: "#00A060", background: "rgba(0,160,96,0.08)", padding: "1px 4px" }}>Gelöst</span>
                    </div>
                  </div>
                </div>
              </div>}
            />
          </Section>

          {/* Plan Comparison */}
          <PlanComparison />

          {/* CTA */}
          <div style={{
            background: "#0040CC",
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
                <div style={{ padding: "12px 28px", background: "#ffffff", color: "#0040CC", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>
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
