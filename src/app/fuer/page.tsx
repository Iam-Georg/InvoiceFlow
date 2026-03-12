import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Camera, Globe, Palette, Code, Monitor, Heart, Building2, PenTool, Music, Video, Briefcase, Wrench, Languages, GraduationCap, Headphones } from "lucide-react";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";
import AnimatedIndustryHero from "@/components/marketing/AnimatedIndustryHero";
import { INDUSTRIES, CATEGORY_CONFIG, type Category } from "@/data/industries";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Camera, Globe, Palette, Code, Monitor, Heart, Building2, PenTool, Music, Video, Briefcase, Wrench, Languages, GraduationCap, Headphones,
};

const CATEGORIES: Category[] = ["kreative", "tech", "beratung", "handwerk"];

export const metadata: Metadata = {
  title: "Rechnungsprogramm nach Branche",
  description: "Faktura für deine Branche — spezialisierte Rechnungsstellung für Fotografen, Webdesigner, IT-Berater, Texter und 10+ weitere Berufsgruppen.",
  alternates: { canonical: "https://faktura.app/fuer" },
};

export default function IndustriesOverviewPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <MarketingHeader />
      <main style={{ paddingTop: "58px" }}>
        <AnimatedIndustryHero />

        {/* Category Sections */}
        {CATEGORIES.map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const industries = INDUSTRIES.filter((i) => i.category === cat);
          return (
            <section key={cat} style={{ padding: "0 24px 72px", maxWidth: "1100px", margin: "0 auto" }}>
              <div style={{ marginBottom: "28px" }}>
                <span style={{
                  display: "inline-block", padding: "3px 10px",
                  fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  background: "var(--accent-soft)", color: "var(--accent)",
                  marginBottom: "12px",
                }}>
                  {config.label}
                </span>
                <h2 style={{
                  fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800,
                  color: "var(--text-1)", letterSpacing: "-0.02em",
                  lineHeight: 1.2, marginBottom: "8px",
                }}>
                  {config.headline}
                </h2>
                <p style={{ fontSize: "14px", color: "var(--text-2)", maxWidth: "500px" }}>
                  {config.description}
                </p>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }}>
                {industries.map((industry) => {
                  const IconComp = ICON_MAP[industry.icon];
                  return (
                    <Link key={industry.slug} href={`/fuer/${industry.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="card-hover" style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-sm)",
                        padding: "24px",
                        display: "flex", flexDirection: "column", gap: "14px",
                        cursor: "pointer",
                        height: "100%",
                        transition: "box-shadow var(--duration-normal) var(--ease-out), transform var(--duration-normal) var(--ease-out)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{
                            width: "36px", height: "36px",
                            background: "var(--accent-soft)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            {IconComp && <IconComp size={18} style={{ color: "var(--accent)" }} />}
                          </div>
                          <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-1)" }}>
                            {industry.name}
                          </p>
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6 }}>
                          {industry.benefit}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "auto" }}>
                          <span style={{
                            padding: "3px 8px", fontSize: "11px", fontWeight: 600,
                            background: "var(--surface-2)", color: "var(--text-2)",
                          }}>
                            Ø {industry.avgInvoiceAmount}
                          </span>
                          <span style={{
                            padding: "3px 8px", fontSize: "11px", fontWeight: 600,
                            background: "var(--surface-2)", color: "var(--text-2)",
                          }}>
                            {industry.avgPaymentDays} Tage
                          </span>
                          <ArrowRight size={15} style={{ marginLeft: "auto", color: "var(--accent)" }} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Social Proof */}
        <section style={{
          padding: "48px 24px",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
            }}>
              {[
                { quote: "Seit ich Faktura nutze, spare ich 5 Stunden pro Woche an Verwaltungsarbeit.", name: "Lisa M.", role: "Fotografin" },
                { quote: "Meine Konzern-Kunden nehmen Faktura-Rechnungen ernst — das Layout macht den Unterschied.", name: "Thomas K.", role: "IT-Berater" },
                { quote: "12 Kunden, 12 monatliche Rechnungen — Faktura erstellt alle automatisch am 1. des Monats.", name: "Sarah B.", role: "Virtuelle Assistentin" },
              ].map((t) => (
                <div key={t.name} style={{ padding: "20px 0" }}>
                  <p style={{
                    fontSize: "14px", color: "var(--text-2)", lineHeight: 1.7,
                    fontStyle: "italic", marginBottom: "12px",
                  }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>
                    {t.name}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-3)" }}>
                    {t.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "72px 24px", textAlign: "center" }}>
          <h2 style={{
            fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800,
            color: "var(--text-1)", letterSpacing: "-0.02em",
            marginBottom: "12px",
          }}>
            Bereit, deine Rechnungen auf ein neues Level zu bringen?
          </h2>
          <p style={{
            fontSize: "14px", color: "var(--text-2)", marginBottom: "28px",
          }}>
            Keine Kreditkarte nötig · Kostenloser Plan verfügbar
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ textDecoration: "none" }}>
              <button className="btn btn-primary" style={{ padding: "12px 28px", fontSize: "14px" }}>
                Kostenlos starten <ArrowRight size={15} />
              </button>
            </Link>
            <Link href="/docs" style={{ textDecoration: "none" }}>
              <button className="btn btn-secondary" style={{ padding: "12px 28px", fontSize: "14px" }}>
                Funktionen entdecken
              </button>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
