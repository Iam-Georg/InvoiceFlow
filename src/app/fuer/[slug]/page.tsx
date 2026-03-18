import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FileText,
  Bell,
  BarChart3,
  Zap,
  ArrowRight,
  AlertTriangle,
  Clock,
  TrendingUp,
  Target,
} from "lucide-react";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";
import { getIndustryBySlug, getAllIndustrySlugs } from "@/data/industries";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllIndustrySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) return {};

  return {
    title: `Rechnungsprogramm für ${industry.name}`,
    description: industry.metaDescription,
    keywords: industry.keywords,
    openGraph: {
      title: `Rechnungsprogramm für ${industry.name} | Faktura`,
      description: industry.metaDescription,
      type: "website",
      locale: "de_DE",
      url: `https://faktura.app/fuer/${industry.slug}`,
    },
    alternates: {
      canonical: `https://faktura.app/fuer/${industry.slug}`,
    },
  };
}

const PAIN_ICONS = [AlertTriangle, Clock, TrendingUp] as const;
const FEATURE_ICONS = [FileText, Bell, Zap, BarChart3] as const;

export default async function IndustryPage({ params }: PageProps) {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) notFound();

  // Schema.org structured data — static content only, no user input
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `Faktura für ${industry.name}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: "39",
      priceCurrency: "EUR",
      offerCount: "4",
    },
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <MarketingHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <main style={{ paddingTop: "58px" }}>

        {/* ── HERO ─────────────────────────────────────── */}
        <section
          style={{
            padding: "80px 24px 60px",
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "4px 14px",
              background: "var(--accent-soft)",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Für {industry.name}
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 800,
              color: "var(--text-1)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: "16px",
            }}
          >
            {industry.heroTitle}
          </h1>

          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.7,
              color: "var(--text-2)",
              maxWidth: "600px",
              margin: "0 auto 32px",
            }}
          >
            {industry.heroSubtitle}
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "40px",
            }}
          >
            <Link href="/register" style={{ textDecoration: "none" }}>
              <button className="btn btn-primary" style={{ padding: "12px 28px", fontSize: "14px" }}>
                Kostenlos starten
                <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </Link>
            <Link href="/funktionen" style={{ textDecoration: "none" }}>
              <button className="btn btn-secondary" style={{ padding: "12px 28px", fontSize: "14px" }}>
                Alle Funktionen
              </button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "32px",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Ø Rechnungsbetrag", value: industry.avgInvoiceAmount },
              { label: "Ø Zahlungsziel", value: `${industry.avgPaymentDays} Tage` },
              { label: "Preis", value: "Kostenlos starten" },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--text-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "4px",
                  }}
                >
                  {label}
                </p>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PAIN POINTS ──────────────────────────────── */}
        <section
          style={{
            padding: "60px 24px",
            maxWidth: "960px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "var(--text-1)",
                letterSpacing: "-0.02em",
                marginBottom: "8px",
              }}
            >
              Das kennen {industry.name} zu gut
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-2)" }}>
              Typische Abrechnungs-Probleme in deiner Branche
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {industry.painPoints.map((pain, i) => {
              const Icon = PAIN_ICONS[i];
              return (
                <div
                  key={i}
                  style={{
                    background: "var(--surface)",
                    padding: "24px",
                    boxShadow: "var(--shadow-sm)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      background: "var(--warning-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <Icon style={{ width: 16, height: 16, color: "var(--warning)" }} />
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.7,
                      color: "var(--text-2)",
                    }}
                  >
                    {pain}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── PRESSURE SCORE ──────────────────────────── */}
        <section
          style={{
            padding: "60px 24px",
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              maxWidth: "960px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "48px",
              alignItems: "center",
            }}
          >
            {/* Left: Text */}
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  background: "var(--danger-bg)",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--danger)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Nur bei Faktura
                </span>
              </div>

              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "var(--text-1)",
                  letterSpacing: "-0.02em",
                  marginBottom: "12px",
                }}
              >
                Zahlungsdruck-Score
              </h2>

              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: "var(--text-2)",
                  marginBottom: "24px",
                }}
              >
                {industry.pressureScoreHook}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "Überfälligkeit gewichtet nach Tagen",
                  "Kundenhistorie fließt automatisch ein",
                  "Mahnstufen nach Rechnungsbetrag skaliert",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        background: "var(--success-bg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Target style={{ width: 10, height: 10, color: "var(--success)" }} />
                    </div>
                    <span style={{ fontSize: "13px", color: "var(--text-2)" }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Score Visual Mock */}
            <div
              style={{
                background: "var(--bg)",
                padding: "28px",
                boxShadow: "var(--shadow-md)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "20px",
                }}
              >
                Beispiel: Zahlungsdruck
              </p>

              {[
                { name: "Kunde A", score: 22, color: "var(--success)" },
                { name: "Kunde B", score: 58, color: "var(--warning)" },
                { name: "Kunde C", score: 87, color: "var(--danger)" },
              ].map(({ name, score, color }) => (
                <div key={name} style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-1)" }}>
                      {name}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color }}>
                      {score}/100
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "var(--border)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${score}%`,
                        height: "100%",
                        background: color,
                      }}
                    />
                  </div>
                </div>
              ))}

              <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "20px" }}>
                Score basiert auf Überfälligkeit, Mahnanzahl, Kundenhistorie und Betragshöhe.
              </p>
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────── */}
        <section
          style={{
            padding: "60px 24px",
            maxWidth: "960px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "var(--text-1)",
                letterSpacing: "-0.02em",
                marginBottom: "8px",
              }}
            >
              Was Faktura für {industry.name} bietet
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {industry.features.map((feature, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div
                  key={i}
                  style={{
                    background: "var(--surface)",
                    padding: "24px 20px",
                    boxShadow: "var(--shadow-sm)",
                    border: "1px solid var(--border)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "var(--accent-soft)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <Icon style={{ width: 18, height: 18, color: "var(--accent)" }} />
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: "var(--text-2)",
                    }}
                  >
                    {feature}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── EHRLICHE FEEDBACK-BOX ────────────────────── */}
        <section
          style={{
            padding: "48px 24px",
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <p style={{
              fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "var(--accent)", marginBottom: "12px",
            }}>
              Wir sind neu
            </p>
            <h3 style={{
              fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em",
              color: "var(--text-1)", marginBottom: "10px",
            }}>
              Faktura ist ein junges Produkt.
            </h3>
            <p style={{
              fontSize: "14px", color: "var(--text-2)", lineHeight: 1.7,
            }}>
              Wir arbeiten jeden Tag daran, es besser zu machen.
              Wenn du Feedback hast, freuen wir uns darüber.
            </p>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────── */}
        <section
          style={{
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "var(--text-1)",
              letterSpacing: "-0.02em",
              marginBottom: "12px",
            }}
          >
            Bereit, schneller bezahlt zu werden?
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-2)",
              marginBottom: "28px",
            }}
          >
            Kostenlos starten — keine Kreditkarte nötig. Upgrade jederzeit.
          </p>
          <Link href="/register" style={{ textDecoration: "none" }}>
            <button
              className="btn btn-primary"
              style={{ padding: "14px 36px", fontSize: "15px", fontWeight: 700 }}
            >
              Jetzt kostenlos registrieren
              <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </Link>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
