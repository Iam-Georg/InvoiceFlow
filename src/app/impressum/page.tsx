import type { Metadata } from "next";
import Link from "next/link";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Impressum von Faktura — Angaben gemäß § 5 TMG, § 18 MStV.",
};

const SECTIONS = [
  {
    title: "Angaben gemäß § 5 TMG",
    content: null,
    items: [
      { label: "Anbieter", value: "InvoiceFlow UG (haftungsbeschränkt)" },
      { label: "Anschrift", value: "Musterstraße 1, 10115 Berlin, Deutschland" },
      { label: "Vertreten durch", value: "Max Mustermann (Geschäftsführer)" },
      { label: "E-Mail", value: "kontakt@invoiceflow.app" },
      { label: "Telefon", value: "+49 30 12345678" },
      { label: "Registergericht", value: "Amtsgericht Charlottenburg, Berlin" },
      { label: "Registernummer", value: "HRB 123456 B" },
      { label: "USt-IdNr.", value: "DE123456789 (gemäß § 27a UStG)" },
    ],
  },
  {
    title: "Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV",
    content:
      "Max Mustermann, Musterstraße 1, 10115 Berlin, Deutschland.",
    items: null,
  },
  {
    title: "EU-Streitschlichtung",
    content:
      "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/. Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
    items: null,
  },
  {
    title: "Haftung für Inhalte",
    content:
      "Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.",
    items: null,
  },
  {
    title: "Haftung für Links",
    content:
      "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.",
    items: null,
  },
  {
    title: "Urheberrecht",
    content:
      "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.",
    items: null,
  },
];

export default function ImpressumPage() {
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
          Impressum
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-3)",
            marginBottom: "48px",
          }}
        >
          Angaben gemäß § 5 TMG, § 18 MStV
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {SECTIONS.map(({ title, content, items }) => (
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
              {items ? (
                <div
                  style={{
                    display: "grid",
                    gap: "6px",
                  }}
                >
                  {items.map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        gap: "8px",
                        fontSize: "14px",
                        lineHeight: 1.7,
                      }}
                    >
                      <span
                        style={{
                          color: "var(--text-3)",
                          minWidth: "160px",
                          flexShrink: 0,
                        }}
                      >
                        {label}
                      </span>
                      <span style={{ color: "var(--text-1)", fontWeight: 500 }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-2)",
                    lineHeight: 1.7,
                  }}
                >
                  {content}
                </p>
              )}
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
