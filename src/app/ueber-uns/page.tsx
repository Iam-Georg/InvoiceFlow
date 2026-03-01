import type { Metadata } from "next";
import Link from "next/link";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Faktura entstand aus der eigenen Frustration mit komplizierten Buchhaltungstools. Ein Rechnungsprogramm, das wirklich für Freelancer gemacht ist.",
};

const PRINCIPLES = [
  {
    title: "Einfachheit zuerst",
    text: "Jede Funktion muss einen klaren Nutzen haben. Was nicht gebraucht wird, kommt nicht rein.",
  },
  {
    title: "Ehrliche Preise",
    text: "Kostenlos bedeutet wirklich kostenlos. Kein Trick, kein Lockangebot. Upgrade nur wenn du bereit bist.",
  },
  {
    title: "Privatsphäre by Design",
    text: "Keine Werbung, kein Tracking, keine Datenweitergabe. Deine Rechnungsdaten gehören dir.",
  },
  {
    title: "Gemacht in Deutschland",
    text: "Gebaut von einer Privatperson aus Deutschland, für Freelancer in Deutschland. DSGVO ist kein Checkbox, sondern Grundlage.",
  },
];

export default function UeberUnsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <MarketingHeader />

      <main style={{ paddingTop: "58px" }}>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <div style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "72px 40px",
        }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <p className="label-caps" style={{ marginBottom: "16px" }}>Über Faktura</p>
            <h1 style={{
              fontSize: "44px", fontWeight: 700, letterSpacing: "-0.03em",
              color: "var(--text-1)", lineHeight: 1.1, marginBottom: "20px",
            }}>
              Von einem Freelancer. Für Freelancer.
            </h1>
            <p style={{
              fontSize: "16px", color: "var(--text-2)", lineHeight: 1.7,
              maxWidth: "560px",
            }}>
              Faktura entstand aus echter Frustration. Zu viele Tools sind zu komplex, zu teuer oder beides. Also haben wir selbst eins gebaut.
            </p>
          </div>
        </div>

        {/* ── STORY ────────────────────────────────────────────── */}
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "64px 40px" }}>

          <h2 style={{
            fontSize: "20px", fontWeight: 700,
            color: "var(--text-1)", letterSpacing: "-0.02em",
            marginBottom: "16px",
          }}>
            Die Idee
          </h2>
          <p style={{
            fontSize: "14px", color: "var(--text-2)", lineHeight: 1.75,
            marginBottom: "16px",
          }}>
            Als selbstständiger Entwickler in Deutschland war die Suche nach einem guten Rechnungstool ernüchternd. Entweder waren die Tools zu überladen für einfache Nutzung, zu teuer für den gelegentlichen Auftrag, oder schlicht hässlich.
          </p>
          <p style={{
            fontSize: "14px", color: "var(--text-2)", lineHeight: 1.75,
          }}>
            Faktura ist der Versuch, das besser zu machen. Ein Tool das sich anfühlt wie eine gut gemachte iOS-App – klar, schnell, ohne Ablenkung. Kein Abo-Zwang zum Start. Keine Lernkurve.
          </p>

          <h2 style={{
            fontSize: "20px", fontWeight: 700,
            color: "var(--text-1)", letterSpacing: "-0.02em",
            marginBottom: "24px", marginTop: "48px",
          }}>
            Unsere Prinzipien
          </h2>

          <div>
            {PRINCIPLES.map(({ title, text }) => (
              <div
                key={title}
                style={{
                  borderLeft: "3px solid var(--accent)",
                  paddingLeft: "16px",
                  marginBottom: "24px",
                }}
              >
                <p style={{
                  fontSize: "14px", fontWeight: 700,
                  color: "var(--text-1)", marginBottom: "6px",
                  letterSpacing: "-0.01em",
                }}>
                  {title}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.65 }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div style={{ background: "var(--accent)", padding: "64px 40px" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{
              fontSize: "32px", fontWeight: 700, letterSpacing: "-0.03em",
              color: "#fff", marginBottom: "12px",
            }}>
              Überzeuge dich selbst.
            </h2>
            <p style={{
              fontSize: "15px", color: "rgba(255,255,255,0.75)",
              marginBottom: "32px", lineHeight: 1.7,
            }}>
              Keine Kreditkarte. Kein Abo. Einfach anfangen.
            </p>
            <Link href="/register" style={{ textDecoration: "none" }}>
              <button style={{
                background: "#fff", color: "var(--accent)",
                height: "44px", padding: "0 32px",
                fontSize: "14px", fontWeight: 700,
                border: "none", cursor: "pointer",
                display: "inline-flex", alignItems: "center",
              }}>
                Kostenlos starten
              </button>
            </Link>
          </div>
        </div>

      </main>

      <MarketingFooter />
    </div>
  );
}
