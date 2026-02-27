"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/invoices/StatusBadge";
import type { Invoice } from "@/types";
import {
  FileText,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  ChevronRight,
} from "lucide-react";

interface Stats {
  openCount: number;
  openTotal: number;
  overdueCount: number;
  overdueTotal: number;
  paidMonth: number;
  avgPaymentDays: number | null;
}

interface MonthlyRevenue {
  month: string;
  total: number;
}

type DashboardInvoice = Invoice & {
  customer?: { name?: string | null } | null;
  paid_at?: string | null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    openCount: 0,
    openTotal: 0,
    overdueCount: 0,
    overdueTotal: 0,
    paidMonth: 0,
    avgPaymentDays: null,
  });
  const [recentInvoices, setRecentInvoices] = useState<DashboardInvoice[]>([]);
  const [monthly, setMonthly] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const now = new Date();
      const firstOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();

      const { data } = await supabase
        .from("invoices")
        .select("*, customer:customers(name)")
        .order("created_at", { ascending: false });
      const invoices = (data as DashboardInvoice[] | null) ?? [];

      if (invoices.length === 0) {
        setLoading(false);
        return;
      }

      // Stats
      const open = invoices.filter((i) => ["open", "sent"].includes(i.status));
      const overdue = invoices.filter((i) => i.status === "overdue");
      const paid = invoices.filter((i) => i.status === "paid");
      const paidMonth = paid.filter(
        (i) => i.paid_at && i.paid_at >= firstOfMonth,
      );

      const paidWithDates = paid.filter(
        (i): i is DashboardInvoice & { paid_at: string; issue_date: string } =>
          Boolean(i.paid_at && i.issue_date),
      );
      const avgDays =
        paidWithDates.length > 0
          ? paidWithDates.reduce((sum, i) => {
              const diff =
                new Date(i.paid_at).getTime() -
                new Date(i.issue_date).getTime();
              return sum + diff / (1000 * 60 * 60 * 24);
            }, 0) / paidWithDates.length
          : null;

      setStats({
        openCount: open.length,
        openTotal: open.reduce((s, i) => s + i.total, 0),
        overdueCount: overdue.length,
        overdueTotal: overdue.reduce((s, i) => s + i.total, 0),
        paidMonth: paidMonth.reduce((s, i) => s + i.total, 0),
        avgPaymentDays: avgDays ? Math.round(avgDays) : null,
      });

      // Recent
      setRecentInvoices(invoices.slice(0, 5));

      // Monthly revenue – last 6 months
      const months: MonthlyRevenue[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleString("de-DE", {
          month: "short",
          year: "2-digit",
        });
        const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
        const end = new Date(
          d.getFullYear(),
          d.getMonth() + 1,
          0,
        ).toISOString();
        const total = paid
          .filter(
            (inv) => inv.paid_at && inv.paid_at >= start && inv.paid_at <= end,
          )
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
      title: "OFFENE RECHNUNGEN",
      value: loading ? "–" : String(stats.openCount),
      sub: loading ? "..." : `${formatCurrency(stats.openTotal)} ausstehend`,
      icon: FileText,
      color: "var(--primary)",
      bg: "var(--primary-light)",
    },
    {
      title: "ÜBERFÄLLIG",
      value: loading ? "–" : String(stats.overdueCount),
      sub: loading
        ? "..."
        : stats.overdueCount > 0
          ? `${formatCurrency(stats.overdueTotal)} offen`
          : "Keine überfälligen",
      icon: AlertTriangle,
      color: "var(--destructive)",
      bg: "var(--destructive-bg)",
    },
    {
      title: "BEZAHLT (MONAT)",
      value: loading ? "–" : formatCurrency(stats.paidMonth),
      sub: "Aktueller Monat",
      icon: TrendingUp,
      color: "var(--success)",
      bg: "var(--success-bg)",
    },
    {
      title: "Ø ZAHLUNGSDAUER",
      value: loading
        ? "–"
        : stats.avgPaymentDays
          ? `${stats.avgPaymentDays} Tage`
          : "–",
      sub: stats.avgPaymentDays ? "Durchschnitt" : "Noch keine Daten",
      icon: Clock,
      color: "var(--muted-foreground)",
      bg: "var(--muted)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
        }}
      >
        {statCards.map((s) => (
          <div
            key={s.title}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "20px",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <span className="label-caps">{s.title}</span>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "var(--radius)",
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <s.icon style={{ width: 14, height: 14, color: s.color }} />
              </div>
            </div>
            <p
              className="amount"
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--foreground)",
                lineHeight: 1,
                marginBottom: "5px",
              }}
            >
              {s.value}
            </p>
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: "13px",
              color: "var(--foreground)",
            }}
          >
            Monatlicher Umsatz
          </span>
          <BarChart2
            style={{ width: 15, height: 15, color: "var(--muted-foreground)" }}
          />
        </div>

        {monthly.every((m) => m.total === 0) ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "48px 24px",
              gap: "6px",
            }}
          >
            <BarChart2
              style={{ width: 24, height: 24, color: "var(--border-strong)" }}
            />
            <p
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--foreground)",
              }}
            >
              Noch keine Umsatzdaten
            </p>
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
              Erscheint sobald Rechnungen bezahlt werden.
            </p>
          </div>
        ) : (
          <div style={{ padding: "24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "12px",
                height: "120px",
              }}
            >
              {monthly.map((m) => (
                <div
                  key={m.month}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    className="amount"
                    style={{
                      fontSize: "10px",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {m.total > 0 ? formatCurrency(m.total) : ""}
                  </span>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max((m.total / maxRevenue) * 88, m.total > 0 ? 4 : 2)}px`,
                      background:
                        m.total > 0 ? "var(--primary)" : "var(--muted)",
                      borderRadius: "3px 3px 0 0",
                      transition: "height 300ms ease",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--muted-foreground)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Invoices */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: "13px",
              color: "var(--foreground)",
            }}
          >
            Letzte Rechnungen
          </span>
          <Link
            href="/invoices"
            style={{
              fontSize: "12px",
              color: "var(--primary)",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Alle anzeigen
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "48px 24px",
              gap: "6px",
            }}
          >
            <FileText
              style={{ width: 24, height: 24, color: "var(--border-strong)" }}
            />
            <p
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--foreground)",
              }}
            >
              Noch keine Rechnungen
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "var(--muted-foreground)",
                marginBottom: "10px",
              }}
            >
              Erstelle deine erste Rechnung.
            </p>
            <Link href="/invoices/new">
              <button
                style={{
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius)",
                  padding: "7px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Jetzt erstellen
              </button>
            </Link>
          </div>
        ) : (
          recentInvoices.map((inv, i) => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="invoice-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 24px",
                  borderBottom:
                    i < recentInvoices.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "var(--radius)",
                      background: "var(--primary-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileText
                      style={{ width: 14, height: 14, color: "var(--primary)" }}
                    />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--foreground)",
                      }}
                    >
                      {inv.invoice_number}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {inv.customer?.name ?? "–"} · Fällig{" "}
                      {formatDate(inv.due_date)}
                    </p>
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <StatusBadge status={inv.status} />
                  <span
                    className="amount"
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--foreground)",
                    }}
                  >
                    {formatCurrency(inv.total)}
                  </span>
                  <ChevronRight
                    style={{
                      width: 14,
                      height: 14,
                      color: "var(--muted-foreground)",
                    }}
                  />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
