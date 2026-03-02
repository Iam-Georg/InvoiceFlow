"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { ArrowRight, FileText } from "lucide-react";
import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

export default function Home() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const sb = getSupabase();
      const {
        data: { user },
      } = await sb.auth.getUser();
      setIsLoggedIn(!!user);
    }
    checkAuth();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <MarketingHeader />

      {/* ── MAIN ───────────────────────────────────────────────── */}
      <main style={{ paddingTop: "58px" }}>

        {/* ── HERO: Split ──────────────────────────────────────── */}
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 40px 72px", background: "radial-gradient(ellipse at 60% 40%, var(--accent-soft) 0%, transparent 60%)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "72px", alignItems: "center" }}>

            {/* Left – Text */}
            <div>
              {/* Pill */}
              <div className="anim-fade-in-up" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 12px", background: "var(--accent-soft)", marginBottom: "28px" }}>
                <div style={{ width: "6px", height: "6px", background: "var(--accent)", flexShrink: 0 }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Kostenlos · Keine Kreditkarte
                </span>
              </div>

              <h1 className="anim-fade-in-up anim-delay-1" style={{ fontSize: "50px", fontWeight: 700, letterSpacing: "-0.04em", color: "var(--text-1)", lineHeight: 1.07, marginBottom: "20px" }}>
                Rechnungen<br />
                schreiben,{" "}
                <span style={{ color: "var(--accent)" }}>die&nbsp;ankommen.</span>
              </h1>

              <p className="anim-fade-in-up anim-delay-2" style={{ fontSize: "16px", color: "var(--text-2)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "400px" }}>
                Professionelle Rechnungen in unter 3 Minuten. Zahlungen verfolgen, Mahnungen automatisieren, PDF exportieren.
              </p>

              {/* CTAs */}
              <div className="anim-fade-in-up anim-delay-3" style={{ display: "flex", gap: "10px", marginBottom: "32px" }}>
                {isLoggedIn ? (
                  <Link href="/dashboard" style={{ textDecoration: "none" }}>
                    <button className="btn btn-primary" style={{ height: "44px", padding: "0 28px", fontSize: "14px" }}>
                      Zum Dashboard <ArrowRight size={14} />
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register" style={{ textDecoration: "none" }}>
                      <button className="btn btn-primary btn-breathe" style={{ height: "44px", padding: "0 28px", fontSize: "14px" }}>
                        Kostenlos starten
                      </button>
                    </Link>
                    <Link href="/login" style={{ textDecoration: "none" }}>
                      <button className="btn btn-ghost" style={{ height: "44px", padding: "0 22px", fontSize: "14px" }}>
                        Anmelden
                      </button>
                    </Link>
                  </>
                )}
              </div>

              {/* Trust-Zeile */}
              <div className="anim-fade-in-up anim-delay-4" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {["DSGVO-konform", "PDF Export inklusive", "Made in Germany"].map((t) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "5px", height: "5px", background: "var(--success)", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 500 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – Rechnungs-Mockup */}
            <div style={{ position: "relative", animation: "floatY 4s ease-in-out infinite" }}>

              {/* Floating status chip oben rechts */}
              <div style={{
                position: "absolute", top: "-14px", right: "-8px", zIndex: 2,
                background: "var(--surface)", boxShadow: "var(--shadow-lg)",
                padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px",
              }}>
                <div style={{ width: "7px", height: "7px", background: "var(--success)", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-1)" }}>PDF bereit zum Download</span>
              </div>

              {/* Haupt-Card */}
              <div style={{ background: "var(--surface)", boxShadow: "var(--shadow-lg)", overflow: "hidden" }}>

                {/* Card-Header */}
                <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)" }}>
                  <div>
                    <p className="label-caps" style={{ marginBottom: "3px" }}>Rechnung</p>
                    <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}>RE-2025-0042</p>
                  </div>
                  <span style={{ padding: "3px 10px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: "var(--badge-paid-bg)", color: "var(--badge-paid-text)" }}>
                    Bezahlt
                  </span>
                </div>

                {/* Kunde */}
                <div style={{ padding: "12px 22px", borderBottom: "1px solid var(--border)" }}>
                  <p className="label-caps" style={{ marginBottom: "4px" }}>Kunde</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>Müller &amp; Partner GmbH</p>
                  <p style={{ fontSize: "12px", color: "var(--text-3)" }}>kontakt@mueller-partner.de</p>
                </div>

                {/* Positionen */}
                <div style={{ padding: "0 22px" }}>
                  {[
                    { desc: "Webdesign – Startseite", qty: "1×", price: "1.200,00 €" },
                    { desc: "SEO Optimierung", qty: "3×", price: "600,00 €" },
                    { desc: "Projektmanagement", qty: "4 Std.", price: "280,00 €" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--divider)" }}>
                      <div>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-1)" }}>{item.desc}</p>
                        <p style={{ fontSize: "11px", color: "var(--text-3)" }}>{item.qty}</p>
                      </div>
                      <span className="amount" style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-1)" }}>{item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div style={{ padding: "14px 22px", background: "var(--accent)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Gesamt inkl. MwSt.</span>
                  <span className="amount" style={{ fontSize: "20px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>2.476,00 €</span>
                </div>
              </div>

              {/* Floating chip unten links */}
              <div style={{
                position: "absolute", bottom: "-14px", left: "-8px",
                background: "#0B1628", boxShadow: "var(--shadow-lg)",
                padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px",
              }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>Erinnerung automatisch gesendet</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── WIE ES FUNKTIONIERT ──────────────────────────────── */}
        <div className="scroll-reveal" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "64px 40px" }}>
            <p className="label-caps" style={{ textAlign: "center", marginBottom: "48px" }}>So einfach geht&apos;s</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
              {[
                { num: "01", title: "Kunden anlegen", text: "Name, E-Mail, Adresse – einmal hinterlegt, immer abrufbar. Vollständige Rechnungshistorie pro Kunde." },
                { num: "02", title: "Rechnung erstellen", text: "Positionen, MwSt., Zahlungsziel – alles in einem Formular. In unter 3 Minuten versandbereit." },
                { num: "03", title: "Senden &amp; tracken", text: "Per E-Mail senden, PDF exportieren, Zahlungseingang verfolgen und automatisch mahnen." },
              ].map(({ num, title, text }, i) => (
                <div
                  key={num}
                  className={`anim-fade-in-up anim-delay-${i + 1}`}
                  style={{ padding: "0 40px 0 0", borderLeft: i > 0 ? "1px solid var(--border)" : "none", paddingLeft: i > 0 ? "40px" : "0" }}
                >
                  <p style={{ fontSize: "40px", fontWeight: 700, letterSpacing: "-0.05em", color: "var(--accent-soft)", lineHeight: 1, marginBottom: "16px", fontVariantNumeric: "tabular-nums" }}>
                    {num}
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em", marginBottom: "10px" }}>{title}</p>
                  <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: text }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION A: Kein Excel. Kein Chaos. ───────────────── */}
        <div className="scroll-reveal" style={{ background: "#0B1628", padding: "80px 40px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <p className="label-caps" style={{ color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>
              Das kennen wir alle
            </p>
            <h2 style={{
              fontSize: "42px", fontWeight: 700, letterSpacing: "-0.03em",
              color: "#fff", marginBottom: "40px", lineHeight: 1.1,
            }}>
              Schluss mit Excel-Chaos.
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* LEFT: Früher */}
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "28px 28px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                  <div style={{ width: "8px", height: "8px", background: "var(--danger)", flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "-0.01em" }}>Früher</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[
                    "Word-Dokument als Rechnungsvorlage",
                    "Mahnungen vergessen – Geld weg",
                    "Keine Ahnung, wer noch schuldet",
                    "Stundenlange Vorbereitung fürs Steuerbüro",
                    "Jede Rechnung kostet 20 Minuten",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <div style={{ width: "5px", height: "5px", background: "var(--danger)", flexShrink: 0, marginTop: "5px" }} />
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: Mit Faktura */}
              <div style={{
                background: "rgba(0,64,204,0.06)",
                border: "1px solid rgba(0,64,204,0.4)",
                padding: "28px 28px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                  <div style={{ width: "8px", height: "8px", background: "var(--success)", flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "-0.01em" }}>Mit Faktura</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[
                    "Rechnung in 3 Minuten, professionell",
                    "Automatische Erinnerungen per E-Mail",
                    "Dashboard mit allen offenen Posten",
                    "CSV-Export für den Steuerberater",
                    "Mehr Zeit für echte Arbeit",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <div style={{ width: "5px", height: "5px", background: "var(--success)", flexShrink: 0, marginTop: "5px" }} />
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION B: Testimonials ───────────────────────────── */}
        <div className="scroll-reveal" style={{ background: "var(--bg)" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "72px 40px" }}>
            <p className="label-caps" style={{ marginBottom: "40px" }}>Was andere sagen</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {[
                {
                  quote: "Ich hab Faktura ausprobiert und meine Rechnungs-Excel-Tabelle sofort gelöscht. Keine Sekunde bereut.",
                  initials: "MK",
                  person: "M.K. · Webdesignerin, Berlin",
                },
                {
                  quote: "Endlich sehe ich auf einen Blick, wer noch nicht bezahlt hat. Das Dashboard ist Gold wert.",
                  initials: "TB",
                  person: "T.B. · Fotograf, München",
                },
                {
                  quote: "Dass man einfach kostenlos starten kann ohne Kreditkarte hat mich überzeugt. Genau so soll Software sein.",
                  initials: "SR",
                  person: "S.R. · Texterin, Hamburg",
                },
              ].map(({ quote, initials, person }, i) => (
                <div
                  key={person}
                  className={`card-hover anim-fade-in-up anim-delay-${i + 1}`}
                  style={{
                    background: "var(--surface)",
                    boxShadow: "var(--shadow-md)",
                    padding: "28px 24px",
                  }}
                >
                  <p style={{ fontSize: "32px", color: "var(--accent-soft)", lineHeight: 1, marginBottom: "8px" }}>
                    &#8222;
                  </p>
                  <p style={{ fontSize: "14px", color: "var(--text-1)", lineHeight: 1.7, marginBottom: "20px" }}>
                    {quote}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "28px", height: "28px",
                      background: "var(--accent)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff" }}>{initials}</span>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 500 }}>{person}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION C: Bold CTA ───────────────────────────────── */}
        <div className="scroll-reveal" style={{ background: "var(--accent)", padding: "80px 40px" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{
              fontSize: "40px", fontWeight: 700, letterSpacing: "-0.03em",
              color: "#fff", marginBottom: "12px",
            }}>
              Deine erste Rechnung. In 3 Minuten.
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.75)", marginBottom: "36px" }}>
              Kostenlos starten – kein Abo, kein Risiko, keine Kreditkarte.
            </p>
            <Link href="/register" style={{ textDecoration: "none" }}>
              <button
                className="btn"
                style={{
                  background: "#fff", color: "var(--accent)",
                  height: "46px", padding: "0 36px",
                  fontSize: "14px", fontWeight: 700,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                Jetzt kostenlos starten
              </button>
            </Link>
            <p style={{ marginTop: "20px" }}>
              <Link href="/login" style={{
                fontSize: "13px", color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
              }}>
                Bereits registriert? Jetzt anmelden &rarr;
              </Link>
            </p>
          </div>
        </div>

      </main>

      <MarketingFooter />
    </div>
  );
}
