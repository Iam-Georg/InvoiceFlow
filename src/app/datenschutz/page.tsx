import type { Metadata } from "next";
import Link from "next/link";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

export const metadata: Metadata = {
  title: "Datenschutz",
  description:
    "Datenschutzerklärung von Faktura — DSGVO-konform, transparent, verständlich.",
};

const SECTIONS = [
  {
    title: "1. Verantwortlicher",
    paragraphs: [
      "Verantwortlicher im Sinne der DSGVO ist: InvoiceFlow UG (haftungsbeschränkt), Musterstrasse 1, 10115 Berlin, Deutschland. E-Mail: datenschutz@invoiceflow.app. Telefon: +49 30 12345678. Vertreten durch: Max Mustermann (Geschäftsführer).",
    ],
  },
  {
    title: "2. Übersicht der Verarbeitungen",
    paragraphs: [
      "Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung unseres Dienstes erforderlich ist. Die Verarbeitung erfolgt auf Grundlage der DSGVO, des BDSG und des TTDSG.",
      "Verarbeitete Datenkategorien: Bestandsdaten (Name, Adresse, Kontaktdaten), Vertragsdaten (Rechnungsdaten, Zahlungsinformationen, Kundendaten), Nutzungsdaten (Zugriffszeiten, aufgerufene Seiten), Kommunikationsdaten (E-Mail-Adressen, Support-Anfragen).",
      "Kategorien betroffener Personen: Nutzer unseres Dienstes (Freelancer, Selbstständige, Unternehmer) sowie deren Rechnungsempfänger (Kunden der Nutzer).",
    ],
  },
  {
    title: "3. Rechtsgrundlagen der Verarbeitung",
    paragraphs: [
      "Art.\u00a06 Abs.\u00a01 lit.\u00a0a DSGVO — Einwilligung: Für optionale Funktionen wie Newsletter, Analyse-Cookies und Feedback-Übermittlung.",
      "Art.\u00a06 Abs.\u00a01 lit.\u00a0b DSGVO — Vertragserfüllung: Für die Bereitstellung des Rechnungsdienstes, Nutzerverwaltung, E-Mail-Versand von Rechnungen und Erinnerungen, PDF-Generierung und Zahlungsabwicklung.",
      "Art.\u00a06 Abs.\u00a01 lit.\u00a0c DSGVO — Rechtliche Verpflichtung: Für steuerrechtliche Aufbewahrungspflichten (GoBD, 10 Jahre), Impressumspflicht und Handelsrecht.",
      "Art.\u00a06 Abs.\u00a01 lit.\u00a0f DSGVO — Berechtigtes Interesse: Für die Sicherstellung des technischen Betriebs, Missbrauchserkennung, Fehleranalyse und Verbesserung des Dienstes.",
    ],
  },
  {
    title: "4. Datenverarbeitung bei Registrierung und Nutzung",
    paragraphs: [
      "Bei der Registrierung erfassen wir: Name, E-Mail-Adresse und ein selbstgewähltes Passwort. Das Passwort wird ausschließlich gehasht gespeichert (bcrypt via Supabase Auth). Bei der Nutzung verarbeiten wir zusätzlich: Firmendaten (Firmenname, Adresse, Steuernummer), Kundendaten (Name, Adresse, E-Mail der Rechnungsempfänger), Rechnungsdaten (Positionen, Beträge, Fälligkeitsdaten, Status) und Zahlungsinformationen (Zahlungsstatus, Zahlungszeitpunkt).",
      "Rechtsgrundlage: Art.\u00a06 Abs.\u00a01 lit.\u00a0b DSGVO (Vertragserfüllung).",
    ],
  },
  {
    title: "5. E-Mail-Versand",
    paragraphs: [
      "Für den Versand von Rechnungen, Erinnerungen und Systemnachrichten nutzen wir den Dienst Resend (Resend, Inc., 450 Mission St, San Francisco, CA 94105, USA). Dabei werden E-Mail-Adresse des Empfängers, Betreff, Nachrichteninhalt und ggf. PDF-Anhänge an Resend übermittelt.",
      "Resend verarbeitet Daten auf Servern in den USA. Die Datenübermittlung erfolgt auf Grundlage von EU-Standardvertragsklauseln (Art.\u00a046 Abs.\u00a02 lit.\u00a0c DSGVO). Datenschutzrichtlinie von Resend: https://resend.com/legal/privacy-policy.",
      "Rechtsgrundlage: Art.\u00a06 Abs.\u00a01 lit.\u00a0b DSGVO (Vertragserfüllung — der Nutzer beauftragt den Versand).",
    ],
  },
  {
    title: "6. Zahlungsabwicklung",
    paragraphs: [
      "Für kostenpflichtige Tarife bieten wir Zahlung über Stripe (Stripe, Inc., 510 Townsend Street, San Francisco, CA 94103, USA) und PayPal (PayPal (Europe) S.à r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxembourg) an.",
      "Bei Stripe werden Kreditkartendaten direkt an Stripe übermittelt und nie auf unseren Servern gespeichert. Stripe ist PCI-DSS Level 1 zertifiziert. Datenschutzrichtlinie: https://stripe.com/de/privacy.",
      "Bei PayPal werden Sie zur Zahlungsabwicklung auf die PayPal-Website weitergeleitet. Datenschutzrichtlinie: https://www.paypal.com/de/webapps/mpp/ua/privacy-full.",
      "Rechtsgrundlage: Art.\u00a06 Abs.\u00a01 lit.\u00a0b DSGVO (Vertragserfüllung).",
    ],
  },
  {
    title: "7. Hosting und Infrastruktur",
    paragraphs: [
      "Der Dienst wird auf Vercel (Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA) gehostet. Vercel verarbeitet Serveranfragen und speichert temporäre Logs (IP-Adressen, Zugriffszeitpunkte). Datenschutzrichtlinie: https://vercel.com/legal/privacy-policy.",
      "Unsere Datenbank wird bei Supabase (Supabase, Inc., 970 Toa Payoh North #07-04, Singapore 318992) betrieben. Die Datenbankserver befinden sich in der EU (Frankfurt am Main, AWS eu-central-1). Datenschutzrichtlinie: https://supabase.com/privacy.",
      "Für Datenübermittlungen in die USA gelten EU-Standardvertragsklauseln gemäß Art.\u00a046 Abs.\u00a02 lit.\u00a0c DSGVO.",
    ],
  },
  {
    title: "8. KI-gestützte Funktionen",
    paragraphs: [
      "Für die optionale KI-Rechnungserstellung nutzen wir die API von Groq (Groq, Inc., Mountain View, CA, USA). Dabei wird der vom Nutzer eingegebene Freitext an Groq übermittelt. Es werden keine personenbezogenen Daten Dritter (Kundennamen, Adressen) an die KI-API gesendet.",
      "Rechtsgrundlage: Art.\u00a06 Abs.\u00a01 lit.\u00a0a DSGVO (Einwilligung — der Nutzer löst die Funktion aktiv aus).",
    ],
  },
  {
    title: "9. Fehleranalyse und Monitoring",
    paragraphs: [
      "Zur Erkennung und Behebung von Fehlern setzen wir Sentry (Functional Software, Inc., 45 Fremont Street, 8th Floor, San Francisco, CA 94105, USA) ein. Sentry erfasst technische Fehlerdaten (Fehlermeldungen, Stack-Traces, Browser-Informationen, anonymisierte IP-Adressen). Keine personenbezogenen Nutzerdaten werden an Sentry übermittelt. Datenschutzrichtlinie: https://sentry.io/privacy/.",
      "Rechtsgrundlage: Art.\u00a06 Abs.\u00a01 lit.\u00a0f DSGVO (berechtigtes Interesse an stabilem Betrieb).",
    ],
  },
  {
    title: "10. Cookies und lokale Speicherung",
    paragraphs: [
      "Wir verwenden ausschließlich technisch notwendige Cookies für die Authentifizierung (Supabase Auth Session-Cookies). Diese sind für den Betrieb des Dienstes zwingend erforderlich und bedürfen keiner Einwilligung (§ 25 Abs.\u00a02 Nr.\u00a02 TTDSG).",
      "Zusätzlich nutzen wir localStorage im Browser für: Cookie-Consent-Präferenz, E-Mail-Vorlagen (lokal gespeichert, nicht an Server übermittelt) und Design-Einstellungen.",
      "Optionale Cookies (z.\u00a0B. für Sentry-Fehleranalyse) werden nur nach ausdrücklicher Einwilligung über unseren Cookie-Banner gesetzt.",
      "Rechtsgrundlage für notwendige Cookies: § 25 Abs.\u00a02 Nr.\u00a02 TTDSG. Für optionale Cookies: Art.\u00a06 Abs.\u00a01 lit.\u00a0a DSGVO (Einwilligung).",
    ],
  },
  {
    title: "11. Speicherdauer und Löschung",
    paragraphs: [
      "Kontodaten: Werden gespeichert, solange das Nutzerkonto besteht. Nach Kündigung erfolgt die Löschung innerhalb von 30 Tagen, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.",
      "Rechnungsdaten: Unterliegen der handels- und steuerrechtlichen Aufbewahrungspflicht von 10 Jahren (§ 147 AO, § 257 HGB, GoBD). Nach Ablauf werden sie automatisch gelöscht.",
      "Kundendaten (Rechnungsempfänger): Werden zusammen mit den zugehörigen Rechnungsdaten aufbewahrt und nach Ablauf der Aufbewahrungsfrist gelöscht.",
      "Server-Logs: Werden nach 30 Tagen automatisch gelöscht.",
      "Support-Anfragen / Feedback: Werden nach Abschluss der Bearbeitung für max. 2 Jahre aufbewahrt und danach gelöscht.",
    ],
  },
  {
    title: "12. Ihre Rechte als betroffene Person",
    paragraphs: [
      "Sie haben gemäß DSGVO folgende Rechte:",
      "Auskunftsrecht (Art.\u00a015 DSGVO): Sie können Auskunft über die bei uns gespeicherten personenbezogenen Daten verlangen.",
      "Recht auf Berichtigung (Art.\u00a016 DSGVO): Sie können die Berichtigung unrichtiger Daten verlangen.",
      "Recht auf Löschung (Art.\u00a017 DSGVO): Sie können die Löschung Ihrer Daten verlangen, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.",
      "Recht auf Einschränkung (Art.\u00a018 DSGVO): Sie können die Einschränkung der Verarbeitung Ihrer Daten verlangen.",
      "Recht auf Datenübertragbarkeit (Art.\u00a020 DSGVO): Sie können Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format erhalten (JSON/CSV-Export in den Einstellungen verfügbar).",
      "Widerspruchsrecht (Art.\u00a021 DSGVO): Sie können der Verarbeitung auf Grundlage von Art.\u00a06 Abs.\u00a01 lit.\u00a0f DSGVO jederzeit widersprechen.",
      "Widerrufsrecht (Art.\u00a07 Abs.\u00a03 DSGVO): Eine erteilte Einwilligung kann jederzeit mit Wirkung für die Zukunft widerrufen werden.",
      "Zur Ausübung Ihrer Rechte wenden Sie sich an: datenschutz@invoiceflow.app.",
    ],
  },
  {
    title: "13. Beschwerderecht bei einer Aufsichtsbehörde",
    paragraphs: [
      "Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren. Zuständige Aufsichtsbehörde für uns ist:",
      "Berliner Beauftragte für Datenschutz und Informationsfreiheit, Friedrichstr. 219, 10969 Berlin. Telefon: +49 30 13889-0. E-Mail: mailbox@datenschutz-berlin.de. Website: https://www.datenschutz-berlin.de.",
    ],
  },
  {
    title: "14. Datensicherheit",
    paragraphs: [
      "Wir setzen technische und organisatorische Maßnahmen (TOMs) gemäß Art.\u00a032 DSGVO ein, um ein dem Risiko angemessenes Schutzniveau zu gewährleisten:",
      "Verschlüsselung: Alle Datenübertragungen erfolgen über TLS 1.3. Passwörter werden mit bcrypt gehasht.",
      "Zugriffskontrolle: Row-Level Security (RLS) in der Datenbank stellt sicher, dass Nutzer nur auf eigene Daten zugreifen können.",
      "Backup: Tägliche automatische Datenbank-Backups mit Point-in-Time Recovery.",
      "Monitoring: Automatische Fehlererkennung und -benachrichtigung über Sentry.",
    ],
  },
  {
    title: "15. Auftragsverarbeitung",
    paragraphs: [
      "Mit allen Dienstleistern, die in unserem Auftrag personenbezogene Daten verarbeiten, haben wir Auftragsverarbeitungsverträge (AVV) gemäß Art.\u00a028 DSGVO geschlossen. Dies betrifft insbesondere: Supabase (Datenbank-Hosting), Vercel (Web-Hosting), Resend (E-Mail-Versand), Stripe (Zahlungsabwicklung), PayPal (Zahlungsabwicklung), Groq (KI-API) und Sentry (Fehleranalyse).",
    ],
  },
  {
    title: "16. Änderungen dieser Datenschutzerklärung",
    paragraphs: [
      "Wir behalten uns vor, diese Datenschutzerklärung zu ändern, um sie an geänderte Rechtslagen oder bei Änderungen des Dienstes anzupassen. Die jeweils aktuelle Version ist stets unter /datenschutz abrufbar. Bei wesentlichen Änderungen informieren wir registrierte Nutzer per E-Mail.",
      "Stand: März 2026.",
    ],
  },
];

export default function DatenschutzPage() {
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
          Datenschutzerklärung
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-3)",
            marginBottom: "48px",
          }}
        >
          Stand: März 2026 — DSGVO, BDSG, TTDSG
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {SECTIONS.map(({ title, paragraphs }) => (
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {paragraphs.map((text, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: "14px",
                      color: "var(--text-2)",
                      lineHeight: 1.7,
                    }}
                  >
                    {text}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: "24px",
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
          <Link
            href="/agb"
            style={{
              fontSize: "13px",
              color: "var(--accent)",
              textDecoration: "none",
            }}
          >
            AGB
          </Link>
          <Link
            href="/impressum"
            style={{
              fontSize: "13px",
              color: "var(--accent)",
              textDecoration: "none",
            }}
          >
            Impressum
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
