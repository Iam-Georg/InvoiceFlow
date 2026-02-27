"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface MonthlyPoint {
  month: string;
  paid: number;
}

interface StatusPoint {
  name: string;
  value: number;
  color: string;
}

export default function StatisticsPage() {
  const [monthly, setMonthly] = useState<MonthlyPoint[]>([]);
  const [statusData, setStatusData] = useState<StatusPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("invoices")
        .select("status, total, paid_at, created_at")
        .order("created_at", { ascending: false });

      const invoices = data ?? [];
      const now = new Date();
      const points: MonthlyPoint[] = [];
      for (let i = 5; i >= 0; i--) {
        const current = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(current.getFullYear(), current.getMonth(), 1).toISOString();
        const end = new Date(current.getFullYear(), current.getMonth() + 1, 1).toISOString();
        points.push({
          month: current.toLocaleString("de-DE", { month: "short" }),
          paid: invoices
            .filter(
              (inv) =>
                inv.status === "paid" &&
                inv.paid_at &&
                inv.paid_at >= start &&
                inv.paid_at < end,
            )
            .reduce((sum, inv) => sum + Number(inv.total ?? 0), 0),
        });
      }
      setMonthly(points);

      const statuses = ["draft", "sent", "open", "overdue", "paid"] as const;
      const colors: Record<(typeof statuses)[number], string> = {
        draft: "#94A3B8",
        sent: "#2563EB",
        open: "#C2410C",
        overdue: "#DC2626",
        paid: "#16A34A",
      };
      setStatusData(
        statuses.map((status) => ({
          name: status,
          value: invoices.filter((inv) => inv.status === status).length,
          color: colors[status],
        })),
      );

      setLoading(false);
    }

    load();
  }, []);

  const totalPaid = useMemo(
    () => monthly.reduce((sum, point) => sum + point.paid, 0),
    [monthly],
  );

  if (loading) {
    return (
      <div style={{ padding: "24px", color: "var(--muted-foreground)" }}>
        Lade Statistiken...
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
          Bezahlter Umsatz (6 Monate): {formatCurrency(totalPaid)}
        </p>
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
          Umsatz pro Monat
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthly}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="paid" fill="#1B3A6B" radius={[4, 4, 0, 0]} />
          </BarChart>
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
          Statusverteilung
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={100}>
              {statusData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
