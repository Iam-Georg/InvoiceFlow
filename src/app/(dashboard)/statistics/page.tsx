"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";

type InvoiceStatsRow = {
  status: "draft" | "sent" | "open" | "overdue" | "paid";
  total: number;
  issue_date: string;
  due_date: string;
  paid_at: string | null;
  created_at: string;
};

type MonthlyPoint = {
  month: string;
  paid: number;
};

type PiePoint = {
  name: string;
  value: number;
  color: string;
};

type AgingPoint = {
  bucket: string;
  count: number;
  total: number;
};

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthly, setMonthly] = useState<MonthlyPoint[]>([]);
  const [statusData, setStatusData] = useState<PiePoint[]>([]);
  const [aging, setAging] = useState<AgingPoint[]>([]);
  const [reminderCount, setReminderCount] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      setLoading(true);
      setError(null);

      const [{ data: invoices, error: invoiceError }, { count }] = await Promise.all([
        supabase
          .from("invoices")
          .select("status, total, issue_date, due_date, paid_at, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("reminders").select("id", { head: true, count: "exact" }),
      ]);

      if (invoiceError) {
        setError(invoiceError.message);
        setLoading(false);
        return;
      }

      const rows = (invoices as InvoiceStatsRow[] | null) ?? [];
      setReminderCount(count ?? 0);

      const now = new Date();

      const nextMonthly: MonthlyPoint[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
        const paid = rows
          .filter(
            (row) =>
              row.status === "paid" &&
              row.paid_at &&
              row.paid_at >= monthStart &&
              row.paid_at < monthEnd,
          )
          .reduce((sum, row) => sum + Number(row.total ?? 0), 0);

        nextMonthly.push({
          month: d.toLocaleString("de-DE", { month: "short" }),
          paid,
        });
      }
      setMonthly(nextMonthly);

      const statusLabels: Record<InvoiceStatsRow["status"], string> = {
        draft: "Entwurf",
        sent: "Gesendet",
        open: "Offen",
        overdue: "Überfällig",
        paid: "Bezahlt",
      };
      const statusColors: Record<InvoiceStatsRow["status"], string> = {
        draft: "#94A3B8",
        sent: "#2563EB",
        open: "#B45309",
        overdue: "#DC2626",
        paid: "#16A34A",
      };
      setStatusData(
        (Object.keys(statusLabels) as InvoiceStatsRow["status"][]).map((status) => ({
          name: statusLabels[status],
          value: rows.filter((row) => row.status === status).length,
          color: statusColors[status],
        })),
      );

      const ageRows: AgingPoint[] = [
        { bucket: "1-14 Tage", count: 0, total: 0 },
        { bucket: "15-30 Tage", count: 0, total: 0 },
        { bucket: "31-60 Tage", count: 0, total: 0 },
        { bucket: "> 60 Tage", count: 0, total: 0 },
      ];
      for (const row of rows) {
        if (row.status === "paid") continue;
        const days = Math.floor(
          (now.getTime() - new Date(row.due_date).getTime()) / (1000 * 60 * 60 * 24),
        );
        if (days <= 0) continue;
        const value = Number(row.total ?? 0);
        if (days <= 14) {
          ageRows[0].count += 1;
          ageRows[0].total += value;
        } else if (days <= 30) {
          ageRows[1].count += 1;
          ageRows[1].total += value;
        } else if (days <= 60) {
          ageRows[2].count += 1;
          ageRows[2].total += value;
        } else {
          ageRows[3].count += 1;
          ageRows[3].total += value;
        }
      }
      setAging(ageRows);
      setLoading(false);
    }

    load();
  }, []);

  const kpis = useMemo(() => {
    const paidTotal = monthly.reduce((sum, p) => sum + p.paid, 0);
    const overdueTotal = aging.reduce((sum, row) => sum + row.total, 0);
    const overdueCount = aging.reduce((sum, row) => sum + row.count, 0);
    const peakMonth = monthly.reduce(
      (best, point) => (point.paid > best.paid ? point : best),
      { month: "-", paid: 0 },
    );

    return {
      paidTotal,
      overdueTotal,
      overdueCount,
      peakMonth,
    };
  }, [monthly, aging]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Loader2
          style={{
            width: 20,
            height: 20,
            color: "var(--muted-foreground)",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", color: "var(--destructive)" }}>
        Fehler beim Laden der Statistiken: {error}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "18px 20px",
        }}
      >
        <h1 style={{ fontSize: "18px", fontWeight: 700, color: "var(--foreground)" }}>
          Statistiken
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "6px" }}>
          Umsatztrend, Statusverteilung und Überfälligkeits-Analyse.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        <Kpi title="Bezahlt (12 Monate)" value={formatCurrency(kpis.paidTotal)} />
        <Kpi title="Überfällig (Betrag)" value={formatCurrency(kpis.overdueTotal)} />
        <Kpi title="Überfällige Rechnungen" value={String(kpis.overdueCount)} />
        <Kpi title="Gesendete Erinnerungen" value={String(reminderCount)} />
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "16px",
          height: "340px",
        }}
      >
        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)", marginBottom: "10px" }}>
          Umsatz pro Monat (bezahlt)
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthly}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Line type="monotone" dataKey="paid" stroke="#1B3A6B" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "16px",
            height: "320px",
          }}
        >
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)", marginBottom: "10px" }}>
            Statusverteilung
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={95}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "16px",
            height: "320px",
          }}
        >
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)", marginBottom: "10px" }}>
            Überfälligkeits-Alterung
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aging}>
              <XAxis dataKey="bucket" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="total" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "14px 16px",
          fontSize: "13px",
          color: "var(--muted-foreground)",
        }}
      >
        Höchster Monatsumsatz:{" "}
        <span style={{ color: "var(--foreground)", fontWeight: 600 }}>
          {kpis.peakMonth.month} ({formatCurrency(kpis.peakMonth.paid)})
        </span>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "14px 16px",
      }}
    >
      <p className="label-caps">{title}</p>
      <p
        className="amount"
        style={{
          marginTop: "8px",
          fontSize: "20px",
          fontWeight: 700,
          color: "var(--foreground)",
        }}
      >
        {value}
      </p>
    </div>
  );
}
