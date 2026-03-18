import type { Metadata } from "next";
import Link from "next/link";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

export const metadata: Metadata = {
  title: "AGB",
  description:
    "Allgemeine Geschäftsbedingungen von Faktura — Rechnungssoftware für Freelancer und Selbstständige.",
};

const SECTIONS = [
  {
    title: "§ 1 Geltungsbereich",
    content:
      'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der webbasierten Rechnungssoftware \u201eFaktura\u201c (nachfolgend \u201eDienst\u201c), betrieben von InvoiceFlow UG (haftungsbeschränkt), Musterstrasse 1, 10115 Berlin (nachfolgend \u201eAnbieter\u201c). Mit der Registrierung akzeptiert der Nutzer diese AGB.',
  },
  {
    title: "§ 2 Vertragsschluss und Registrierung",
    content:
      "Der Vertrag kommt mit Abschluss der Registrierung zustande. Der Nutzer versichert, dass die angegebenen Daten korrekt sind. Pro Person oder Unternehmen darf nur ein Account erstellt werden. Der Anbieter behält sich vor, Registrierungen ohne Angabe von Gründen abzulehnen.",
  },
  {
    title: "§ 3 Leistungsbeschreibung",
    content:
      "Der Dienst ermöglicht das Erstellen, Verwalten und Versenden von Rechnungen. Der Funktionsumfang richtet sich nach dem gewählten Tarif (Free, Starter, Professional, Business). Der Anbieter bemüht sich um eine Verfügbarkeit von 99,5 %, übernimmt jedoch keine Garantie für ununterbrochenen Betrieb. Wartungsarbeiten werden nach Möglichkeit vorab angekündigt.",
  },
  {
    title: "§ 4 Tarife und Leistungsgrenzen",
    content:
      "Der kostenlose Tarif (Free) ist dauerhaft nutzbar mit eingeschränktem Funktionsumfang (z.\u00a0B. max. 3 Rechnungen/Monat, 3 Kunden). Kostenpflichtige Tarife werden monatlich abgerechnet. Der Anbieter behält sich vor, Tarifpreise mit einer Ankündigungsfrist von 30 Tagen zu ändern. Bestehende Abonnements sind bis zum Ende der Laufzeit geschützt.",
  },
  {
    title: "§ 5 Zahlungsbedingungen",
    content:
      "Die Zahlung kostenpflichtiger Tarife erfolgt per Kreditkarte (über Stripe) oder PayPal. Rechnungen werden monatlich im Voraus erstellt. Bei Zahlungsverzug wird der Account nach 14 Tagen auf den Free-Tarif zurückgestuft. Bereits erstellte Rechnungsdaten bleiben erhalten.",
  },
  {
    title: "§ 6 Pflichten des Nutzers",
    content:
      "Der Nutzer ist für die Richtigkeit seiner Rechnungsdaten selbst verantwortlich. Der Dienst ersetzt keine steuerliche Beratung. Der Nutzer verpflichtet sich, den Dienst nicht missbräuchlich zu nutzen (z.\u00a0B. für Spam, betrügerische Rechnungen oder Verstöße gegen geltendes Recht).",
  },
  {
    title: "§ 7 Haftungsbeschränkung",
    content:
      "Der Anbieter haftet nur für Vorsatz und grobe Fahrlässigkeit. Die Haftung für leichte Fahrlässigkeit ist auf die Verletzung wesentlicher Vertragspflichten beschränkt und der Höhe nach auf den vorhersehbaren, vertragstypischen Schaden begrenzt. Die Haftung für Datenverlust ist auf den typischen Wiederherstellungsaufwand begrenzt, der bei regelmäßiger Datensicherung entstanden wäre.",
  },
  {
    title: "§ 8 Datenschutz",
    content:
      "Die Verarbeitung personenbezogener Daten erfolgt gemäß der DSGVO und unserer Datenschutzerklärung unter /datenschutz. Rechnungsdaten werden auf EU-Servern gespeichert. Der Anbieter gibt keine personenbezogenen Daten an Dritte weiter, es sei denn, dies ist zur Vertragserfüllung erforderlich (z.\u00a0B. Zahlungsabwicklung über Stripe/PayPal).",
  },
  {
    title: "§ 9 Kündigung",
    content:
      "Kostenlose Accounts können jederzeit gelöscht werden. Kostenpflichtige Abonnements können zum Ende des Abrechnungszeitraums gekündigt werden. Nach Kündigung bleiben Rechnungsdaten gemäß den gesetzlichen Aufbewahrungsfristen (10 Jahre, GoBD) erhalten. Der Nutzer kann einen vollständigen Datenexport vor der Kündigung anfordern.",
  },
  {
    title: "§ 10 Änderungen der AGB",
    content:
      "Der Anbieter kann diese AGB mit einer Ankündigungsfrist von 30 Tagen ändern. Nutzer werden per E-Mail informiert. Widerspricht ein Nutzer nicht innerhalb von 30 Tagen, gelten die geänderten AGB als akzeptiert. Bei Widerspruch steht dem Nutzer ein Sonderkündigungsrecht zu.",
  },
  {
    title: "§ 11 Schlussbestimmungen",
    content:
      "Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist Berlin, sofern der Nutzer Kaufmann ist. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.",
  },
];

export default function AGBPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <MarketingHeader />
      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "120px 40px 80px",
        }}
      >
        <div style={{
          maxWidth: "800px", margin: "24px auto 0", padding: "16px 24px",
          background: "#FFF3CD", border: "1px solid #FFE69C",
          fontSize: "13px", color: "#664D03", lineHeight: 1.6,
        }}>
          Diese Seite befindet sich im Aufbau. Die angezeigten Firmendaten sind Platzhalter und werden vor dem offiziellen Launch durch echte Angaben ersetzt.
        </div>
        <p className="label-caps" style={{ marginBottom: "12px" }}>
          Rechtliches
        </p>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--text-1)",
            marginBottom: "8px",
          }}
        >
          Allgemeine Geschäftsbedingungen
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-3)",
            marginBottom: "48px",
          }}
        >
          Stand: März 2026
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {SECTIONS.map(({ title, content }) => (
            <div key={title}>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--text-1)",
                  marginBottom: "8px",
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-2)",
                  lineHeight: 1.7,
                }}
              >
                {content}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: "13px",
              color: "var(--accent)",
              textDecoration: "none",
            }}
          >
            Zur Startseite
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
