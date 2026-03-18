import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, ArrowRight, Shield, CreditCard, Clock, Zap } from "lucide-react";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

export const metadata: Metadata = {
  title: "Pläne & Preise",
  description:
    "Faktura Preise: Kostenlos starten, ab 9 €/Monat für unbegrenzte Rechnungen. Transparente Preise ohne versteckte Kosten.",
};

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: "0",
    desc: "Ideal zum Ausprobieren",
    features: [
      "3 Rechnungen / Monat",
      "PDF-Export",
      "3 Kunden",
      "E-Mail Support",
    ],
    buttonLabel: "Kostenlos starten",
    buttonHref: "/register",
    buttonDisabled: false,
    recommended: false,
  },
  {
    id: "starter" as const,
    name: "Starter",
    price: "9",
    desc: "Für Einsteiger & Freelancer",
    features: [
      "10 Rechnungen / Monat",
      "PDF-Export",
      "Unbegrenzte Kunden",
      "E-Mail Versand",
      "Erinnerungen",
    ],
    buttonLabel: "Demnächst verfügbar",
    buttonHref: "/register",
    buttonDisabled: true,
    recommended: true,
  },
  {
    id: "professional" as const,
    name: "Professional",
    price: "19",
    desc: "Für aktive Freelancer",
    features: [
      "Unbegrenzte Rechnungen",
      "Alles aus Starter",
      "Automatische Mahnungen",
      "Priorität-Support",
    ],
    buttonLabel: "Demnächst verfügbar",
    buttonHref: "/register",
    buttonDisabled: true,
    recommended: false,
  },
  {
    id: "business" as const,
    name: "Business",
    price: "39",
    desc: "Für Teams & Agenturen",
    features: [
      "Alles aus Professional",
      "Steuerexport CSV",
      "API-Zugang",
      "Team-Zugang",
    ],
    buttonLabel: "Demnächst verfügbar",
    buttonHref: "/register",
    buttonDisabled: true,
    recommended: false,
  },
];

const TRUST_ITEMS = [
  { icon: "Shield", label: "DSGVO-konform" },
  { icon: "CreditCard", label: "Keine Kreditkarte nötig" },
  { icon: "Clock", label: "Jederzeit kündbar" },
  { icon: "Zap", label: "Sofort startklar" },
];

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Shield, CreditCard, Clock, Zap,
};

type FeatureRow = {
  name: string;
  category?: string;
  free: boolean | string;
  starter: boolean | string;
  professional: boolean | string;
  business: boolean | string;
};

const FEATURES: FeatureRow[] = [
  { name: "Rechnungen", category: "Grundlagen", free: "3/Mo", starter: "10/Mo", professional: "Unbegrenzt", business: "Unbegrenzt" },
  { name: "Kunden", free: "3", starter: "Unbegrenzt", professional: "Unbegrenzt", business: "Unbegrenzt" },
  { name: "PDF-Export", free: true, starter: true, professional: true, business: true },
  { name: "E-Mail-Versand", free: true, starter: true, professional: true, business: true },
  { name: "Dashboard & Statistiken", category: "Analyse", free: true, starter: true, professional: true, business: true },
  { name: "Health Score", free: true, starter: true, professional: true, business: true },
  { name: "Zahlungsdruck-Score", free: true, starter: true, professional: true, business: true },
  { name: "Tastenkürzel", free: true, starter: true, professional: true, business: true },
  { name: "Rechnung importieren", category: "Automatisierung", free: false, starter: true, professional: true, business: true },
  { name: "Wiederkehrende Rechnungen", free: false, starter: true, professional: true, business: true },
  { name: "E-Mail-Vorlagen", free: false, starter: true, professional: true, business: true },
  { name: "Kundenrabatt", free: false, starter: true, professional: true, business: true },
  { name: "KI-Features", category: "Pro Features", free: false, starter: false, professional: true, business: true },
  { name: "E-Mail CC/BCC", free: false, starter: false, professional: true, business: true },
  { name: "Mehrwährung", free: false, starter: false, professional: true, business: true },
  { name: "Kundenkonto-Portal", free: false, starter: false, professional: true, business: true },
  { name: "API-Zugang", category: "Enterprise", free: false, starter: false, professional: false, business: true },
  { name: "Prioritäts-Support", free: false, starter: false, professional: false, business: true },
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

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const PLAN_IDS = ["free", "starter", "professional", "business"] as const;

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */

export default function PreisePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* JSON-LD structured data from static constants — safe, no user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <MarketingHeader />

      {/* Scoped styles */}
      <style>{`
        @media (max-width: 900px) {
          .plans-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .faq-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .plans-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <main style={{ paddingTop: "58px" }}>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section style={{
          textAlign: "center",
          maxWidth: "680px",
          margin: "0 auto",
          padding: "64px 24px 40px",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            background: "var(--accent-soft)",
            marginBottom: "24px",
          }}>
            <div style={{
              width: "6px", height: "6px",
              background: "var(--success)",
            }} />
            <span style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}>
              Transparente Preise
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: "var(--text-1)",
            lineHeight: 1.08,
            marginBottom: "16px",
          }}>
            Starte kostenlos.<br />
            <span style={{ color: "var(--accent)" }}>Wachse mit uns.</span>
          </h1>

          <p style={{
            fontSize: "16px",
            color: "var(--text-2)",
            lineHeight: 1.7,
            maxWidth: "480px",
            margin: "0 auto",
          }}>
            Kein Abo-Zwang. Keine versteckten Kosten. Upgraden, wenn du soweit bist.
          </p>
        </section>

        {/* ── PLANS GRID ───────────────────────────────────────── */}
        <section style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "0 24px 48px",
        }}>
          <div
            className="plans-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
              alignItems: "start",
            }}
          >
            {PLANS.map((plan) => {
              const isRec = plan.recommended;
              return (
                <div
                  key={plan.id}
                  className="plan-card"
                  style={{
                    background: isRec ? "var(--accent)" : "var(--surface)",
                    boxShadow: isRec ? "var(--shadow-lg)" : "var(--shadow-md)",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  {/* Recommended badge */}
                  {isRec && (
                    <div style={{
                      padding: "8px 24px 0",
                    }}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        fontSize: "9px",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        background: "rgba(255,255,255,0.2)",
                        color: "#fff",
                      }}>
                        Empfohlen
                      </span>
                    </div>
                  )}

                  {/* Plan header */}
                  <div style={{
                    padding: isRec ? "12px 24px 20px" : "20px 24px",
                  }}>
                    <p style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: isRec ? "rgba(255,255,255,0.7)" : "var(--text-3)",
                      marginBottom: "12px",
                      letterSpacing: "-0.01em",
                    }}>
                      {plan.name}
                    </p>
                    <div style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "4px",
                      marginBottom: "8px",
                    }}>
                      <span style={{
                        fontSize: "42px",
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                        color: isRec ? "#fff" : "var(--text-1)",
                      }}>
                        {plan.price}€
                      </span>
                      <span style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: isRec ? "rgba(255,255,255,0.5)" : "var(--text-3)",
                      }}>
                        / Monat
                      </span>
                    </div>
                    <p style={{
                      fontSize: "13px",
                      color: isRec ? "rgba(255,255,255,0.6)" : "var(--text-2)",
                      lineHeight: 1.5,
                    }}>
                      {plan.desc}
                    </p>
                  </div>

                  {/* Divider */}
                  <div style={{
                    height: "1px",
                    background: isRec ? "rgba(255,255,255,0.15)" : "var(--border)",
                    margin: "0 24px",
                  }} />

                  {/* Features list */}
                  <div style={{
                    padding: "20px 24px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}>
                        <div style={{
                          width: "18px",
                          height: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          background: isRec ? "rgba(255,255,255,0.15)" : "var(--success-bg)",
                          marginTop: "1px",
                        }}>
                          <Check
                            size={11}
                            style={{ color: isRec ? "#fff" : "var(--success)" }}
                            strokeWidth={2.5}
                          />
                        </div>
                        <span style={{
                          fontSize: "13px",
                          color: isRec ? "rgba(255,255,255,0.85)" : "var(--text-2)",
                          lineHeight: 1.5,
                        }}>
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div style={{ padding: "0 24px 24px" }}>
                    {plan.buttonDisabled ? (
                      <button
                        disabled
                        className="btn btn-secondary"
                        style={{
                          width: "100%",
                          opacity: 0.5,
                          cursor: "not-allowed",
                          ...(isRec ? {
                            background: "rgba(255,255,255,0.15)",
                            color: "rgba(255,255,255,0.6)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            boxShadow: "none",
                          } : {}),
                        }}
                      >
                        {plan.buttonLabel}
                      </button>
                    ) : (
                      <Link href={plan.buttonHref} style={{ textDecoration: "none", display: "block" }}>
                        <button
                          className={`btn ${isRec ? "btn-secondary" : "btn-primary"}`}
                          style={{ width: "100%" }}
                        >
                          {plan.buttonLabel}
                          <ArrowRight size={14} style={{ marginLeft: "6px" }} />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── TRUST STRIP ──────────────────────────────────────── */}
        <section style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "0 24px 48px",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
          }}>
            {TRUST_ITEMS.map((item) => {
              const IconComp = ICON_MAP[item.icon];
              return (
                <div
                  key={item.label}
                  className="trust-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px 20px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {IconComp && (
                    <IconComp size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  )}
                  <span style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-2)",
                  }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── FEATURE COMPARISON TABLE ────────────────────────── */}
        <section style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "0 24px 48px",
        }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--text-1)",
              letterSpacing: "-0.03em",
              marginBottom: "8px",
            }}>
              Alle Features im Vergleich
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-3)" }}>
              Detaillierter Überblick über alle enthaltenen Funktionen
            </p>
          </div>

          <div style={{
            overflowX: "auto",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "700px",
            }}>
              <thead>
                <tr>
                  <th style={{
                    padding: "20px 24px",
                    textAlign: "left",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--text-3)",
                    borderBottom: "2px solid var(--border)",
                    width: "30%",
                  }}>
                    Feature
                  </th>
                  {PLANS.map((p) => (
                    <th key={p.id} style={{
                      padding: "20px 16px",
                      textAlign: "center",
                      borderBottom: "2px solid var(--border)",
                      ...(p.recommended ? {
                        background: "var(--accent)",
                        color: "#fff",
                      } : {
                        color: "var(--text-1)",
                      }),
                    }}>
                      <div style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        opacity: p.recommended ? 0.7 : 0.5,
                        marginBottom: "6px",
                      }}>
                        {p.name}
                      </div>
                      <div style={{
                        fontSize: "22px",
                        fontWeight: 800,
                        letterSpacing: "-0.03em",
                        lineHeight: 1,
                      }}>
                        {p.price}€
                        <span style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          opacity: 0.6,
                          marginLeft: "2px",
                        }}>
                          /Mo
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => (
                  <Fragment key={f.name}>
                    {/* Category header row */}
                    {f.category && (
                      <tr key={`cat-${f.category}`}>
                        <td
                          colSpan={5}
                          style={{
                            padding: "14px 24px 8px",
                            fontSize: "10px",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "var(--accent)",
                            background: "var(--surface-2)",
                            borderBottom: "1px solid var(--border)",
                            ...(i === 0 ? {} : { borderTop: "1px solid var(--border)" }),
                          }}
                        >
                          {f.category}
                        </td>
                      </tr>
                    )}
                    <tr key={f.name} className="feature-row">
                      <td
                        className="feature-cell"
                        style={{
                          padding: "12px 24px",
                          fontSize: "13px",
                          color: "var(--text-2)",
                          borderBottom: "1px solid var(--divider)",
                          transition: "background var(--duration-fast) var(--ease-smooth)",
                        }}
                      >
                        {f.name}
                      </td>
                      {PLAN_IDS.map((pid) => {
                        const val = f[pid];
                        const isRec = pid === "starter";
                        return (
                          <td
                            key={pid}
                            className="feature-cell"
                            style={{
                              padding: "12px 16px",
                              textAlign: "center",
                              fontSize: "13px",
                              borderBottom: "1px solid var(--divider)",
                              fontWeight: typeof val === "string" ? 700 : 400,
                              transition: "background var(--duration-fast) var(--ease-smooth)",
                              ...(isRec ? {
                                background: "var(--accent-soft)",
                              } : {}),
                              color:
                                val === true
                                  ? "var(--success)"
                                  : val === false
                                    ? "var(--text-3)"
                                    : "var(--text-1)",
                            }}
                          >
                            {val === true ? (
                              <Check size={15} strokeWidth={2.5} style={{ display: "inline" }} />
                            ) : val === false ? (
                              <Minus size={14} style={{ display: "inline", opacity: 0.4 }} />
                            ) : (
                              val
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "0 24px 48px",
        }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--text-1)",
              letterSpacing: "-0.03em",
              marginBottom: "8px",
            }}>
              Häufige Fragen
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-3)" }}>
              Alles was du vor dem Start wissen musst
            </p>
          </div>

          <div
            className="faq-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            {FAQ.map(({ q, a }) => (
              <div
                key={q}
                className="faq-item"
                style={{
                  padding: "24px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <p style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--text-1)",
                  marginBottom: "10px",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.4,
                }}>
                  {q}
                </p>
                <p style={{
                  fontSize: "13px",
                  color: "var(--text-2)",
                  lineHeight: 1.65,
                }}>
                  {a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ──────────────────────────────────────── */}
        <section style={{
          margin: "0 24px 48px",
          maxWidth: "1080px",
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          <div style={{
            background: "var(--accent)",
            padding: "48px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
          }}>
            <div>
              <h3 style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.02em",
                marginBottom: "8px",
              }}>
                Bereit, loszulegen?
              </h3>
              <p style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.6,
              }}>
                Erstelle deine erste Rechnung. Schnell und kostenlos.
              </p>
            </div>
            <Link href="/register" style={{ textDecoration: "none", flexShrink: 0 }}>
              <button
                className="btn"
                style={{
                  background: "#fff",
                  color: "var(--accent)",
                  fontWeight: 700,
                  padding: "14px 32px",
                  fontSize: "14px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                Kostenlos starten
                <ArrowRight size={15} style={{ marginLeft: "8px" }} />
              </button>
            </Link>
          </div>
        </section>

      </main>

      <MarketingFooter />
    </div>
  );
}
