export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <h1 style={{ fontSize: "22px", fontWeight: 700 }}>404</h1>
      <p style={{ color: "var(--muted-foreground)" }}>Seite nicht gefunden.</p>
      <a href="/dashboard" style={{ color: "var(--primary)", textDecoration: "none" }}>
        Zurueck zum Dashboard
      </a>
    </div>
  )
}
