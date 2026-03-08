import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";
import { INDUSTRIES } from "@/data/industries";

export const metadata: Metadata = {
  title: "Rechnungsprogramm nach Branche",
  description:
    "Faktura für deine Branche — spezialisierte Rechnungsstellung für Fotografen, Webdesigner, IT-Berater, Texter und 10+ weitere Berufsgruppen.",
  alternates: {
    canonical: "https://faktura.app/fuer",
  },
};

export default function IndustriesOverviewPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <MarketingHeader />

      <main style={{ paddingTop: "58px" }}>
        {/* Hero */}
        <section
          style={{
            padding: "80px 24px 48px",
            maxWidth: "700px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 800,
              color: "var(--text-1)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: "14px",
            }}
          >
            Faktura für deine Branche
          </h1>
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.7,
              color: "var(--text-2)",
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            Egal ob Fotograf, Entwickler oder Coach — Faktura passt sich deiner
            Arbeitsweise an. Finde heraus, wie andere in deiner Branche schneller
            bezahlt werden.
          </p>
        </section>

        {/* Grid */}
        <section
          style={{
            padding: "0 24px 80px",
            maxWidth: "960px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "14px",
            }}
          >
            {INDUSTRIES.map((industry) => (
              <Link
                key={industry.slug}
                href={`/fuer/${industry.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="card-hover"
                  style={{
                    background: "var(--surface)",
                    padding: "22px 24px",
                    boxShadow: "var(--shadow-sm)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    cursor: "pointer",
                    transition: "box-shadow var(--duration-normal) var(--ease-out), transform var(--duration-normal) var(--ease-out)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--text-1)",
                        marginBottom: "4px",
                      }}
                    >
                      {industry.name}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-3)",
                      }}
                    >
                      Ø {industry.avgInvoiceAmount} · {industry.avgPaymentDays} Tage Zahlungsziel
                    </p>
                  </div>
                  <ArrowRight
                    style={{
                      width: 16,
                      height: 16,
                      color: "var(--accent)",
                      flexShrink: 0,
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            padding: "48px 24px 80px",
            textAlign: "center",
            borderTop: "1px solid var(--border)",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--text-1)",
              marginBottom: "10px",
            }}
          >
            Deine Branche nicht dabei?
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-2)",
              marginBottom: "24px",
            }}
          >
            Faktura funktioniert für alle Selbstständigen. Starte kostenlos und
            überzeuge dich selbst.
          </p>
          <Link href="/register" style={{ textDecoration: "none" }}>
            <button className="btn btn-primary" style={{ padding: "12px 28px", fontSize: "14px" }}>
              Kostenlos starten
              <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
          </Link>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
