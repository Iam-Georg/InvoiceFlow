"use client";

// ── DEINE ADMIN USER-ID HIER EINTRAGEN ──────────────────────────────────────
const ADMIN_USER_ID = "1f6663f2-b15c-48ad-bd30-60b434ecfba3";
// ────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  getAllFeedback,
  replyToFeedback,
  type Feedback,
  type FeedbackType,
} from "@/lib/feedback";
import type { Profile } from "@/types";
import {
  FileText,
  Users,
  Lightbulb,
  BarChart3,
  LogOut,
  Bug,
  Heart,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Shield,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type Tab = "tickets" | "nutzer" | "features" | "analytics";

type ProfileWithCount = Profile & { invoice_count?: number };

interface AnalyticsData {
  totalUsers: number;
  newUsersWeek: number;
  newUsersMonth: number;
  totalInvoices: number;
  invoicesThisWeek: number;
  totalRevenue: number;
  planBreakdown: Record<string, number>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function priorityColor(p: Feedback["priority"]) {
  if (p === "kritisch") return "var(--danger)";
  if (p === "hoch") return "var(--warning)";
  return "var(--text-3)";
}

function statusBg(s: Feedback["status"]) {
  if (s === "geloest")
    return { bg: "var(--success-bg)", text: "var(--success)" };
  if (s === "in_bearbeitung")
    return { bg: "var(--warning-bg)", text: "var(--warning)" };
  return { bg: "var(--badge-open-bg)", text: "var(--badge-open-text)" };
}

function typeIcon(t: FeedbackType) {
  if (t === "bug") return <Bug size={13} />;
  if (t === "feature") return <Lightbulb size={13} />;
  return <Heart size={13} />;
}

function planBadge(plan: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    free: { bg: "var(--surface-2)", text: "var(--text-2)" },
    starter: { bg: "var(--accent-soft)", text: "var(--accent)" },
    professional: { bg: "var(--success-bg)", text: "var(--success)" },
    business: { bg: "var(--warning-bg)", text: "var(--warning)" },
  };
  const c = colors[plan] ?? colors.free;
  return (
    <span
      style={{
        padding: "2px 7px",
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        background: c.bg,
        color: c.text,
      }}
    >
      {plan}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const sbRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("tickets");

  // Data
  const [tickets, setTickets] = useState<Feedback[]>([]);
  const [profiles, setProfiles] = useState<ProfileWithCount[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Ticket interaction
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  // Filters
  const [ticketFilter, setTicketFilter] = useState<
    "alle" | FeedbackType | "offen" | "geloest"
  >("alle");

  function getSb() {
    if (!sbRef.current) sbRef.current = createClient();
    return sbRef.current;
  }

  // ── Auth check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await getSb().auth.getUser();
      if (!user || user.id !== ADMIN_USER_ID) {
        router.replace("/dashboard");
        return;
      }
      setAuthed(true);
    }
    checkAdmin();
  }, [router]);

  // ── Load all data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authed) return;

    async function loadAll() {
      const sb = getSb();

      // Tickets
      const feed = await getAllFeedback().catch(() => [] as Feedback[]);
      setTickets(feed);

      // Profiles
      const { data: profs } = await sb
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      const profList = (profs as Profile[] | null) ?? [];

      // Invoice counts per user
      const { data: invData } = await sb.from("invoices").select("user_id");
      const invCounts = new Map<string, number>();
      for (const inv of invData ?? []) {
        invCounts.set(inv.user_id, (invCounts.get(inv.user_id) ?? 0) + 1);
      }

      setProfiles(
        profList.map((p) => ({
          ...p,
          invoice_count: invCounts.get(p.id) ?? 0,
        })),
      );

      // Analytics
      const now = new Date();
      const weekAgo = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const monthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
      ).toISOString();

      const { data: allInvoices } = await sb
        .from("invoices")
        .select("user_id, created_at, total");
      const invList = allInvoices ?? [];

      const planBreakdown: Record<string, number> = {};
      for (const p of profList) {
        planBreakdown[p.plan] = (planBreakdown[p.plan] ?? 0) + 1;
      }

      setAnalytics({
        totalUsers: profList.length,
        newUsersWeek: profList.filter((p) => p.created_at >= weekAgo).length,
        newUsersMonth: profList.filter((p) => p.created_at >= monthAgo).length,
        totalInvoices: invList.length,
        invoicesThisWeek: invList.filter((i) => i.created_at >= weekAgo).length,
        totalRevenue: invList.reduce(
          (s: number, i: { total?: number }) => s + (i.total ?? 0),
          0,
        ),
        planBreakdown,
      });

      setLoading(false);
    }

    loadAll();
  }, [authed]);

  async function handleReply(ticketId: string) {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await replyToFeedback(ticketId, replyText.trim());
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                admin_reply: replyText.trim(),
                status: "geloest",
                replied_at: new Date().toISOString(),
              }
            : t,
        ),
      );
      setReplyText("");
      setExpanded(null);
    } finally {
      setReplying(false);
    }
  }

  async function handleLogout() {
    await getSb().auth.signOut();
    router.push("/login");
  }

  // ── Loading / Auth guard ───────────────────────────────────────────────────
  if (authed === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <span
          style={{
            width: "20px",
            height: "20px",
            border: "2px solid var(--border)",
            borderTopColor: "var(--accent)",
            display: "inline-block",
            animation: "spin 0.7s linear infinite",
          }}
        />
      </div>
    );
  }

  // ── Filtered tickets ───────────────────────────────────────────────────────
  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === "alle") return true;
    if (ticketFilter === "offen") return t.status === "offen";
    if (ticketFilter === "geloest") return t.status === "geloest";
    return t.type === ticketFilter;
  });

  // ── Feature requests grouped ───────────────────────────────────────────────
  const featureTickets = tickets.filter((t) => t.type === "feature");

  // Group by similar title (simple: exact match lowercased)
  const featureMap = new Map<string, { ticket: Feedback; count: number }>();
  for (const t of featureTickets) {
    const key = t.title.toLowerCase().trim();
    const existing = featureMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      featureMap.set(key, { ticket: t, count: 1 });
    }
  }
  const groupedFeatures = Array.from(featureMap.values()).sort(
    (a, b) => b.count - a.count,
  );

  // ── Profile lookup map ─────────────────────────────────────────────────────
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "var(--shadow-topbar)",
          height: "52px",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Shield size={16} color="var(--accent)" />
          <span
            style={{
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-1)",
            }}
          >
            Admin Panel
          </span>
          <span
            style={{
              padding: "2px 7px",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              background: "var(--danger-bg)",
              color: "var(--danger)",
            }}
          >
            Intern
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Tabs */}
        {(
          [
            {
              id: "tickets",
              label: "Tickets",
              icon: <AlertCircle size={13} />,
            },
            { id: "nutzer", label: "Nutzer", icon: <Users size={13} /> },
            {
              id: "features",
              label: "Feature Requests",
              icon: <Lightbulb size={13} />,
            },
            {
              id: "analytics",
              label: "Analytics",
              icon: <BarChart3 size={13} />,
            },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              height: "52px",
              padding: "0 12px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? "var(--accent)" : "var(--text-2)",
              borderBottom:
                tab === t.id
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
              transition: `color var(--duration-fast) var(--ease-smooth), border-color var(--duration-normal) var(--ease-spring)`,
            }}
          >
            {t.icon}
            {t.label}
            {t.id === "tickets" &&
              tickets.filter((x) => x.status === "offen").length > 0 && (
                <span
                  style={{
                    padding: "1px 5px",
                    fontSize: "10px",
                    fontWeight: 700,
                    background: "var(--danger-bg)",
                    color: "var(--danger)",
                    marginLeft: "2px",
                  }}
                >
                  {tickets.filter((x) => x.status === "offen").length}
                </span>
              )}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "13px",
            color: "var(--text-2)",
            padding: "4px 8px",
            transition: `color var(--duration-fast) var(--ease-smooth)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--danger)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-2)";
          }}
        >
          <LogOut size={14} />
          Abmelden
        </button>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 32px" }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "80px",
            }}
          >
            <span
              style={{
                width: "24px",
                height: "24px",
                border: "2px solid var(--border)",
                borderTopColor: "var(--accent)",
                display: "inline-block",
                animation: "spin 0.7s linear infinite",
              }}
            />
          </div>
        ) : (
          <div className="anim-fade-in-up">
            {/* ── TAB 1: TICKETS ────────────────────────────────────────── */}
            {tab === "tickets" && (
              <div>
                {/* Filter */}
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  {(
                    [
                      "alle",
                      "bug",
                      "feature",
                      "lob",
                      "offen",
                      "geloest",
                    ] as const
                  ).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTicketFilter(f)}
                      style={{
                        padding: "5px 12px",
                        border: "1px solid var(--border)",
                        background:
                          ticketFilter === f
                            ? "var(--accent)"
                            : "var(--surface)",
                        color: ticketFilter === f ? "#fff" : "var(--text-2)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        textTransform: "capitalize",
                        transition: `background var(--duration-fast) var(--ease-smooth), color var(--duration-fast) var(--ease-smooth)`,
                      }}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                      {f === "offen" &&
                        ` (${tickets.filter((t) => t.status === "offen").length})`}
                    </button>
                  ))}
                </div>

                <div className="card-elevated" style={{ overflow: "hidden" }}>
                  {/* Header */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "32px 1fr 140px 120px 100px 100px",
                      padding: "10px 20px",
                      borderBottom: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      gap: "12px",
                    }}
                  >
                    {[
                      "",
                      "Ticket",
                      "Nutzer",
                      "Seite",
                      "Priorität",
                      "Status",
                    ].map((h, i) => (
                      <span key={i} className="label-caps">
                        {h}
                      </span>
                    ))}
                  </div>

                  {filteredTickets.length === 0 ? (
                    <div style={{ padding: "48px", textAlign: "center" }}>
                      <p style={{ fontSize: "14px", color: "var(--text-2)" }}>
                        Keine Tickets gefunden.
                      </p>
                    </div>
                  ) : (
                    filteredTickets.map((ticket, i) => {
                      const sc = statusBg(ticket.status);
                      const profile = profileMap.get(ticket.user_id);
                      const isOpen = expanded === ticket.id;

                      return (
                        <div
                          key={ticket.id}
                          style={{
                            borderBottom:
                              i < filteredTickets.length - 1
                                ? "1px solid var(--divider)"
                                : "none",
                          }}
                        >
                          <button
                            onClick={() => {
                              setExpanded(isOpen ? null : ticket.id);
                              setReplyText("");
                            }}
                            style={{
                              width: "100%",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: "14px 20px",
                              display: "grid",
                              gridTemplateColumns:
                                "32px 1fr 140px 120px 100px 100px",
                              alignItems: "center",
                              gap: "12px",
                              textAlign: "left",
                              transition: `background var(--duration-fast) var(--ease-smooth)`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "var(--surface-2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            {/* Icon */}
                            <div
                              style={{
                                color: "var(--text-2)",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {typeIcon(ticket.type)}
                            </div>

                            {/* Title + date */}
                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  color: "var(--text-1)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {ticket.title}
                              </p>
                              <p
                                style={{
                                  fontSize: "11px",
                                  color: "var(--text-3)",
                                  marginTop: "2px",
                                }}
                              >
                                {formatDate(ticket.created_at)}
                              </p>
                            </div>

                            {/* User */}
                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "var(--text-1)",
                                  fontWeight: 500,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {profile?.full_name ||
                                  profile?.email ||
                                  ticket.user_id.slice(0, 8) + "…"}
                              </p>
                              {profile && planBadge(profile.plan)}
                            </div>

                            {/* Seite */}
                            <p
                              style={{
                                fontSize: "11px",
                                color: "var(--text-3)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {ticket.page_context || "–"}
                            </p>

                            {/* Priorität */}
                            <p
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: priorityColor(ticket.priority),
                                textTransform: "capitalize",
                              }}
                            >
                              {ticket.priority}
                            </p>

                            {/* Status */}
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "3px 7px",
                                background: sc.bg,
                                color: sc.text,
                                fontSize: "11px",
                                fontWeight: 600,
                                width: "fit-content",
                              }}
                            >
                              {ticket.status === "geloest" ? (
                                <CheckCircle2 size={11} />
                              ) : ticket.status === "in_bearbeitung" ? (
                                <Clock size={11} />
                              ) : (
                                <AlertCircle size={11} />
                              )}
                              {ticket.status === "geloest"
                                ? "Gelöst"
                                : ticket.status === "in_bearbeitung"
                                  ? "In Bearb."
                                  : "Offen"}
                            </div>
                          </button>

                          {/* Expand */}
                          {isOpen && (
                            <div
                              style={{
                                padding: "16px 20px 20px 64px",
                                borderTop: "1px solid var(--divider)",
                                animation:
                                  "fadeInUp var(--duration-normal) var(--ease-smooth) both",
                              }}
                            >
                              <p
                                style={{
                                  fontSize: "13px",
                                  color: "var(--text-2)",
                                  lineHeight: 1.7,
                                  marginBottom: "16px",
                                }}
                              >
                                {ticket.message}
                              </p>

                              {ticket.admin_reply && (
                                <div
                                  style={{
                                    background: "var(--success-bg)",
                                    padding: "10px 14px",
                                    borderLeft: "3px solid var(--success)",
                                    marginBottom: "16px",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      color: "var(--success)",
                                      marginBottom: "4px",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.06em",
                                    }}
                                  >
                                    Deine Antwort (
                                    {formatDate(ticket.replied_at!)})
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "13px",
                                      color: "var(--text-1)",
                                    }}
                                  >
                                    {ticket.admin_reply}
                                  </p>
                                </div>
                              )}

                              {ticket.status !== "geloest" && (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    alignItems: "flex-end",
                                  }}
                                >
                                  <div style={{ flex: 1 }}>
                                    <label
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: "var(--text-3)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                        display: "block",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      Antwort an Nutzer
                                    </label>
                                    <textarea
                                      value={replyText}
                                      onChange={(e) =>
                                        setReplyText(e.target.value)
                                      }
                                      placeholder="Deine Antwort…"
                                      rows={3}
                                      style={{
                                        resize: "none",
                                        minHeight: "80px",
                                      }}
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleReply(ticket.id)}
                                    disabled={replying || !replyText.trim()}
                                    className="btn btn-primary"
                                    style={{ flexShrink: 0, gap: "6px" }}
                                  >
                                    <Send size={13} />
                                    {replying ? "Senden…" : "Antworten"}
                                  </button>
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
            )}

            {/* ── TAB 2: NUTZER ─────────────────────────────────────────── */}
            {tab === "nutzer" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
                    {profiles.length} registrierte Nutzer
                  </p>
                </div>

                <div className="card-elevated" style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 160px 80px 100px 100px",
                      padding: "10px 20px",
                      borderBottom: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      gap: "12px",
                    }}
                  >
                    {[
                      "Name / E-Mail",
                      "Unternehmen",
                      "Plan",
                      "Rechnungen",
                      "Registriert",
                    ].map((h, i) => (
                      <span key={i} className="label-caps">
                        {h}
                      </span>
                    ))}
                  </div>

                  {profiles.map((profile, i) => (
                    <div
                      key={profile.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 160px 80px 100px 100px",
                        padding: "14px 20px",
                        gap: "12px",
                        alignItems: "center",
                        borderBottom:
                          i < profiles.length - 1
                            ? "1px solid var(--divider)"
                            : "none",
                        transition: `background var(--duration-fast) var(--ease-smooth)`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--surface-2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--text-1)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {profile.full_name || "–"}
                        </p>
                        <p
                          style={{
                            fontSize: "11px",
                            color: "var(--text-3)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {profile.email}
                        </p>
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-2)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {profile.company_name || "–"}
                      </p>
                      {planBadge(profile.plan)}
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--text-1)",
                        }}
                      >
                        {profile.invoice_count ?? 0}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-3)" }}>
                        {formatDate(profile.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 3: FEATURE REQUESTS ───────────────────────────────── */}
            {tab === "features" && (
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-2)",
                    marginBottom: "16px",
                  }}
                >
                  {featureTickets.length} Feature-Wünsche ·{" "}
                  {groupedFeatures.length} einzigartig
                </p>

                <div className="card-elevated" style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px 1fr 1fr 80px",
                      padding: "10px 20px",
                      borderBottom: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      gap: "12px",
                    }}
                  >
                    {["#", "Feature", "Nachricht", "Häufigkeit"].map((h, i) => (
                      <span key={i} className="label-caps">
                        {h}
                      </span>
                    ))}
                  </div>

                  {groupedFeatures.length === 0 ? (
                    <div style={{ padding: "48px", textAlign: "center" }}>
                      <p style={{ fontSize: "14px", color: "var(--text-2)" }}>
                        Noch keine Feature-Wünsche.
                      </p>
                    </div>
                  ) : (
                    groupedFeatures.map(({ ticket, count }, i) => (
                      <div
                        key={ticket.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "40px 1fr 1fr 80px",
                          padding: "14px 20px",
                          gap: "12px",
                          alignItems: "center",
                          borderBottom:
                            i < groupedFeatures.length - 1
                              ? "1px solid var(--divider)"
                              : "none",
                          transition: `background var(--duration-fast) var(--ease-smooth)`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--surface-2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "var(--text-3)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--text-1)",
                          }}
                        >
                          {ticket.title}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--text-2)",
                            lineHeight: 1.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical" as const,
                          }}
                        >
                          {ticket.message}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <div
                            style={{
                              height: "6px",
                              width: `${Math.round((count / Math.max(...groupedFeatures.map((f) => f.count))) * 60)}px`,
                              minWidth: "8px",
                              background: "var(--accent)",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "var(--accent)",
                            }}
                          >
                            {count}×
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 4: ANALYTICS ──────────────────────────────────────── */}
            {tab === "analytics" && analytics && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* Stats Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {[
                    {
                      label: "Nutzer gesamt",
                      value: analytics.totalUsers,
                      sub: "registriert",
                      icon: <Users size={16} />,
                      color: "var(--accent)",
                      bg: "var(--accent-soft)",
                    },
                    {
                      label: "Neue Nutzer (Woche)",
                      value: analytics.newUsersWeek,
                      sub: "letzte 7 Tage",
                      icon: <Users size={16} />,
                      color: "var(--success)",
                      bg: "var(--success-bg)",
                    },
                    {
                      label: "Neue Nutzer (Monat)",
                      value: analytics.newUsersMonth,
                      sub: "letzte 30 Tage",
                      icon: <Users size={16} />,
                      color: "var(--warning)",
                      bg: "var(--warning-bg)",
                    },
                    {
                      label: "Rechnungen gesamt",
                      value: analytics.totalInvoices,
                      sub: "alle Rechnungen",
                      icon: <FileText size={16} />,
                      color: "var(--accent)",
                      bg: "var(--accent-soft)",
                    },
                    {
                      label: "Rechnungen (Woche)",
                      value: analytics.invoicesThisWeek,
                      sub: "letzte 7 Tage",
                      icon: <FileText size={16} />,
                      color: "var(--success)",
                      bg: "var(--success-bg)",
                    },
                    {
                      label: "Tickets offen",
                      value: tickets.filter((t) => t.status === "offen").length,
                      sub: "ausstehend",
                      icon: <AlertCircle size={16} />,
                      color: "var(--danger)",
                      bg: "var(--danger-bg)",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="card-elevated card-hover anim-fade-in-up"
                      style={{ padding: "20px", animationDelay: `${i * 60}ms` }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "12px",
                        }}
                      >
                        <p className="label-caps">{s.label}</p>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            background: s.bg,
                            color: s.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {s.icon}
                        </div>
                      </div>
                      <p
                        style={{
                          fontSize: "28px",
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                          color: "var(--text-1)",
                          lineHeight: 1.1,
                          marginBottom: "4px",
                        }}
                      >
                        {s.value}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-3)" }}>
                        {s.sub}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Plan Breakdown */}
                <div className="card-elevated" style={{ padding: "24px" }}>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--text-1)",
                      marginBottom: "20px",
                    }}
                  >
                    Plan-Verteilung
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {Object.entries(analytics.planBreakdown)
                      .sort((a, b) => b[1] - a[1])
                      .map(([plan, count]) => (
                        <div
                          key={plan}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          {planBadge(plan)}
                          <div
                            style={{
                              flex: 1,
                              height: "6px",
                              background: "var(--surface-2)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${Math.round((count / analytics.totalUsers) * 100)}%`,
                                background: "var(--accent)",
                                transition: `width var(--duration-slow) var(--ease-smooth)`,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "var(--text-1)",
                              minWidth: "32px",
                              textAlign: "right",
                            }}
                          >
                            {count}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--text-3)",
                              minWidth: "36px",
                            }}
                          >
                            ({Math.round((count / analytics.totalUsers) * 100)}
                            %)
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
