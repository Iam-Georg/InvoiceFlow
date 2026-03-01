"use client";

import { useEffect, useState } from "react";
import { getMyFeedback, type Feedback } from "@/lib/feedback";
import { MessageCircle, Bug, Lightbulb, Heart, CheckCircle2, Clock, AlertCircle } from "lucide-react";

function typeIcon(type: Feedback["type"]) {
  if (type === "bug")     return <Bug size={14} />;
  if (type === "feature") return <Lightbulb size={14} />;
  return <Heart size={14} />;
}

function typeLabel(type: Feedback["type"]) {
  if (type === "bug")     return "Bug";
  if (type === "feature") return "Feature-Wunsch";
  return "Lob";
}

function statusColor(status: Feedback["status"]): { bg: string; text: string } {
  if (status === "geloest")        return { bg: "var(--success-bg)",    text: "var(--success)" };
  if (status === "in_bearbeitung") return { bg: "var(--warning-bg)",    text: "var(--warning)" };
  return                                  { bg: "var(--badge-open-bg)", text: "var(--badge-open-text)" };
}

function statusLabel(status: Feedback["status"]) {
  if (status === "geloest")        return "Gelöst";
  if (status === "in_bearbeitung") return "In Bearbeitung";
  return "Offen";
}

function statusIcon(status: Feedback["status"]) {
  if (status === "geloest")        return <CheckCircle2 size={12} />;
  if (status === "in_bearbeitung") return <Clock size={12} />;
  return <AlertCircle size={12} />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function SupportPage() {
  const [tickets, setTickets]   = useState<Feedback[]>([]);
  const [loading, setLoading]   = useState(true);
  const [loadErr, setLoadErr]   = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getMyFeedback()
      .then(setTickets)
      .catch(() => setLoadErr(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-1)", marginBottom: "4px" }}>
          Support & Feedback
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
          Deine eingereichten Tickets und Rückmeldungen.
        </p>
      </div>

      {/* Hinweisbanner */}
      <div
        style={{
          background: "var(--accent-soft)",
          padding: "14px 18px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <MessageCircle size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: "1px" }} />
        <p style={{ fontSize: "13px", color: "var(--accent)", lineHeight: 1.6 }}>
          Nutze den blauen <strong>Feedback-Button</strong> unten rechts, um ein neues Ticket zu erstellen.
          Wir antworten so schnell wie möglich.
        </p>
      </div>

      {/* Ticket-Tabelle */}
      <div className="card-elevated" style={{ overflow: "hidden" }}>

        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 140px 32px",
            padding: "10px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          {["Ticket", "Art", "Status", ""].map((h, i) => (
            <span key={i} className="label-caps">{h}</span>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <div style={{ padding: "56px", display: "flex", justifyContent: "center" }}>
            <span style={{
              width: "18px", height: "18px",
              border: "2px solid var(--border)",
              borderTopColor: "var(--accent)",
              display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }} />
          </div>

        ) : loadErr ? (
          <div style={{ padding: "56px 24px", textAlign: "center" }}>
            <AlertCircle size={28} color="var(--danger)" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)", marginBottom: "6px" }}>
              Tabelle nicht gefunden
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
              Bitte führe zuerst die SQL-Migration in Supabase aus.
            </p>
          </div>

        ) : tickets.length === 0 ? (
          <div style={{ padding: "64px 24px", textAlign: "center" }}>
            <MessageCircle size={28} color="var(--text-3)" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)", marginBottom: "6px" }}>
              Noch keine Tickets
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
              Nutze den Feedback-Button unten rechts, um loszulegen.
            </p>
          </div>

        ) : (
          tickets.map((ticket, i) => {
            const sc      = statusColor(ticket.status);
            const isOpen  = expanded === ticket.id;

            return (
              <div
                key={ticket.id}
                style={{ borderBottom: i < tickets.length - 1 ? "1px solid var(--divider)" : "none" }}
              >
                {/* Row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : ticket.id)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "14px 20px",
                    display: "grid",
                    gridTemplateColumns: "1fr 120px 140px 32px",
                    alignItems: "center",
                    gap: "0",
                    textAlign: "left",
                    transition: `background var(--duration-fast) var(--ease-smooth)`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Titel + Meta */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <div style={{
                      width: "32px", height: "32px",
                      background: "var(--surface-2)",
                      color: "var(--text-2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {typeIcon(ticket.type)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)", lineHeight: 1.3 }}>
                        {ticket.title}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>
                        {formatDate(ticket.created_at)}
                        {ticket.page_context && ` · ${ticket.page_context}`}
                      </p>
                    </div>
                  </div>

                  {/* Type */}
                  <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
                    {typeLabel(ticket.type)}
                  </p>

                  {/* Status */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    padding: "3px 8px",
                    background: sc.bg, color: sc.text,
                    fontSize: "11px", fontWeight: 600,
                    width: "fit-content",
                  }}>
                    {statusIcon(ticket.status)}
                    {statusLabel(ticket.status)}
                  </div>

                  {/* Beantwortet-Dot */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {ticket.admin_reply && (
                      <div
                        style={{ width: "8px", height: "8px", background: "var(--success)" }}
                        title="Beantwortet"
                      />
                    )}
                  </div>
                </button>

                {/* Detail-Expand */}
                {isOpen && (
                  <div
                    style={{
                      padding: "0 20px 20px 64px",
                      animation: "fadeInUp var(--duration-normal) var(--ease-smooth) both",
                    }}
                  >
                    <p style={{
                      fontSize: "13px", color: "var(--text-2)", lineHeight: 1.7,
                      marginBottom: ticket.admin_reply ? "16px" : "0",
                    }}>
                      {ticket.message}
                    </p>

                    {ticket.admin_reply && (
                      <div style={{
                        background: "var(--success-bg)",
                        padding: "12px 16px",
                        borderLeft: "3px solid var(--success)",
                      }}>
                        <p style={{
                          fontSize: "11px", fontWeight: 700, color: "var(--success)",
                          marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em",
                        }}>
                          Antwort vom Team
                        </p>
                        <p style={{ fontSize: "13px", color: "var(--text-1)", lineHeight: 1.7 }}>
                          {ticket.admin_reply}
                        </p>
                        {ticket.replied_at && (
                          <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "6px" }}>
                            {formatDate(ticket.replied_at)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
