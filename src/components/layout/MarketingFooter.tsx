import Link from "next/link";
import { FileText } from "lucide-react";

const PRODUKT_LINKS = [
  { href: "/funktionen", label: "Funktionen" },
  { href: "/preise", label: "Preise" },
  { href: "/login", label: "Anmelden" },
  { href: "/register", label: "Registrieren" },
];

const UNTERNEHMEN_LINKS = [{ href: "/ueber-uns", label: "Über uns" }];

const RECHTLICHES_LINKS = [
  { href: "/agb", label: "AGB" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/impressum", label: "Impressum" },
];

export default function MarketingFooter() {
  return (
    <footer style={{ background: "#0B1628" }}>
      {/* 4-column grid */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "64px 40px 48px",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: "48px",
          alignItems: "start",
        }}
      >
        {/* Brand column */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={13} color="#fff" />
            </div>
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              Faktura
            </span>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.7,
              maxWidth: "260px",
              marginBottom: "20px",
            }}
          >
            Rechnungstool für Freelancer und Selbstständige in Deutschland.
            Klar. Schnell. Sicher.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 10px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Made in Germany
            </span>
          </div>
        </div>

        {/* Produkt column */}
        <div>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
              marginBottom: "16px",
            }}
          >
            Produkt
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            {PRODUKT_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Unternehmen column */}
        <div>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
              marginBottom: "16px",
            }}
          >
            Unternehmen
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            {UNTERNEHMEN_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Rechtliches column */}
        <div>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
              marginBottom: "16px",
            }}
          >
            Rechtliches
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            {RECHTLICHES_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright strip */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "16px 40px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
            &copy; {new Date().getFullYear()} Faktura. Alle Rechte vorbehalten.
          </p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
            DSGVO-konform &middot; Server in der EU
          </p>
        </div>
      </div>
    </footer>
  );
}
