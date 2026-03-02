"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
  Legend,
} from "recharts";
import { Loader2, TrendingUp, AlertTriangle, Send, Clock, BarChart3 } from "lucide-react";

/* ── Types ──────────────────────────────────────── */
type InvoiceRow = {
  status: "draft" | "sent" | "open" | "overdue" | "paid";
  total: number;
  issue_date: string;
  due_date: string;
  paid_at: string | null;
  created_at: string;
};

/* ── Recharts tooltip styling ────────────────────── */
const tooltipStyle = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.07)",
    borderRadius: 0,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    fontSize: 12,
    padding: "8px 12px",
  },
  labelStyle: { color: "#5c5c6e", fontSize: 11, fontWeight: 600 },
  itemStyle: { color: "#0c0c14", fontWeight: 600 },
  cursor: { fill: "rgba(0,64,204,0.04)" },
};

/* ── useCountUp hook ─────────────────────────────── */
function useCountUp(target: number, duration = 400) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);
  return value;
}

/* ── KPI Card ────────────────────────────────────── */
function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  bg,
  delay,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  delay: number;
}) {
  return (
    <article
      className="card-elevated card-hover anim-fade-in-up"
      style={{ padding: "20px 24px", animationDelay: `${delay}ms` }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
        <p className="label-caps">{title}</p>
        <div style={{ width: 30, height: 30, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <p style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "4px" }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: "12px", color: "var(--text-3)" }}>{sub}</p>}
    </article>
  );
}

/* ── Main ────────────────────────────────────────── */
export default function StatisticsPage() {
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [monthly, setMonthly]     = useState<{ month: string; paid: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [aging, setAging]         = useState<{ bucket: string; count: number; total: number }[]>([]);
  const [reminderCount, setReminderCount] = useState(0);
  const [avgPayDays, setAvgPayDays] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      setLoading(true);
      setError(null);

      const [{ data: invoices, error: invoiceErr }, { count }] = await Promise.all([
        supabase
          .from("invoices")
          .select("status, total, issue_date, due_date, paid_at, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("reminders").select("id", { head: true, count: "exact" }),
      ]);

      if (invoiceErr) { setError(invoiceErr.message); setLoading(false); return; }

      const rows = (invoices as InvoiceRow[] | null) ?? [];
      setReminderCount(count ?? 0);
      const now = new Date();

      /* Monthly paid revenue (last 12 months) */
      const nextMonthly = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
        const end   = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
        const paid  = rows
          .filter((r) => r.status === "paid" && r.paid_at && r.paid_at >= start && r.paid_at < end)
          .reduce((s, r) => s + Number(r.total ?? 0), 0);
        return { month: d.toLocaleString("de-DE", { month: "short", year: "2-digit" }), paid };
      });
      setMonthly(nextMonthly);

      /* Status distribution */
      const statusLabels: Record<InvoiceRow["status"], string> = {
        draft: "Entwurf", sent: "Gesendet", open: "Offen", overdue: "Überfällig", paid: "Bezahlt",
      };
      const statusColors: Record<InvoiceRow["status"], string> = {
        draft: "#9898AA", sent: "#0040CC", open: "#CC7000", overdue: "#CC2020", paid: "#00A060",
      };
      setStatusData(
        (Object.keys(statusLabels) as InvoiceRow["status"][]).map((s) => ({
          name: statusLabels[s],
          value: rows.filter((r) => r.status === s).length,
          color: statusColors[s],
        })).filter((d) => d.value > 0),
      );

      /* Overdue aging */
      const ageRows = [
        { bucket: "1–14 Tage",  count: 0, total: 0 },
        { bucket: "15–30 Tage", count: 0, total: 0 },
        { bucket: "31–60 Tage", count: 0, total: 0 },
        { bucket: "> 60 Tage",  count: 0, total: 0 },
      ];
      for (const r of rows) {
        if (r.status === "paid") continue;
        const days = Math.floor((now.getTime() - new Date(r.due_date).getTime()) / 864e5);
        if (days <= 0) continue;
        const val = Number(r.total ?? 0);
        if      (days <= 14) { ageRows[0].count++; ageRows[0].total += val; }
        else if (days <= 30) { ageRows[1].count++; ageRows[1].total += val; }
        else if (days <= 60) { ageRows[2].count++; ageRows[2].total += val; }
        else                 { ageRows[3].count++; ageRows[3].total += val; }
      }
      setAging(ageRows);

      /* Avg payment days */
      const paidWithDates = rows.filter((r): r is InvoiceRow & { paid_at: string } =>
        r.status === "paid" && !!r.paid_at && !!r.issue_date,
      );
      if (paidWithDates.length > 0) {
        const sum = paidWithDates.reduce((s, r) =>
          s + (new Date(r.paid_at).getTime() - new Date(r.issue_date).getTime()) / 864e5, 0);
        setAvgPayDays(Math.round(sum / paidWithDates.length));
      }

      setLoading(false);
    }
    load();
  }, []);

  const kpis = useMemo(() => {
    const paidTotal    = monthly.reduce((s, p) => s + p.paid, 0);
    const overdueTotal = aging.reduce((s, r) => s + r.total, 0);
    const overdueCount = aging.reduce((s, r) => s + r.count, 0);
    const peakMonth    = monthly.reduce((best, p) => (p.paid > best.paid ? p : best), { month: "–", paid: 0 });
    return { paidTotal, overdueTotal, overdueCount, peakMonth };
  }, [monthly, aging]);

  /* ── Animated KPI values ──────────────────────────── */
  const animPaidTotal    = useCountUp(kpis.paidTotal);
  const animOverdueTotal = useCountUp(kpis.overdueTotal);
  const animAvgPayDays   = useCountUp(avgPayDays ?? 0);
  const animReminderCount = useCountUp(reminderCount);

  /* ── Render ──────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Loader2 style={{ width: 20, height: 20, color: "var(--text-3)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-elevated" style={{ padding: "24px", color: "var(--danger)" }}>
        Fehler beim Laden: {error}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>

      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-1)", marginBottom: "4px" }}>
          Statistiken
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
          Umsatztrend, Statusverteilung und Überfälligkeits-Analyse der letzten 12 Monate.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="reveal-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        <KpiCard
          title="Umsatz (12 Monate)"
          value={formatCurrency(animPaidTotal)}
          sub={kpis.peakMonth.paid > 0 ? `Bestes Monat: ${kpis.peakMonth.month}` : undefined}
          icon={TrendingUp} color="#00A060" bg="rgba(0,160,96,0.08)" delay={0}
        />
        <KpiCard
          title="Überfällig (Betrag)"
          value={formatCurrency(animOverdueTotal)}
          sub={`${kpis.overdueCount} Rechnung${kpis.overdueCount !== 1 ? "en" : ""} überfällig`}
          icon={AlertTriangle} color="#CC2020" bg="rgba(204,32,32,0.08)" delay={80}
        />
        <KpiCard
          title="Ø Zahlungsdauer"
          value={avgPayDays !== null ? `${animAvgPayDays} Tage` : "–"}
          sub={avgPayDays !== null ? (avgPayDays <= 14 ? "Sehr gut" : avgPayDays <= 30 ? "Gut" : "Langsam") : "Noch keine Daten"}
          icon={Clock} color="#CC7000" bg="rgba(204,112,0,0.08)" delay={160}
        />
        <KpiCard
          title="Erinnerungen gesendet"
          value={String(animReminderCount)}
          sub="Gesamt alle Rechnungen"
          icon={Send} color="#0040CC" bg="rgba(0,64,204,0.08)" delay={240}
        />
      </div>

      {/* Revenue Line Chart */}
      <div className="card-elevated anim-fade-in-up" style={{ padding: "24px", animationDelay: "200ms" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)" }}>Umsatz pro Monat</p>
            <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>Bezahlte Rechnungen, letzte 12 Monate</p>
          </div>
          <BarChart3 size={16} color="var(--text-3)" />
        </div>
        {monthly.every((m) => m.paid === 0) ? (
          <div style={{ height: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <BarChart3 size={28} color="var(--text-3)" />
            <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Noch keine Umsatzdaten vorhanden</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#9898AA", fontSize: 11 }}
                axisLine={{ stroke: "rgba(0,0,0,0.06)" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                tick={{ fill: "#9898AA", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(v: number) => [formatCurrency(v), "Bezahlt"]}
              />
              <Line
                type="monotone"
                dataKey="paid"
                stroke="#0040CC"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#0040CC", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#0040CC", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom row: Pie + Aging */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>

        {/* Status Pie */}
        <div className="card-elevated anim-fade-in-up" style={{ padding: "24px", animationDelay: "350ms" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)", marginBottom: "4px" }}>Statusverteilung</p>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "20px" }}>Anzahl Rechnungen je Status</p>
          {statusData.length === 0 ? (
            <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Keine Daten</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle.contentStyle}
                  itemStyle={tooltipStyle.itemStyle}
                />
                <Legend
                  iconType="square"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 12, color: "#5c5c6e" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Overdue Aging Bar */}
        <div className="card-elevated anim-fade-in-up" style={{ padding: "24px", animationDelay: "500ms" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)", marginBottom: "4px" }}>Überfälligkeits-Analyse</p>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "20px" }}>Ausstehende Beträge nach Alter</p>
          {aging.every((a) => a.total === 0) ? (
            <div style={{ height: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <p style={{ fontSize: "24px" }}>✓</p>
              <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Keine überfälligen Rechnungen</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={aging} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis
                  dataKey="bucket"
                  tick={{ fill: "#9898AA", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(0,0,0,0.06)" }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fill: "#9898AA", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(v: number) => [formatCurrency(v), "Ausstehend"]}
                />
                <Bar dataKey="total" fill="#CC2020" maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Peak month insight */}
      {kpis.peakMonth.paid > 0 && (
        <div
          style={{
            background: "var(--accent-soft)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <TrendingUp size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: "13px", color: "var(--accent)" }}>
            Dein umsatzstärkster Monat:{" "}
            <strong>{kpis.peakMonth.month}</strong> mit{" "}
            <strong>{formatCurrency(kpis.peakMonth.paid)}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
