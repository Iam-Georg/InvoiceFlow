import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Funktionen",
  description:
    "Alle Funktionen von Faktura: KI-Rechnungserstellung, automatische Erinnerungen, PDF-Export, Kundenverwaltung und mehr – für Freelancer und Selbstständige.",
};
import {
  FileText,
  Users,
  Download,
  Mail,
  Bell,
  BarChart3,
  ShieldCheck,
  CreditCard,
  Zap,
  Palette,
  Repeat,
  Database,
} from "lucide-react";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

const FEATURES = [
  {
    Icon: FileText,
    title: "Rechnungen erstellen",
    description:
      "Positionen, Mengen, Einzelpreise, MwSt. und Zahlungsziel – alles in einem übersichtlichen Formular. Automatische Rechnungsnummer.",
  },
  {
    Icon: Users,
    title: "Kundenverwaltung",
    description:
      "Kundendaten einmal hinterlegen und bei jeder neuen Rechnung automatisch übernehmen. Vollständige Rechnungshistorie pro Kunde.",
  },
  {
    Icon: Download,
    title: "PDF Export",
    description:
      "Jede Rechnung als professionelles PDF herunterladen und direkt an den Kunden senden. Korrekte Pflichtangaben inklusive.",
  },
  {
    Icon: Mail,
    title: "E-Mail Versand",
    description:
      "Rechnungen direkt aus Faktura per E-Mail versenden. Mit eigenen Textvorlagen – individuell und professionell.",
  },
  {
    Icon: Bell,
    title: "Automatische Erinnerungen",
    description:
      "Faktura erinnert deine Kunden automatisch an offene Rechnungen. Weniger unangenehme Gespräche, mehr pünktliche Zahlungen.",
  },
  {
    Icon: BarChart3,
    title: "Dashboard & Übersicht",
    description:
      "Auf einen Blick: Gesamtumsatz, offene Posten, überfällige Rechnungen. Kein Excel, kein Rätselraten.",
  },
  {
    Icon: ShieldCheck,
    title: "DSGVO-konform",
    description:
      "Alle Daten auf EU-Servern. Kein Tracking, keine Weitergabe. Gebaut nach deutschen Datenschutzstandards.",
  },
  {
    Icon: CreditCard,
    title: "Flexible Pläne",
    description:
      "Kostenlos starten und so lange nutzen wie du willst. Upgrade nur wenn du wirklich mehr brauchst.",
  },
  {
    Icon: Zap,
    title: "Schnell & fokussiert",
    description:
      "Keine überladene Software. Keine steile Lernkurve. In 10 Minuten eingerichtet und direkt produktiv.",
  },
  {
    Icon: Palette,
    title: "Rechnungsvorlagen",
    description:
      "Gestalten Sie eigene Rechnungsvorlagen mit individuellen Farben, Logo und Schriftarten. Live-Vorschau beim Bearbeiten.",
  },
  {
    Icon: Repeat,
    title: "Wiederkehrende Rechnungen",
    description:
      "Automatische Rechnungserstellung für Retainer und Abonnements. Monatlich, vierteljährlich oder jährlich.",
  },
  {
    Icon: Database,
    title: "DATEV-Export",
    description:
      "Exportieren Sie Ihre Rechnungsdaten im DATEV-Buchungsstapel-Format für Ihren Steuerberater.",
  },
];

export default function FunktionenPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <MarketingHeader />

      <main style={{ paddingTop: "58px" }}>
        {/* ── HERO ─────────────────────────────────────────────── */}
        <div
          style={{
            textAlign: "center",
            maxWidth: "800px",
            margin: "0 auto",
            padding: "72px 40px 64px",
          }}
        >
          <p className="label-caps" style={{ marginBottom: "16px" }}>
            Was Faktura kann
          </p>
          <h1
            style={{
              fontSize: "44px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--text-1)",
              lineHeight: 1.1,
              marginBottom: "20px",
            }}
          >
            Alles was du brauchst. Nichts was du nicht brauchst.
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "var(--text-2)",
              lineHeight: 1.7,
              marginBottom: "32px",
              maxWidth: "560px",
              margin: "0 auto 32px",
            }}
          >
            Faktura ist ein fokussiertes Rechnungstool. Keine überladenen Menüs,
            keine unnötigen Features – nur das, was Freelancer wirklich täglich
            brauchen.
          </p>
          <Link href="/register" style={{ textDecoration: "none" }}>
            <button
              className="btn btn-primary"
              style={{ height: "44px", padding: "0 28px", fontSize: "14px" }}
            >
              Kostenlos starten
            </button>
          </Link>
        </div>

        {/* ── FEATURES GRID ────────────────────────────────────── */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 40px 80px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            {FEATURES.map(({ Icon, title, description }) => (
              <div
                key={title}
                style={{
                  background: "var(--surface)",
                  boxShadow: "var(--shadow-md)",
                  padding: "28px 24px",
                  borderLeft: "3px solid var(--accent)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "var(--accent-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <Icon size={18} color="var(--accent)" />
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--text-1)",
                    letterSpacing: "-0.01em",
                    marginBottom: "10px",
                  }}
                >
                  {title}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-2)",
                    lineHeight: 1.65,
                  }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM CTA ───────────────────────────────────────── */}
        <div style={{ background: "#0B1628", padding: "72px 40px" }}>
          <div
            style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}
          >
            <h2
              style={{
                fontSize: "32px",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#fff",
                marginBottom: "12px",
              }}
            >
              Überzeugt? Dann leg los.
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "32px",
                lineHeight: 1.7,
              }}
            >
              Kostenlos starten, keine Kreditkarte, kein Abo-Zwang.
            </p>
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <Link href="/register" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    background: "#fff",
                    color: "var(--accent)",
                    height: "44px",
                    padding: "0 28px",
                    fontSize: "14px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  Kostenlos starten
                </button>
              </Link>
              <Link href="/preise" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.7)",
                    height: "44px",
                    padding: "0 24px",
                    fontSize: "14px",
                    fontWeight: 500,
                    border: "1px solid rgba(255,255,255,0.12)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  Preise ansehen
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
