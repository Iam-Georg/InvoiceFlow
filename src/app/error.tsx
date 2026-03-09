"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "40px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          background: "var(--destructive-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          fontWeight: 700,
          color: "var(--destructive)",
        }}
      >
        !
      </div>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "var(--foreground)",
        }}
      >
        Etwas ist schiefgelaufen
      </h2>
      <p
        style={{
          fontSize: "13px",
          color: "var(--muted-foreground)",
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
      </p>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={reset} className="btn btn-primary">
          Erneut versuchen
        </button>
        <a href="/" style={{ textDecoration: "none" }}>
          <button className="btn btn-secondary">Zur Startseite</button>
        </a>
      </div>
    </div>
  );
}
