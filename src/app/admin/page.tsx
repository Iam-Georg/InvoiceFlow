"use client";

// ── ADMIN USER-ID ─────────────────────────────────────────────────────────────
const ADMIN_USER_ID = "1f6663f2-b15c-48ad-bd30-60b434ecfba3";
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  getAllFeedback,
  replyToFeedback,
  updateFeedbackStatus,
  type Feedback,
  type FeedbackType,
  type FeedbackStatus,
} from "@/lib/feedback";
import type { Profile, SubscriptionPlan } from "@/types";
import {
  LayoutDashboard,
  Users,
  Euro,
  AlertCircle,
  Lightbulb,
  LogOut,
  Shield,
  TrendingUp,
  CheckCircle2,
  Clock,
  Bug,
  Heart,
  Send,
  ChevronUp,
  ChevronDown,
  Search,
  ArrowLeft,
  Crown,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

const PLAN_PRICE: Record<string, number> = {
  free: 0,
  starter: 9,
  professional: 19,
  business: 39,
};

const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
  free: { bg: "var(--surface-2)", text: "var(--text-2)" },
  starter: { bg: "var(--accent-soft)", text: "var(--accent)" },
  professional: { bg: "var(--success-bg)", text: "var(--success)" },
  business: { bg: "var(--warning-bg)", text: "var(--warning)" },
};

type Tab = "overview" | "nutzer" | "einnahmen" | "tickets" | "features";
type PlanFilter = "alle" | "free" | "starter" | "professional" | "business";
type SortKey = "name" | "company" | "plan" | "invoices" | "created";
type SortDir = "asc" | "desc";

type ProfileWithCount = Profile & { invoice_count: number };

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtMonth(date: Date) {
  return date.toLocaleDateString("de-DE", { month: "short", year: "numeric" });
}

function calcMRR(profiles: Profile[]): number {
  return profiles.reduce((s, p) => s + (PLAN_PRICE[p.plan] ?? 0), 0);
}

function PlanBadge({ plan }: { plan: string }) {
  const c = PLAN_COLORS[plan] ?? PLAN_COLORS.free;
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
        whiteSpace: "nowrap",
      }}
    >
      {plan}
    </span>
  );
}

function PlanChanger({
  profile: p,
  isOpen,
  isChanging,
  onToggle,
  onClose,
  onChange,
}: {
  profile: ProfileWithCount;
  isOpen: boolean;
  isChanging: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChange: (plan: SubscriptionPlan) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [isOpen]);

  return (
    <div>
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        disabled={isChanging}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          transition: "transform var(--duration-fast) var(--ease-spring)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
      >
        <PlanBadge plan={p.plan} />
        {isChanging ? (
          <span
            style={{
              width: 10, height: 10,
              border: "2px solid var(--border)",
              borderTopColor: "var(--accent)",
              display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }}
          />
        ) : (
          <ChevronDown
            size={10}
            style={{
              color: "var(--text-3)",
              transition: "transform var(--duration-fast) var(--ease-spring)",
              transform: isOpen ? "rotate(180deg)" : "",
            }}
          />
        )}
      </button>

      {isOpen && dropdownPos && (
        <>
          <div
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 999 }}
          />
          <div
            className="dropdown-enter"
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              zIndex: 1000,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
              minWidth: "160px",
              overflow: "hidden",
            }}
          >
            {(["free", "starter", "professional", "business"] as const).map((plan) => {
              const isActive = p.plan === plan;
              const c = PLAN_COLORS[plan];
              return (
                <button
                  key={plan}
                  onClick={(e) => { e.stopPropagation(); if (!isActive) onChange(plan); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "9px 14px",
                    border: "none",
                    background: isActive ? "var(--accent-soft)" : "transparent",
                    cursor: isActive ? "default" : "pointer",
                    fontSize: "12px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--accent)" : "var(--text-1)",
                    textAlign: "left",
                    transition: "background var(--duration-fast) var(--ease-smooth)",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--surface-2)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: 8, height: 8, background: c.text, flexShrink: 0 }} />
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--text-3)" }}>
                    {PLAN_PRICE[plan] === 0 ? "Gratis" : `${PLAN_PRICE[plan]} €`}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
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

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const sbRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  // Data
  const [profiles, setProfiles] = useState<ProfileWithCount[]>([]);
  const [tickets, setTickets] = useState<Feedback[]>([]);

  // Nutzer tab
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("alle");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "created",
    dir: "desc",
  });

  // Tickets tab
  const [ticketFilter, setTicketFilter] = useState<
    "alle" | FeedbackType | "offen" | "geloest"
  >("alle");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  function getSb() {
    if (!sbRef.current) sbRef.current = createClient();
    return sbRef.current;
  }

  // ── Auth check ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function check() {
      const {
        data: { user },
      } = await getSb().auth.getUser();
      if (!user || user.id !== ADMIN_USER_ID) {
        router.replace("/dashboard");
        return;
      }
      setAuthed(true);
    }
    check();
  }, [router]);

  // ── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authed) return;
    async function load() {
      const sb = getSb();
      const [feedbackResult, profilesResult, invoicesResult] =
        await Promise.all([
          getAllFeedback().catch(() => [] as Feedback[]),
          sb
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false }),
          // Privacy: only user_id + created_at — no invoice contents or totals
          sb.from("invoices").select("user_id, created_at"),
        ]);

      const profList = (profilesResult.data as Profile[] | null) ?? [];
      const invData = invoicesResult.data ?? [];

      const invCounts = new Map<string, number>();
      for (const inv of invData) {
        invCounts.set(inv.user_id, (invCounts.get(inv.user_id) ?? 0) + 1);
      }

      setProfiles(
        profList.map((p) => ({ ...p, invoice_count: invCounts.get(p.id) ?? 0 })),
      );
      setTickets(feedbackResult);
      setLoading(false);
    }
    load();
  }, [authed]);

  // ── Derived: Revenue ─────────────────────────────────────────────────────
  const mrr = useMemo(() => calcMRR(profiles), [profiles]);
  const arr = mrr * 12;
  const paidUsers = profiles.filter((p) => p.plan !== "free").length;
  const conversionRate =
    profiles.length > 0
      ? Math.round((paidUsers / profiles.length) * 100)
      : 0;

  const now = useMemo(() => new Date(), []);
  const weekAgo = useMemo(
    () => new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    [now],
  );
  const monthAgo = useMemo(
    () =>
      new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString(),
    [now],
  );

  const newUsersWeek = profiles.filter((p) => p.created_at >= weekAgo).length;
  const newUsersMonth = profiles.filter(
    (p) => p.created_at >= monthAgo,
  ).length;

  const planBreakdown = useMemo(() => {
    const result: Record<string, { count: number; revenue: number }> = {};
    for (const p of profiles) {
      result[p.plan] = result[p.plan] ?? { count: 0, revenue: 0 };
      result[p.plan].count++;
      result[p.plan].revenue += PLAN_PRICE[p.plan] ?? 0;
    }
    return result;
  }, [profiles]);

  // Tax (Umsatzsteuer 19% — prices treated as Brutto incl. USt)
  const monthlyBrutto = mrr;
  const monthlyNetto = monthlyBrutto / 1.19;
  const monthlyUst = monthlyBrutto - monthlyNetto;
  const yearlyBrutto = arr;
  const yearlyNetto = yearlyBrutto / 1.19;
  const yearlyUst = yearlyBrutto - yearlyNetto;

  const monthlyRows = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        date: new Date(now.getFullYear(), now.getMonth() - (11 - i), 1),
        brutto: mrr,
        netto: mrr / 1.19,
        ust: mrr - mrr / 1.19,
      })),
    [mrr, now],
  );

  const quarters = useMemo(
    () =>
      [1, 2, 3, 4].map((q) => ({
        label: `Q${q} ${now.getFullYear()}`,
        brutto: monthlyBrutto * 3,
        ust: monthlyUst * 3,
      })),
    [monthlyBrutto, monthlyUst, now],
  );

  // ── Derived: Nutzer ──────────────────────────────────────────────────────
  const filteredProfiles = useMemo(() => {
    let list: ProfileWithCount[] = profiles;
    if (planFilter !== "alle") list = list.filter((p) => p.plan === planFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.full_name ?? "").toLowerCase().includes(q) ||
          (p.email ?? "").toLowerCase().includes(q) ||
          (p.company_name ?? "").toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      let va: string | number, vb: string | number;
      switch (sort.key) {
        case "name":
          va = a.full_name ?? "";
          vb = b.full_name ?? "";
          break;
        case "company":
          va = a.company_name ?? "";
          vb = b.company_name ?? "";
          break;
        case "plan":
          va = PLAN_PRICE[a.plan] ?? 0;
          vb = PLAN_PRICE[b.plan] ?? 0;
          break;
        case "invoices":
          va = a.invoice_count;
          vb = b.invoice_count;
          break;
        case "created":
          va = a.created_at;
          vb = b.created_at;
          break;
        default:
          return 0;
      }
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [profiles, planFilter, search, sort]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  // ── Derived: Tickets ─────────────────────────────────────────────────────
  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === "alle") return true;
    if (ticketFilter === "offen") return t.status === "offen";
    if (ticketFilter === "geloest") return t.status === "geloest";
    return t.type === ticketFilter;
  });

  const featureTickets = tickets.filter((t) => t.type === "feature");
  const featureMap = new Map<string, { ticket: Feedback; count: number }>();
  for (const t of featureTickets) {
    const key = t.title.toLowerCase().trim();
    const ex = featureMap.get(key);
    if (ex) ex.count++;
    else featureMap.set(key, { ticket: t, count: 1 });
  }
  const groupedFeatures = [...featureMap.values()].sort(
    (a, b) => b.count - a.count,
  );

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const openTickets = tickets.filter((t) => t.status === "offen").length;

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

  // ── Plan change ─────────────────────────────────────────────────────────
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [planDropdownOpen, setPlanDropdownOpen] = useState<string | null>(null);

  const handlePlanChange = useCallback(async (userId: string, newPlan: SubscriptionPlan) => {
    setChangingPlan(userId);
    try {
      const { error } = await getSb()
        .from("profiles")
        .update({ plan: newPlan })
        .eq("id", userId);
      if (!error) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === userId ? { ...p, plan: newPlan } : p)),
        );
      }
    } finally {
      setChangingPlan(null);
      setPlanDropdownOpen(null);
    }
  }, []);

  // ── Ticket status change ────────────────────────────────────────────────
  const handleTicketStatus = useCallback(async (ticketId: string, status: FeedbackStatus) => {
    try {
      await updateFeedbackStatus(ticketId, status);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status } : t)),
      );
    } catch {
      // silently fail
    }
  }, []);

  // ── Sliding indicator (MarketingHeader style) ─────────────────────────
  const tabNavRef = useRef<HTMLDivElement>(null);
  const tabItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [tabIndicator, setTabIndicator] = useState<{ left: number; width: number; opacity: number }>({ left: 0, width: 0, opacity: 0 });
  const activeTabPos = useRef<{ left: number; width: number } | null>(null);

  function measureTab(index: number) {
    const el = tabItemRefs.current[index];
    if (!el || !tabNavRef.current) return null;
    const navRect = tabNavRef.current.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();
    return { left: itemRect.left - navRect.left, width: itemRect.width };
  }

  const TABS_LIST: {
    id: Tab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={13} /> },
    { id: "nutzer", label: "Nutzer", icon: <Users size={13} />, badge: profiles.length },
    { id: "einnahmen", label: "Einnahmen", icon: <Euro size={13} /> },
    { id: "tickets", label: "Tickets", icon: <AlertCircle size={13} />, badge: openTickets },
    { id: "features", label: "Features", icon: <Lightbulb size={13} /> },
  ];

  // Sync indicator with active tab
  useEffect(() => {
    const activeIndex = TABS_LIST.findIndex((t) => t.id === tab);
    if (activeIndex >= 0) {
      const pos = measureTab(activeIndex);
      if (pos) {
        activeTabPos.current = pos;
        setTabIndicator({ ...pos, opacity: 1 });
      }
    }
  }, [tab, loading]);

  function handleTabHover(index: number) {
    const pos = measureTab(index);
    if (pos) setTabIndicator({ ...pos, opacity: 1 });
  }

  function handleTabLeave() {
    if (activeTabPos.current) {
      setTabIndicator({ ...activeTabPos.current, opacity: 1 });
    } else {
      setTabIndicator((prev) => ({ ...prev, opacity: 0 }));
    }
  }

  // ── Loading/Auth guard ───────────────────────────────────────────────────
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
            width: 20,
            height: 20,
            border: "2px solid var(--border)",
            borderTopColor: "var(--accent)",
            display: "inline-block",
            animation: "spin 0.7s linear infinite",
          }}
        />
      </div>
    );
  }

  // ── Sort header button ───────────────────────────────────────────────────
  function SortHeader({
    label,
    sortKey,
  }: {
    label: string;
    sortKey: SortKey;
  }) {
    const active = sort.key === sortKey;
    return (
      <button
        onClick={() => toggleSort(sortKey)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: "3px",
          color: active ? "var(--accent)" : "var(--text-3)",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
        {active ? (
          sort.dir === "asc" ? (
            <ChevronUp size={10} />
          ) : (
            <ChevronDown size={10} />
          )
        ) : (
          <ChevronDown size={10} style={{ opacity: 0.3 }} />
        )}
      </button>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
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
          gap: "4px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginRight: "20px",
          }}
        >
          <Shield size={15} color="var(--accent)" />
          <span
            style={{
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-1)",
            }}
          >
            Admin
          </span>
          <span
            style={{
              padding: "2px 6px",
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

        {/* Tabs with sliding indicator */}
        <div
          ref={tabNavRef}
          style={{ display: "flex", position: "relative" }}
          onMouseLeave={handleTabLeave}
        >
          {/* Sliding indicator */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: tabIndicator.left,
              width: tabIndicator.width,
              height: "2px",
              background: "var(--accent)",
              boxShadow: "0 1px 8px var(--accent-soft)",
              opacity: tabIndicator.opacity,
              pointerEvents: "none",
              transition: `left var(--duration-normal) var(--ease-spring), width var(--duration-normal) var(--ease-spring), opacity var(--duration-fast) var(--ease-smooth)`,
            }}
          />

          {TABS_LIST.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => { tabItemRefs.current[i] = el; }}
              onClick={() => setTab(t.id)}
              onMouseEnter={() => handleTabHover(i)}
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
                color: tab === t.id ? "var(--text-1)" : "var(--text-2)",
                transition:
                  "color var(--duration-fast) var(--ease-smooth)",
              }}
            >
              {t.icon}
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span
                  style={{
                    padding: "1px 5px",
                    fontSize: "10px",
                    fontWeight: 700,
                    background:
                      t.id === "tickets"
                        ? "var(--danger-bg)"
                        : "var(--accent-soft)",
                    color:
                      t.id === "tickets" ? "var(--danger)" : "var(--accent)",
                  }}
                >
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => router.push("/dashboard")}
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
            transition: "color var(--duration-fast) var(--ease-smooth), transform var(--duration-fast) var(--ease-spring)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-2)";
          }}
        >
          <ArrowLeft size={14} />
          Dashboard
        </button>

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
            transition: "color var(--duration-fast) var(--ease-smooth), transform var(--duration-fast) var(--ease-spring)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--danger)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-2)";
            e.currentTarget.style.transform = "";
          }}
        >
          <LogOut size={14} />
          Abmelden
        </button>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 32px" }}>
        {loading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: "80px" }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                border: "2px solid var(--border)",
                borderTopColor: "var(--accent)",
                display: "inline-block",
                animation: "spin 0.7s linear infinite",
              }}
            />
          </div>
        ) : (
          <div className="anim-fade-in-up">

            {/* ══════════════════════════════════════════
                TAB 1 — OVERVIEW
            ══════════════════════════════════════════ */}
            {tab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* KPI Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "16px",
                  }}
                >
                  {[
                    {
                      label: "MRR",
                      value: `${fmt(mrr)} €`,
                      sub: "Monatl. Einnahmen (Brutto)",
                      icon: <Euro size={16} />,
                      color: "var(--success)",
                      bg: "var(--success-bg)",
                    },
                    {
                      label: "ARR (Prognose)",
                      value: `${fmt(arr)} €`,
                      sub: "Jährl. Einnahmen (Brutto)",
                      icon: <TrendingUp size={16} />,
                      color: "var(--accent)",
                      bg: "var(--accent-soft)",
                    },
                    {
                      label: "Zahlende Nutzer",
                      value: paidUsers,
                      sub: `${conversionRate}% Conversion`,
                      icon: <Users size={16} />,
                      color: "var(--warning)",
                      bg: "var(--warning-bg)",
                    },
                    {
                      label: "Offene Tickets",
                      value: openTickets,
                      sub: "Ausstehend",
                      icon: <AlertCircle size={16} />,
                      color: "var(--danger)",
                      bg: "var(--danger-bg)",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="card-elevated anim-fade-in-up"
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
                            width: 30,
                            height: 30,
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
                          fontSize: "26px",
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

                {/* Second row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  {/* Plan Breakdown / MRR */}
                  <div className="card-elevated" style={{ padding: "20px" }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--text-1)",
                        marginBottom: "16px",
                      }}
                    >
                      MRR nach Plan
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {["business", "professional", "starter", "free"].map(
                        (plan) => {
                          const d = planBreakdown[plan] ?? {
                            count: 0,
                            revenue: 0,
                          };
                          const maxRev = Math.max(
                            ...Object.values(planBreakdown).map((x) => x.revenue),
                            1,
                          );
                          const c = PLAN_COLORS[plan] ?? PLAN_COLORS.free;
                          return (
                            <div
                              key={plan}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <PlanBadge plan={plan} />
                              <div
                                style={{
                                  flex: 1,
                                  height: "5px",
                                  background: "var(--surface-2)",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${Math.round((d.revenue / maxRev) * 100)}%`,
                                    background: c.text,
                                    transition:
                                      "width var(--duration-slow) var(--ease-smooth)",
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: "var(--text-1)",
                                  minWidth: "24px",
                                  textAlign: "right",
                                }}
                              >
                                {d.count}
                              </span>
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: "var(--text-3)",
                                  minWidth: "58px",
                                  textAlign: "right",
                                }}
                              >
                                {fmt(d.revenue)} €
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* User Growth */}
                  <div className="card-elevated" style={{ padding: "20px" }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--text-1)",
                        marginBottom: "16px",
                      }}
                    >
                      Nutzer-Wachstum
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0",
                      }}
                    >
                      {[
                        {
                          label: "Gesamt registriert",
                          value: profiles.length,
                          color: "var(--text-1)",
                        },
                        {
                          label: "Neu diese Woche",
                          value: newUsersWeek,
                          color: "var(--success)",
                        },
                        {
                          label: "Neu diesen Monat",
                          value: newUsersMonth,
                          color: "var(--accent)",
                        },
                        {
                          label: "Zahlende Nutzer",
                          value: paidUsers,
                          color: "var(--warning)",
                        },
                        {
                          label: "Conversion Rate",
                          value: `${conversionRate}%`,
                          color: "var(--text-1)",
                        },
                      ].map((r) => (
                        <div
                          key={r.label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 0",
                            borderBottom: "1px solid var(--divider)",
                          }}
                        >
                          <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
                            {r.label}
                          </p>
                          <p
                            style={{
                              fontSize: "16px",
                              fontWeight: 700,
                              color: r.color,
                            }}
                          >
                            {r.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                TAB 2 — NUTZER
            ══════════════════════════════════════════ */}
            {tab === "nutzer" && (
              <div>
                {/* Search + Plan Filter */}
                <div
                  style={{
                    marginBottom: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Search
                      size={14}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-3)",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Nutzer suchen nach Name, E-Mail oder Firma…"
                      style={{ paddingLeft: "36px" }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {(
                      [
                        "alle",
                        "free",
                        "starter",
                        "professional",
                        "business",
                      ] as const
                    ).map((f) => {
                      const count =
                        f === "alle"
                          ? profiles.length
                          : profiles.filter((p) => p.plan === f).length;
                      const active = planFilter === f;
                      return (
                        <button
                          key={f}
                          onClick={() => setPlanFilter(f)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "5px 12px",
                            border: "1px solid var(--border)",
                            background: active
                              ? "var(--accent)"
                              : "var(--surface)",
                            color: active ? "#fff" : "var(--text-2)",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            textTransform: "capitalize",
                            transition:
                              "background var(--duration-fast) var(--ease-smooth), color var(--duration-fast) var(--ease-smooth)",
                          }}
                        >
                          {f === "alle" ? "Alle" : f}
                          <span
                            style={{
                              padding: "1px 5px",
                              fontSize: "10px",
                              fontWeight: 700,
                              background: active
                                ? "rgba(255,255,255,0.2)"
                                : "var(--surface-2)",
                              color: active ? "#fff" : "var(--text-3)",
                            }}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--text-3)",
                        marginLeft: "4px",
                      }}
                    >
                      {filteredProfiles.length} Nutzer angezeigt
                    </span>
                  </div>
                </div>

                <div className="card-elevated" style={{ overflow: "hidden" }}>
                  {/* Header row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 160px 120px 80px 110px",
                      padding: "10px 20px",
                      borderBottom: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      gap: "12px",
                    }}
                  >
                    <SortHeader label="Name / E-Mail" sortKey="name" />
                    <SortHeader label="Unternehmen" sortKey="company" />
                    <SortHeader label="Plan" sortKey="plan" />
                    <SortHeader label="Rechnungen" sortKey="invoices" />
                    <SortHeader label="Registriert" sortKey="created" />
                  </div>

                  {filteredProfiles.length === 0 ? (
                    <div style={{ padding: "48px", textAlign: "center" }}>
                      <p style={{ fontSize: "14px", color: "var(--text-2)" }}>
                        Keine Nutzer gefunden.
                      </p>
                    </div>
                  ) : (
                    filteredProfiles.map((p, i) => (
                      <div
                        key={p.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 160px 120px 80px 110px",
                          padding: "13px 20px",
                          gap: "12px",
                          alignItems: "center",
                          borderBottom:
                            i < filteredProfiles.length - 1
                              ? "1px solid var(--divider)"
                              : "none",
                          transition:
                            "background var(--duration-fast) var(--ease-smooth)",
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
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                              {p.full_name || "–"}
                            </span>
                            {p.id === ADMIN_USER_ID && (
                              <Crown
                                size={11}
                                style={{
                                  color: "var(--warning)",
                                  flexShrink: 0,
                                }}
                              />
                            )}
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
                            {p.email}
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
                          {p.company_name || "–"}
                        </p>

                        {/* Plan dropdown */}
                        <PlanChanger
                          profile={p}
                          isOpen={planDropdownOpen === p.id}
                          isChanging={changingPlan === p.id}
                          onToggle={() => setPlanDropdownOpen(planDropdownOpen === p.id ? null : p.id)}
                          onClose={() => setPlanDropdownOpen(null)}
                          onChange={(plan) => handlePlanChange(p.id, plan)}
                        />

                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--text-1)",
                          }}
                        >
                          {p.invoice_count}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-3)" }}>
                          {fmtDate(p.created_at)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                TAB 3 — EINNAHMEN
            ══════════════════════════════════════════ */}
            {tab === "einnahmen" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Revenue KPIs */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "16px",
                  }}
                >
                  {[
                    {
                      label: "MRR (Brutto)",
                      value: `${fmt(monthlyBrutto)} €`,
                      sub: `Netto: ${fmt(monthlyNetto)} €`,
                      color: "var(--success)",
                      bg: "var(--success-bg)",
                      icon: <Euro size={16} />,
                    },
                    {
                      label: "ARR Prognose (Brutto)",
                      value: `${fmt(yearlyBrutto)} €`,
                      sub: `Netto: ${fmt(yearlyNetto)} €`,
                      color: "var(--accent)",
                      bg: "var(--accent-soft)",
                      icon: <TrendingUp size={16} />,
                    },
                    {
                      label: "USt.-Rücklage / Monat",
                      value: `${fmt(monthlyUst)} €`,
                      sub: "19% Umsatzsteuer",
                      color: "var(--warning)",
                      bg: "var(--warning-bg)",
                      icon: <Euro size={16} />,
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="card-elevated anim-fade-in-up"
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
                            width: 30,
                            height: 30,
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
                          fontSize: "24px",
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

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  {/* Monthly table */}
                  <div className="card-elevated" style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "var(--text-1)",
                        }}
                      >
                        Monatliche Einnahmen — letzte 12 Monate
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--text-3)",
                          marginTop: "2px",
                        }}
                      >
                        Snapshot-basiert · historische Schwankungen nicht erfasst
                      </p>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 80px 80px 72px",
                        padding: "8px 16px",
                        borderBottom: "1px solid var(--border)",
                        background: "var(--surface-2)",
                        gap: "8px",
                      }}
                    >
                      {["Monat", "Brutto", "Netto", "USt"].map((h) => (
                        <span key={h} className="label-caps">
                          {h}
                        </span>
                      ))}
                    </div>
                    {monthlyRows.map((row, i) => {
                      const isCurrent = i === monthlyRows.length - 1;
                      return (
                        <div
                          key={i}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 80px 80px 72px",
                            padding: "9px 16px",
                            gap: "8px",
                            alignItems: "center",
                            borderBottom:
                              i < monthlyRows.length - 1
                                ? "1px solid var(--divider)"
                                : "none",
                            background: isCurrent
                              ? "var(--accent-soft)"
                              : "transparent",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "12px",
                              color: isCurrent
                                ? "var(--accent)"
                                : "var(--text-2)",
                              fontWeight: isCurrent ? 600 : 400,
                            }}
                          >
                            {fmtMonth(row.date)}
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "var(--success)",
                            }}
                          >
                            {fmt(row.brutto)} €
                          </p>
                          <p
                            style={{ fontSize: "12px", color: "var(--text-2)" }}
                          >
                            {fmt(row.netto)} €
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--warning)",
                            }}
                          >
                            {fmt(row.ust)} €
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tax overview */}
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                  >
                    {/* Jahresübersicht */}
                    <div className="card-elevated" style={{ padding: "20px" }}>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "var(--text-1)",
                          marginBottom: "16px",
                        }}
                      >
                        Steuerübersicht {now.getFullYear()}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0",
                        }}
                      >
                        {[
                          {
                            label: "Jahresbrutto",
                            value: `${fmt(yearlyBrutto)} €`,
                            color: "var(--success)",
                          },
                          {
                            label: "Jahresnetto",
                            value: `${fmt(yearlyNetto)} €`,
                            color: "var(--text-1)",
                          },
                          {
                            label: "Jahres-USt (19%)",
                            value: `${fmt(yearlyUst)} €`,
                            color: "var(--warning)",
                          },
                        ].map((r) => (
                          <div
                            key={r.label}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "11px 0",
                              borderBottom: "1px solid var(--divider)",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "13px",
                                color: "var(--text-2)",
                              }}
                            >
                              {r.label}
                            </p>
                            <p
                              style={{
                                fontSize: "16px",
                                fontWeight: 700,
                                color: r.color,
                              }}
                            >
                              {r.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quarterly USt */}
                    <div className="card-elevated" style={{ overflow: "hidden" }}>
                      <div
                        style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "var(--text-1)",
                          }}
                        >
                          USt-Vorauszahlung je Quartal
                        </p>
                        <p
                          style={{
                            fontSize: "11px",
                            color: "var(--text-3)",
                            marginTop: "2px",
                          }}
                        >
                          Geschätzte Vorauszahlung
                        </p>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 90px 90px",
                          padding: "8px 16px",
                          borderBottom: "1px solid var(--border)",
                          background: "var(--surface-2)",
                          gap: "8px",
                        }}
                      >
                        {["Quartal", "Brutto", "USt-Zahlung"].map((h) => (
                          <span key={h} className="label-caps">
                            {h}
                          </span>
                        ))}
                      </div>
                      {quarters.map((q, i) => (
                        <div
                          key={q.label}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 90px 90px",
                            padding: "11px 16px",
                            gap: "8px",
                            alignItems: "center",
                            borderBottom:
                              i < 3 ? "1px solid var(--divider)" : "none",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "var(--text-2)",
                            }}
                          >
                            {q.label}
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--success)",
                            }}
                          >
                            {fmt(q.brutto)} €
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "var(--warning)",
                            }}
                          >
                            {fmt(q.ust)} €
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-3)",
                    lineHeight: 1.6,
                  }}
                >
                  ⚠ Alle Beträge basieren auf dem aktuellen Abo-Stand (Snapshot).
                  Historische Planwechsel werden nicht erfasst. Preise gelten als
                  Brutto inkl. 19% USt. Keine Steuerberatung — konsultiere deinen
                  Steuerberater für die offizielle Abrechnung.
                </p>
              </div>
            )}

            {/* ══════════════════════════════════════════
                TAB 4 — TICKETS
            ══════════════════════════════════════════ */}
            {tab === "tickets" && (
              <div>
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
                          ticketFilter === f ? "var(--accent)" : "var(--surface)",
                        color: ticketFilter === f ? "#fff" : "var(--text-2)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition:
                          "background var(--duration-fast) var(--ease-smooth), color var(--duration-fast) var(--ease-smooth)",
                      }}
                    >
                      {f === "alle"
                        ? "Alle"
                        : f.charAt(0).toUpperCase() + f.slice(1)}
                      {f === "offen" &&
                        ` (${tickets.filter((t) => t.status === "offen").length})`}
                    </button>
                  ))}
                </div>

                <div className="card-elevated" style={{ overflow: "hidden" }}>
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
                    {["", "Ticket", "Nutzer", "Seite", "Priorität", "Status"].map(
                      (h, i) => (
                        <span key={i} className="label-caps">
                          {h}
                        </span>
                      ),
                    )}
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
                      const priorityColor =
                        ticket.priority === "kritisch"
                          ? "var(--danger)"
                          : ticket.priority === "hoch"
                            ? "var(--warning)"
                            : "var(--text-3)";
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
                              transition:
                                "background var(--duration-fast) var(--ease-smooth)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "var(--surface-2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <div
                              style={{
                                color: "var(--text-2)",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {typeIcon(ticket.type)}
                            </div>
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
                                {fmtDate(ticket.created_at)}
                              </p>
                            </div>
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
                              {profile && <PlanBadge plan={profile.plan} />}
                            </div>
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
                            <p
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: priorityColor,
                                textTransform: "capitalize",
                              }}
                            >
                              {ticket.priority}
                            </p>
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
                                    Deine Antwort ({fmtDate(ticket.replied_at!)})
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

                              {/* Status toggle buttons */}
                              <div
                                style={{
                                  display: "flex",
                                  gap: "6px",
                                  marginBottom: "16px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    color: "var(--text-3)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    alignSelf: "center",
                                    marginRight: "4px",
                                  }}
                                >
                                  Status:
                                </span>
                                {(["offen", "in_bearbeitung", "geloest"] as const).map((s) => {
                                  const active = ticket.status === s;
                                  const sc2 = statusBg(s);
                                  return (
                                    <button
                                      key={s}
                                      onClick={() => { if (!active) handleTicketStatus(ticket.id, s); }}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        padding: "4px 10px",
                                        border: active ? "none" : "1px solid var(--border)",
                                        background: active ? sc2.bg : "var(--surface)",
                                        color: active ? sc2.text : "var(--text-2)",
                                        fontSize: "11px",
                                        fontWeight: active ? 700 : 500,
                                        cursor: active ? "default" : "pointer",
                                        transition: "all var(--duration-fast) var(--ease-smooth)",
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!active) { e.currentTarget.style.background = sc2.bg; e.currentTarget.style.color = sc2.text; }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!active) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text-2)"; }
                                      }}
                                    >
                                      {s === "geloest" ? <CheckCircle2 size={10} /> : s === "in_bearbeitung" ? <Clock size={10} /> : <AlertCircle size={10} />}
                                      {s === "geloest" ? "Gelöst" : s === "in_bearbeitung" ? "In Bearbeitung" : "Offen"}
                                    </button>
                                  );
                                })}
                              </div>

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
                                      style={{ resize: "none", minHeight: "80px" }}
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

            {/* ══════════════════════════════════════════
                TAB 5 — FEATURES
            ══════════════════════════════════════════ */}
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
                          transition:
                            "background var(--duration-fast) var(--ease-smooth)",
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
          </div>
        )}
      </div>
    </div>
  );
}
