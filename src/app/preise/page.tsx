import type { Metadata } from "next";
import Link from "next/link";
import MarketingHeader from "@/components/layout/MarketingHeader";

export const metadata: Metadata = {
  title: "Preise",
  description:
    "Faktura Preise: Kostenlos starten, ab 9 €/Monat für unbegrenzte Rechnungen. Transparente Preise ohne versteckte Kosten.",
};
import MarketingFooter from "@/components/layout/MarketingFooter";

const PLANS = [
  {
    name: "Free",
    price: "0 €",
    period: "/ Monat",
    priceColor: "var(--success)",
    desc: "Kostenlos starten",
    features: [
      "3 Rechnungen/Monat",
      "PDF Export",
      "1 Kunde",
      "E-Mail Support",
    ],
    buttonLabel: "Kostenlos starten",
    buttonHref: "/register",
    buttonDisabled: false,
    buttonClass: "btn-secondary",
    accentBorder: false,
    highlighted: false,
  },
  {
    name: "Starter",
    price: "9 €",
    period: "/ Monat",
    priceColor: "var(--accent)",
    desc: "Für Einsteiger",
    features: [
      "10 Rechnungen/Monat",
      "PDF Export",
      "Unbegrenzte Kunden",
      "E-Mail Versand",
      "Erinnerungen",
    ],
    buttonLabel: "Upgrade – demnächst",
    buttonHref: "/register",
    buttonDisabled: true,
    buttonClass: "btn-primary",
    accentBorder: true,
    highlighted: true,
  },
  {
    name: "Professional",
    price: "19 €",
    period: "/ Monat",
    priceColor: "var(--accent)",
    desc: "Für aktive Freelancer",
    features: [
      "Unbegrenzte Rechnungen",
      "Alles aus Starter",
      "Automatische Mahnungen",
      "Priorität-Support",
    ],
    buttonLabel: "Upgrade – demnächst",
    buttonHref: "/register",
    buttonDisabled: true,
    buttonClass: "btn-primary",
    accentBorder: false,
    highlighted: false,
  },
  {
    name: "Business",
    price: "39 €",
    period: "/ Monat",
    priceColor: "var(--accent)",
    desc: "Für Teams",
    features: [
      "Alles aus Professional",
      "Steuerexport CSV",
      "API-Zugang",
      "Team-Zugang",
    ],
    buttonLabel: "Upgrade – demnächst",
    buttonHref: "/register",
    buttonDisabled: true,
    buttonClass: "btn-primary",
    accentBorder: false,
    highlighted: false,
  },
];

const FAQ = [
  {
    q: "Muss ich eine Kreditkarte hinterlegen?",
    a: "Nein. Der Free-Plan ist komplett kostenlos und erfordert keine Zahlungsmethode.",
  },
  {
    q: "Wann kommen die bezahlten Pläne?",
    a: "Die Starter-, Professional- und Business-Pläne sind in Entwicklung. Du wirst informiert, sobald sie verfügbar sind.",
  },
  {
    q: "Bleiben meine Daten in Deutschland?",
    a: "Ja. Alle Daten werden auf EU-Servern gespeichert und unterliegen der DSGVO.",
  },
  {
    q: "Kann ich jederzeit kündigen?",
    a: "Selbstverständlich. Bezahlte Pläne werden monatlich abgerechnet und können jederzeit beendet werden.",
  },
];

export default function PreisePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <MarketingHeader />

      <main style={{ paddingTop: "58px" }}>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto", padding: "72px 40px 48px" }}>
          <p className="label-caps" style={{ marginBottom: "16px" }}>Transparente Preise</p>
          <h1 style={{
            fontSize: "40px", fontWeight: 700, letterSpacing: "-0.03em",
            color: "var(--text-1)", lineHeight: 1.12, marginBottom: "16px",
          }}>
            Einfach anfangen. Upgraden wenn du bereit bist.
          </h1>
          <p style={{ fontSize: "16px", color: "var(--text-2)", lineHeight: 1.7 }}>
            Kein Abo-Zwang. Keine versteckten Kosten. Kein Risiko.
          </p>
        </div>

        {/* ── PLANS GRID ───────────────────────────────────────── */}
        <div className="scroll-reveal" style={{
          maxWidth: "1000px", margin: "0 auto",
          padding: "0 40px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          alignItems: "start",
        }}>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="card-hover"
              style={{
                background: "var(--surface)",
                boxShadow: plan.highlighted ? "var(--shadow-lg)" : "var(--shadow-md)",
                overflow: "hidden",
                borderLeft: plan.accentBorder ? "3px solid var(--accent)" : undefined,
                ...(plan.highlighted ? {
                  transform: "translateY(-8px)",
                  borderTop: "3px solid var(--accent)",
                } : {}),
              }}
            >
              {/* Plan header */}
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--border)",
              }}>
                <p style={{
                  fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em",
                  textTransform: "uppercase", color: "var(--text-3)",
                  marginBottom: "10px",
                }}>
                  {plan.name}
                </p>
                <p style={{
                  fontSize: "26px", fontWeight: 700, letterSpacing: "-0.03em",
                  color: plan.priceColor, lineHeight: 1, marginBottom: "6px",
                }}>
                  {plan.price}{" "}
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-3)" }}>
                    {plan.period}
                  </span>
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-3)" }}>{plan.desc}</p>
              </div>

              {/* Features list */}
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <div style={{
                        width: "5px", height: "5px",
                        background: "var(--success)",
                        flexShrink: 0, marginTop: "4px",
                      }} />
                      <span style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ padding: "16px 24px" }}>
                {plan.buttonDisabled ? (
                  <button
                    disabled
                    className={`btn ${plan.buttonClass}`}
                    style={{ width: "100%", opacity: 0.5, cursor: "not-allowed" }}
                  >
                    {plan.buttonLabel}
                  </button>
                ) : (
                  <Link href={plan.buttonHref} style={{ textDecoration: "none", display: "block" }}>
                    <button className={`btn ${plan.buttonClass}`} style={{ width: "100%" }}>
                      {plan.buttonLabel}
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <div className="scroll-reveal" style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 40px 80px" }}>
          <p className="label-caps" style={{ marginBottom: "32px" }}>Häufige Fragen</p>
          <div>
            {FAQ.map(({ q, a }) => (
              <div
                key={q}
                style={{
                  borderTop: "1px solid var(--border)",
                  padding: "20px 0",
                }}
              >
                <p style={{
                  fontSize: "14px", fontWeight: 700,
                  color: "var(--text-1)", marginBottom: "8px",
                  letterSpacing: "-0.01em",
                }}>
                  {q}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.65 }}>
                  {a}
                </p>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--border)" }} />
          </div>
        </div>

      </main>

      <MarketingFooter />
    </div>
  );
}
