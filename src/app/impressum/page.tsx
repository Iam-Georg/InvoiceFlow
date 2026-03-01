import Link from "next/link";

export default function ImpressumPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "28px 24px 48px", background: "var(--ios-bg)" }}>
      <div className="card-base" style={{ maxWidth: "860px", margin: "0 auto", padding: "24px" }}>
        <h1 className="page-title" style={{ marginBottom: "18px" }}>Impressum</h1>
        <p style={{ marginBottom: "16px", color: "var(--ios-label-2)" }}>
          Angaben gemaess § 5 TMG.
        </p>
        <div style={{ display: "grid", gap: "10px", fontSize: "16px", lineHeight: 1.5 }}>
          <p><strong>Anbieter:</strong> InvoiceFlow UG (haftungsbeschraenkt)</p>
          <p><strong>Adresse:</strong> Musterstrasse 1, 10115 Berlin, Deutschland</p>
          <p><strong>E-Mail:</strong> kontakt@invoiceflow.app</p>
          <p><strong>Vertreten durch:</strong> Max Mustermann</p>
          <p><strong>Registergericht:</strong> Amtsgericht Berlin</p>
          <p><strong>Registernummer:</strong> HRB 123456 B</p>
          <p><strong>USt-IdNr.:</strong> DE123456789</p>
        </div>
        <div style={{ marginTop: "20px" }}>
          <Link href="/" style={{ color: "var(--accent)", textDecoration: "none" }}>Zur Startseite</Link>
        </div>
      </div>
    </main>
  );
}

