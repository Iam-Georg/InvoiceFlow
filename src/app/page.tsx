import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, ShieldCheck, Sparkles, Users } from "lucide-react";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--ios-bg)",
        padding: "28px 24px 48px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <header
          className="card-base"
          style={{
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "30px",
                height: "30px",
                // borderRadius: "8px",
                background: "var(--accent)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={16} />
            </div>
            <strong style={{ fontSize: "18px", letterSpacing: "-0.02em", color: "var(--text-1)" }}>Faktura</strong>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <button className="ios-btn ios-btn-secondary">Anmelden</button>
            </Link>
            <Link href="/register" style={{ textDecoration: "none" }}>
              <button className="ios-btn ios-btn-primary">Kostenlos starten</button>
            </Link>
          </div>
        </header>

        <section className="card-elevated" style={{ padding: "32px", marginBottom: "24px" }}>
          <p className="label-caps" style={{ marginBottom: "10px" }}>Fuer Selbststaendige in Deutschland</p>
          <h1 className="page-title" style={{ maxWidth: "760px", marginBottom: "14px" }}>
            Rechnungen schreiben wie in iOS. Klar, schnell und ohne Steuerchaos.
          </h1>
          <p style={{ fontSize: "17px", color: "var(--ios-label-2)", maxWidth: "720px", marginBottom: "20px" }}>
            Faktura vereint Rechnungserstellung, Kundenverwaltung und Mahnungen in einer ruhigen, aufgeraeumten Oberflaeche.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/register" style={{ textDecoration: "none" }}>
              <button className="ios-btn ios-btn-primary" style={{ minWidth: "220px" }}>
                Jetzt kostenlos testen
                <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <button className="ios-btn ios-btn-secondary" style={{ minWidth: "180px" }}>
                Zum Login
              </button>
            </Link>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "28px" }}>
          {[
            { icon: Sparkles, title: "Rechnung in Sekunden", text: "Vorlagen, KI-Positionen und automatische Summen." },
            { icon: Users, title: "Kunden im Blick", text: "Zahlungsverhalten, offene Betraege und Historie sofort sichtbar." },
            { icon: ShieldCheck, title: "DSGVO-freundlich", text: "Daten in der EU, klare Rollen und nachvollziehbare Prozesse." },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="card-base" style={{ padding: "20px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  // borderRadius: "10px",
                  background: "var(--accent-light)",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "10px",
                }}
              >
                <Icon size={16} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "6px" }}>{title}</h2>
              <p style={{ fontSize: "15px", color: "var(--ios-label-3)" }}>{text}</p>
            </article>
          ))}
        </section>

        <section className="card-base" style={{ padding: "20px", marginBottom: "28px" }}>
          <p className="label-caps" style={{ marginBottom: "10px" }}>Warum Faktura</p>
          <div style={{ display: "grid", gap: "10px" }}>
            {[
              "Saubere Rechnungslayouts mit PDF-Export",
              "Mahnungen und Versand direkt aus der App",
              "Stripe- und PayPal-Anbindung vorbereitet",
              "Uebersichtliches Dashboard fuer Liquiditaet",
            ].map((point) => (
              <div key={point} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span style={{ fontSize: "16px" }}>{point}</span>
              </div>
            ))}
          </div>
        </section>

        <footer
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            color: "var(--ios-label-3)",
            fontSize: "14px",
          }}
        >
          <span>© {new Date().getFullYear()} Faktura</span>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Link href="/impressum" style={{ color: "inherit", textDecoration: "none" }}>Impressum</Link>
            <Link href="/datenschutz" style={{ color: "inherit", textDecoration: "none" }}>Datenschutz</Link>
            <Link href="/login" style={{ color: "inherit", textDecoration: "none" }}>App Login</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
