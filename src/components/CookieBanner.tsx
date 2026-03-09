"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "faktura:cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  function accept(level: "all" | "essential") {
    localStorage.setItem(CONSENT_KEY, level);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        flexWrap: "wrap",
        boxShadow: "0 -2px 20px rgba(0,0,0,0.08)",
      }}
    >
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-2)",
          margin: 0,
          maxWidth: "500px",
        }}
      >
        Wir verwenden Cookies für die Funktionalität und Fehleranalyse.{" "}
        <a
          href="/datenschutz"
          style={{ color: "var(--accent)", textDecoration: "none" }}
        >
          Mehr erfahren
        </a>
      </p>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => accept("essential")}
          className="btn btn-secondary"
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          Nur notwendige
        </button>
        <button
          onClick={() => accept("all")}
          className="btn btn-primary"
          style={{ fontSize: "12px", padding: "6px 14px" }}
        >
          Alle akzeptieren
        </button>
      </div>
    </div>
  );
}
