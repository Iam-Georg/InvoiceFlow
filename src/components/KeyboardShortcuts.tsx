"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Command } from "lucide-react";

const SHORTCUTS = [
  { key: "N", label: "Neue Rechnung",  href: "/invoices/new" },
  { key: "K", label: "Neuer Kunde",    href: "/customers/new" },
  { key: "D", label: "Dashboard",      href: "/dashboard" },
  { key: "R", label: "Rechnungen",     href: "/invoices" },
  { key: "S", label: "Einstellungen",  href: "/settings" },
];

export default function KeyboardShortcuts() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key === "?")      { setOpen((o) => !o); return; }

      for (const s of SHORTCUTS) {
        if (e.key.toUpperCase() === s.key) {
          e.preventDefault();
          router.push(s.href);
          return;
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn var(--duration-fast) var(--ease-smooth) both",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          width: "100%",
          maxWidth: "360px",
          margin: "0 16px",
          boxShadow: "var(--shadow-lg)",
          animation: "fadeInUp var(--duration-normal) var(--ease-spring) both",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Command size={14} color="var(--accent)" />
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>
              Tastenkürzel
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "var(--text-3)", display: "flex" }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div style={{ padding: "4px 0" }}>
          {SHORTCUTS.map(({ key, label }) => (
            <div
              key={key}
              style={{
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "13px", color: "var(--text-2)" }}>{label}</span>
              <kbd
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  padding: "2px 8px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--text-1)",
                  fontFamily: "monospace",
                  minWidth: "22px",
                  textAlign: "center",
                }}
              >
                {key}
              </kbd>
            </div>
          ))}
          <div style={{ padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: "var(--text-2)" }}>Diese Hilfe öffnen / schließen</span>
            <span style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <kbd style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "2px 8px", fontSize: "11px", fontWeight: 700, color: "var(--text-1)", fontFamily: "monospace", minWidth: "22px", textAlign: "center" as const }}>
                Shift
              </kbd>
              <span style={{ fontSize: "10px", color: "var(--text-3)" }}>+</span>
              <kbd style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "2px 8px", fontSize: "11px", fontWeight: 700, color: "var(--text-1)", fontFamily: "monospace", minWidth: "22px", textAlign: "center" as const }}>
                ß
              </kbd>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
          <p style={{ fontSize: "11px", color: "var(--text-3)" }}>
            Funktioniert nicht in Eingabefeldern · <kbd style={{ fontFamily: "monospace" }}>Esc</kbd> zum Schließen
          </p>
        </div>
      </div>
    </div>
  );
}
