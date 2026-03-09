"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html lang="de">
      <body
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "8px",
              color: "#111",
            }}
          >
            Kritischer Fehler
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "20px",
            }}
          >
            Die Anwendung konnte nicht geladen werden.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: 600,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
