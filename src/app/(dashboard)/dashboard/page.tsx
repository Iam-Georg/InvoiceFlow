"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/invoices/StatusBadge";
import type { Invoice } from "@/types";
import { FileText, Clock3, AlertTriangle, TrendingUp, BarChart3, ChevronRight } from "lucide-react";
import OnboardingBanner from "@/components/OnboardingBanner";

interface Stats {
  openCount: number;
  openTotal: number;
  overdueCount: number;
  overdueTotal: number;
  paidMonth: number;
  avgPaymentDays: number | null;
  healthScore: number;
  collectionRate: number;
  totalInvoiced: number;
}

interface MonthlyRevenue {
  month: string;
  total: number;
}

type DashboardInvoice = Invoice & {
  customer?: { name?: string | null } | null;
  paid_at?: string | null;
};

function useCountUp(target: number, duration = 400) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);
  return value;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    openCount: 0,
    openTotal: 0,
    overdueCount: 0,
    overdueTotal: 0,
    paidMonth: 0,
    avgPaymentDays: null,
    healthScore: 100,
    collectionRate: 0,
    totalInvoiced: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<DashboardInvoice[]>([]);
  const [monthly, setMonthly] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  const animOpenCount = useCountUp(stats.openCount);
  const animOverdueCount = useCountUp(stats.overdueCount);
  const animPaidMonth = useCountUp(stats.paidMonth);
  const animAvgDays = useCountUp(stats.avgPaymentDays ?? 0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data } = await supabase
        .from("invoices")
        .select("*, customer:customers(name)")
        .order("created_at", { ascending: false });

      const invoices = (data as DashboardInvoice[] | null) ?? [];
      if (invoices.length === 0) {
        setLoading(false);
        return;
      }

      const open = invoices.filter((i) => ["open", "sent"].includes(i.status));
      const overdue = invoices.filter((i) => i.status === "overdue");
      const paid = invoices.filter((i) => i.status === "paid");
      const paidMonth = paid.filter((i) => i.paid_at && i.paid_at >= firstOfMonth);

      const paidWithDates = paid.filter(
        (i): i is DashboardInvoice & { paid_at: string; issue_date: string } => Boolean(i.paid_at && i.issue_date),
      );

      const avgDays =
        paidWithDates.length > 0
          ? paidWithDates.reduce((sum, i) => {
              const diff = new Date(i.paid_at).getTime() - new Date(i.issue_date).getTime();
              return sum + diff / (1000 * 60 * 60 * 24);
            }, 0) / paidWithDates.length
          : null;

      const totalInvoiced = invoices.filter((i) => i.status !== "draft").reduce((s, i) => s + i.total, 0);
      const totalPaid     = paid.reduce((s, i) => s + i.total, 0);
      const collectionRate = totalInvoiced > 0 ? totalPaid / totalInvoiced : 0;
      const roundedAvg    = avgDays ? Math.round(avgDays) : null;

      // Business Health Score (0–100)
      let health = 100;
      // Penalty for overdue ratio (up to -40)
      const nonDraftCount = invoices.filter((i) => i.status !== "draft").length;
      if (nonDraftCount > 0) health -= (overdue.length / nonDraftCount) * 40;
      // Penalty for slow payments (up to -30)
      if (roundedAvg !== null) {
        if      (roundedAvg > 60) health -= 30;
        else if (roundedAvg > 30) health -= 20;
        else if (roundedAvg > 21) health -= 10;
      }
      // Penalty for low collection rate (up to -30)
      if (totalInvoiced > 0) {
        if      (collectionRate < 0.50) health -= 30;
        else if (collectionRate < 0.70) health -= 20;
        else if (collectionRate < 0.85) health -= 10;
      }

      setStats({
        openCount: open.length,
        openTotal: open.reduce((s, i) => s + i.total, 0),
        overdueCount: overdue.length,
        overdueTotal: overdue.reduce((s, i) => s + i.total, 0),
        paidMonth: paidMonth.reduce((s, i) => s + i.total, 0),
        avgPaymentDays: roundedAvg,
        healthScore: Math.round(Math.max(0, Math.min(100, health))),
        collectionRate,
        totalInvoiced,
      });

      setRecentInvoices(invoices.slice(0, 5));

      const months: MonthlyRevenue[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleString("de-DE", { month: "short", year: "2-digit" });
        const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();

        const total = paid
          .filter((inv) => inv.paid_at && inv.paid_at >= start && inv.paid_at < end)
          .reduce((s, inv) => s + inv.total, 0);

        months.push({ month: label, total });
      }

      setMonthly(months);
      setLoading(false);
    }

    load();
  }, []);

  const maxRevenue = Math.max(...monthly.map((m) => m.total), 1);

  const statCards = [
    {
      title: "OFFEN",
      value: loading ? "-" : String(animOpenCount),
      sub: loading ? "..." : `${formatCurrency(stats.openTotal)} ausstehend`,
      icon: FileText,
      iconColor: "var(--accent)",
      iconBg: "var(--accent-soft)",
    },
    {
      title: "UEBERFAELLIG",
      value: loading ? "-" : String(animOverdueCount),
      sub: loading ? "..." : `${formatCurrency(stats.overdueTotal)} offen`,
      icon: AlertTriangle,
      iconColor: "var(--danger)",
      iconBg: "var(--danger-bg)",
    },
    {
      title: "BEZAHLT (MONAT)",
      value: loading ? "-" : formatCurrency(animPaidMonth),
      sub: "Aktueller Monat",
      icon: TrendingUp,
      iconColor: "var(--success)",
      iconBg: "var(--success-bg)",
    },
    {
      title: "ZAHLUNGSDAUER",
      value: loading ? "-" : stats.avgPaymentDays ? `${animAvgDays} Tage` : "-",
      sub: stats.avgPaymentDays ? "Durchschnitt" : "Noch keine Daten",
      icon: Clock3,
      iconColor: "var(--warning)",
      iconBg: "var(--warning-bg)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <OnboardingBanner />
      <div className="reveal-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        {statCards.map((s, i) => (
          <article
            key={s.title}
            className="card-elevated card-hover anim-fade-in-up"
            style={{ padding: "24px", animationDelay: `${i * 80}ms` }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <p className="card-label">{s.title}</p>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  // borderRadius: "8px",
                  background: s.iconBg,
                  color: s.iconColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <s.icon size={16} />
              </div>
            </div>
            <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.1, marginBottom: "6px" }}>{s.value}</p>
            <p style={{ fontSize: "13px", fontWeight: 400, color: "var(--text-2)" }}>{s.sub}</p>
          </article>
        ))}
      </div>

      {/* Business Health Score */}
      {!loading && stats.totalInvoiced > 0 && (() => {
        const s = stats.healthScore;
        const color  = s >= 80 ? "var(--success)"  : s >= 60 ? "var(--warning)"  : "var(--danger)";
        const bg     = s >= 80 ? "var(--success-bg)" : s >= 60 ? "var(--warning-bg)" : "var(--danger-bg)";
        const label  = s >= 80 ? "Gut"           : s >= 60 ? "Aufmerksamkeit" : "Kritisch";
        return (
          <section className="card-elevated anim-fade-in-up" style={{ padding: "20px 24px", animationDelay: "320ms" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "14px" }}>
              <div>
                <p className="label-caps">Unternehmens-Gesundheit</p>
                <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "3px" }}>
                  Basierend auf Einzugsquote, Zahlungsgeschwindigkeit und offenen Rechnungen
                </p>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", background: bg, flexShrink: 0 }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color, letterSpacing: "0.04em" }}>{label}</span>
              </div>
            </div>

            {/* Score bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
              <div style={{ flex: 1, height: "6px", background: "var(--surface-2)", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${s}%`,
                    height: "100%",
                    background: 'linear-gradient(90deg, var(--danger) 0%, var(--warning) 50%, var(--success) 100%)',
                    transition: `width 1s var(--ease-smooth)`,
                  }}
                />
              </div>
              <span style={{ fontSize: "22px", fontWeight: 700, color, letterSpacing: "-0.02em", minWidth: "52px", textAlign: "right" }}>
                {s}
              </span>
            </div>

            {/* Mini stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
              <div>
                <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "3px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Einzugsquote</p>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)" }}>
                  {(stats.collectionRate * 100).toFixed(0)} %
                </p>
              </div>
              <div>
                <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "3px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ø Zahlungsdauer</p>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)" }}>
                  {stats.avgPaymentDays !== null ? `${stats.avgPaymentDays} Tage` : "–"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "3px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Überfällig</p>
                <p style={{ fontSize: "16px", fontWeight: 700, color: stats.overdueCount > 0 ? "var(--danger)" : "var(--text-1)" }}>
                  {stats.overdueCount} Rechnungen
                </p>
              </div>
            </div>
          </section>
        );
      })()}

      <section className="card-elevated" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-1)" }}>Monatlicher Umsatz</h2>
          <BarChart3 size={16} color="var(--text-2)" />
        </div>

        {monthly.every((m) => m.total === 0) ? (
          <div className="anim-fade-in" style={{ minHeight: "180px", display: "grid", placeItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <BarChart3 size={32} color="var(--text-3)" style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: "14px", color: "var(--text-2)" }}>Noch keine Umsatzdaten vorhanden.</p>
            </div>
          </div>
        ) : (
          <div className="anim-fade-in" style={{ display: "flex", alignItems: "flex-end", gap: "12px", minHeight: "180px" }}>
            {monthly.map((m) => (
              <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{m.total > 0 ? formatCurrency(m.total) : ""}</span>
                <div
                  style={{
                    width: "100%",
                    maxWidth: "56px",
                    height: `${Math.max((m.total / maxRevenue) * 120, m.total > 0 ? 8 : 2)}px`,
                    background: m.total > 0 ? "var(--accent)" : "var(--surface-2)",
                  }}
                />
                <span style={{ fontSize: "11px", color: "var(--text-2)" }}>{m.month}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card-elevated reveal-stagger" style={{ overflow: "hidden" }}>
        <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-1)" }}>Letzte Rechnungen</h2>
          <Link href="/invoices" style={{ fontSize: "14px", color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Alle anzeigen
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="anim-fade-in" style={{ minHeight: "180px", display: "grid", placeItems: "center", padding: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <FileText size={28} color="var(--text-3)" style={{ margin: "0 auto 8px" }} />
              <p style={{ fontSize: "14px", color: "var(--text-2)" }}>Noch keine Rechnungen vorhanden.</p>
            </div>
          </div>
        ) : (
          recentInvoices.map((inv, i) => (
            <Link key={inv.id} href={`/invoices/${inv.id}`} style={{ textDecoration: "none" }}>
              <div
                className="invoice-row"
                style={{
                  height: "56px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 24px",
                  borderBottom: i < recentInvoices.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      // borderRadius: "8px",
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={15} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)", lineHeight: 1.2 }}>{inv.invoice_number}</p>
                    <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.2 }}>
                      {inv.customer?.name ?? "-"} | {formatDate(inv.due_date)}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
                  <StatusBadge status={inv.status} />
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)" }}>{formatCurrency(inv.total)}</span>
                  <ChevronRight size={14} color="var(--text-3)" />
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}

