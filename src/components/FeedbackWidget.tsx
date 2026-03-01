"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Bug, Lightbulb, Heart, Send, Check } from "lucide-react";
import { createFeedback, type FeedbackType } from "@/lib/feedback";

type Tab = FeedbackType;

const TABS: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "bug",     label: "Bug",     icon: <Bug size={14} />,       desc: "Etwas funktioniert nicht?" },
  { id: "feature", label: "Feature", icon: <Lightbulb size={14} />, desc: "Eine Idee für Faktura?" },
  { id: "lob",     label: "Lob",     icon: <Heart size={14} />,     desc: "Etwas gefällt dir besonders?" },
];

export default function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("bug");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createFeedback({ type: tab, title: title.trim(), message: message.trim(), page_context: pathname });
      setSuccess(true);
      setTitle("");
      setMessage("");
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 2000);
    } catch {
      setError("Fehler beim Senden. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setSuccess(false);
    setError(null);
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Feedback senden"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 200,
          width: "48px",
          height: "48px",
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-lg)",
          transition: `transform var(--duration-fast) var(--ease-spring), box-shadow var(--duration-fast) var(--ease-smooth)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,64,204,0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "var(--shadow-lg)";
        }}
      >
        <MessageCircle size={20} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(0,0,0,0.3)",
            animation: "fadeIn var(--duration-fast) var(--ease-smooth) both",
          }}
        />
      )}

      {/* Modal */}
      {open && (
        <div
          className="dropdown-enter"
          style={{
            position: "fixed",
            bottom: "88px",
            right: "24px",
            zIndex: 301,
            width: "360px",
            background: "var(--surface)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
            transformOrigin: "bottom right",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 18px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em" }}>
              Feedback senden
            </p>
            <button
              onClick={handleClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-3)",
                display: "flex",
                padding: "2px",
                transition: `color var(--duration-fast) var(--ease-smooth)`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  height: "40px",
                  border: "none",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  fontSize: "12px",
                  fontWeight: tab === t.id ? 700 : 500,
                  color: tab === t.id ? "var(--accent)" : "var(--text-2)",
                  cursor: "pointer",
                  borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                  transition: `color var(--duration-fast) var(--ease-smooth), border-color var(--duration-normal) var(--ease-spring)`,
                }}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Form */}
          {success ? (
            <div
              style={{
                padding: "40px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                animation: "fadeInUp var(--duration-normal) var(--ease-smooth) both",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  background: "var(--success-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={20} color="var(--success)" />
              </div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)" }}>Vielen Dank!</p>
              <p style={{ fontSize: "13px", color: "var(--text-2)", textAlign: "center" }}>
                Dein Feedback wurde gesendet.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "2px" }}>
                {TABS.find((t) => t.id === tab)?.desc}
              </p>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>
                  Titel
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Kurze Zusammenfassung…"
                  required
                  style={{ height: "38px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>
                  Nachricht
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Beschreibe so genau wie möglich…"
                  required
                  rows={4}
                  style={{ minHeight: "90px", resize: "none" }}
                />
              </div>

              {error && (
                <p style={{ fontSize: "12px", color: "var(--danger)" }}>{error}</p>
              )}

              <p style={{ fontSize: "11px", color: "var(--text-3)" }}>
                Seite: <span style={{ fontWeight: 500 }}>{pathname}</span>
              </p>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !title.trim() || !message.trim()}
                style={{ width: "100%", justifyContent: "center", gap: "6px" }}
              >
                {loading ? (
                  <>
                    <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                    Wird gesendet…
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    Absenden
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
