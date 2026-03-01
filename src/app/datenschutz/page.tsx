import Link from "next/link";

export default function DatenschutzPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "28px 24px 48px", background: "var(--ios-bg)" }}>
      <div className="card-base" style={{ maxWidth: "860px", margin: "0 auto", padding: "24px" }}>
        <h1 className="page-title" style={{ marginBottom: "18px" }}>Datenschutzerklaerung</h1>
        <div style={{ display: "grid", gap: "14px", fontSize: "16px", lineHeight: 1.6 }}>
          <p>
            Wir verarbeiten personenbezogene Daten nur im Rahmen der gesetzlichen Vorschriften,
            insbesondere der DSGVO und des BDSG.
          </p>
          <p>
            Bei Nutzung der App werden Kontodaten, Rechnungsdaten und Kundendaten verarbeitet,
            um den Dienst technisch und fachlich bereitzustellen.
          </p>
          <p>
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfuellung) sowie
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherem Betrieb).
          </p>
          <p>
            Betroffene Personen haben Rechte auf Auskunft, Berichtigung, Loeschung, Einschraenkung,
            Datenuebertragbarkeit sowie Widerspruch.
          </p>
          <p>
            Anfragen bitte an: datenschutz@invoiceflow.app
          </p>
        </div>
        <div style={{ marginTop: "20px" }}>
          <Link href="/" style={{ color: "var(--accent)", textDecoration: "none" }}>Zur Startseite</Link>
        </div>
      </div>
    </main>
  );
}

