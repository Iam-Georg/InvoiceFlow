"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
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
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "var(--foreground)",
        }}
      >
        Fehler im Dashboard
      </h2>
      <p
        style={{
          fontSize: "13px",
          color: "var(--muted-foreground)",
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        Ein Fehler ist aufgetreten. Deine Daten sind sicher.
      </p>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={reset} className="btn btn-primary">
          Erneut versuchen
        </button>
        <a href="/dashboard" style={{ textDecoration: "none" }}>
          <button className="btn btn-secondary">Zum Dashboard</button>
        </a>
      </div>
    </div>
  );
}
