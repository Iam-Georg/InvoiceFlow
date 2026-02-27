export default function DashboardLoading() {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div style={{ height: "42px", background: "var(--muted)", borderRadius: "var(--radius)" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        <div style={{ height: "120px", background: "var(--muted)", borderRadius: "var(--radius)" }} />
        <div style={{ height: "120px", background: "var(--muted)", borderRadius: "var(--radius)" }} />
        <div style={{ height: "120px", background: "var(--muted)", borderRadius: "var(--radius)" }} />
      </div>
    </div>
  )
}
