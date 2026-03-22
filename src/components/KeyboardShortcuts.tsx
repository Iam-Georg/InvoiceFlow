"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Command } from "lucide-react";

const SHORTCUTS = [
  { key: "N", label: "Neue Rechnung",  href: "/invoices/new" },
  { key: "K", label: "Neuer Kunde",    href: "/customers/new" },
  { key: "D", label: "Dashboard",      href: "/dashboard" },
  { key: "R", label: "Rechnungen",     href: "/invoices" },
  { key: "S", label: "Einstellungen",  href: "/settings" },
];

const STORAGE_KEY = "faktura-shortcuts-enabled";

export default function KeyboardShortcuts() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const inputFocused = useRef(false);

  // Load persisted enabled state
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") setEnabled(true);
  }, []);

  // Track whether an input/textarea/select has focus — most reliable approach
  useEffect(() => {
    function onFocusIn(e: FocusEvent) {
      const el = e.target as HTMLElement | null;
      inputFocused.current =
        !!el &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) ||
          el.isContentEditable);
    }
    function onFocusOut() {
      inputFocused.current = false;
    }
    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("focusout", onFocusOut, true);
    return () => {
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("focusout", onFocusOut, true);
    };
  }, []);

  // Keyboard listener — only active when shortcuts are enabled
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (inputFocused.current) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (!enabled) return;
      if (e.key === "?") {
        setOpen((o) => !o);
        return;
      }
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
  }, [router, enabled]);

  // Listen for open-modal event dispatched by Sidebar
  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("shortcuts:open", onOpen);
    return () => window.removeEventListener("shortcuts:open", onOpen);
  }, []);

  function toggleEnabled() {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    window.dispatchEvent(
      new CustomEvent("shortcuts:changed", { detail: { enabled: next } }),
    );
  }

  if (!open) return null;

  const kbdStyle: React.CSSProperties = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--text-1)",
    fontFamily: "monospace",
    minWidth: "22px",
    textAlign: "center",
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
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
          maxWidth: "380px",
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
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-1)",
              }}
            >
              Tastenkürzel
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "var(--text-3)",
              display: "flex",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Enable / disable toggle */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-1)",
              }}
            >
              Tastenkürzel aktivieren
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-3)",
                marginTop: "2px",
              }}
            >
              {enabled
                ? "Navigationskürzel sind aktiv"
                : "Deaktiviert — kein Einfluss auf Eingabefelder"}
            </p>
          </div>
          <button
            onClick={toggleEnabled}
            role="switch"
            aria-checked={enabled}
            style={{
              flexShrink: 0,
              width: "40px",
              height: "22px",
              borderRadius: "11px",
              background: enabled ? "var(--accent)" : "var(--border)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "background var(--duration-fast) var(--ease-smooth)",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "3px",
                left: enabled ? "21px" : "3px",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#fff",
                transition: "left var(--duration-fast) var(--ease-spring)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </button>
        </div>

        {/* Shortcuts list — only shown when enabled */}
        {enabled && (
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
                <span style={{ fontSize: "13px", color: "var(--text-2)" }}>
                  {label}
                </span>
                <kbd style={kbdStyle}>{key}</kbd>
              </div>
            ))}
            <div
              style={{
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "13px", color: "var(--text-2)" }}>
                Diese Hilfe öffnen / schließen
              </span>
              <span style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <kbd style={kbdStyle}>Shift</kbd>
                <span style={{ fontSize: "10px", color: "var(--text-3)" }}>
                  +
                </span>
                <kbd style={kbdStyle}>ß</kbd>
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: "10px 20px",
            borderTop: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <p style={{ fontSize: "11px", color: "var(--text-3)" }}>
            {enabled
              ? "Funktionieren nicht in Eingabefeldern · Esc zum Schließen"
              : "Aktiviere Tastenkürzel für schnellere Navigation"}
          </p>
        </div>
      </div>
    </div>
  );
}
