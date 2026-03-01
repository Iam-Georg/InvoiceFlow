"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/types";
import StatusBadge from "@/components/invoices/StatusBadge";
import PressureBadge from "@/components/invoices/PressureBadge";
import { calculatePressure } from "@/lib/pressure";
import { FileText, ChevronRight, Loader2, Upload } from "lucide-react";

type InvoiceRow = Invoice & {
  customer?: { name?: string | null; email?: string | null } | null;
  pressureScore?: ReturnType<typeof calculatePressure>;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("invoices")
        .select("*, customer:customers(name, email)")
        .order("created_at", { ascending: false });

      const rows = (data as InvoiceRow[] | null) ?? [];
      const invoiceIds = rows.map((row) => row.id);

      const reminderCountByInvoice = new Map<string, number>();
      if (invoiceIds.length > 0) {
        const { data: reminders } = await supabase
          .from("reminders")
          .select("invoice_id")
          .in("invoice_id", invoiceIds);

        for (const reminder of reminders ?? []) {
          const invoiceId = String(reminder.invoice_id);
          reminderCountByInvoice.set(
            invoiceId,
            (reminderCountByInvoice.get(invoiceId) ?? 0) + 1,
          );
        }
      }

      const customerTotals = new Map<string, number>();
      const customerLates = new Map<string, number>();
      for (const row of rows) {
        const customerId = row.customer_id;
        customerTotals.set(
          customerId,
          (customerTotals.get(customerId) ?? 0) + 1,
        );

        const paidLate =
          row.status === "paid" && row.paid_at
            ? new Date(row.paid_at).getTime() > new Date(row.due_date).getTime()
            : false;
        const late = row.status === "overdue" || paidLate;
        if (late) {
          customerLates.set(
            customerId,
            (customerLates.get(customerId) ?? 0) + 1,
          );
        }
      }

      const enriched = rows.map((row) => {
        const total = customerTotals.get(row.customer_id) ?? 1;
        const late = customerLates.get(row.customer_id) ?? 0;
        const ratio = total > 0 ? late / total : 0;
        return {
          ...row,
          pressureScore: calculatePressure(
            row,
            reminderCountByInvoice.get(row.id) ?? 0,
            ratio,
          ),
        };
      });

      setInvoices(enriched);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--foreground)",
              letterSpacing: "-0.03em",
            }}
          >
            Rechnungen
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "var(--muted-foreground)",
              marginTop: "2px",
            }}
          >
            {loading
              ? "..."
              : `${invoices.length} ${invoices.length === 1 ? "Rechnung" : "Rechnungen"}`}
          </p>
        </div>
        <Link href="/invoices/import">
          <button className="btn btn-secondary" style={{ gap: "6px" }}>
            <Upload size={13} />
            Importieren
          </button>
        </Link>
      </div>

      <div className="card-elevated" style={{ overflow: "hidden" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "64px",
            }}
          >
            <Loader2
              style={{
                width: 18,
                height: 18,
                color: "var(--muted-foreground)",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
        ) : invoices.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "64px 24px",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                background: "var(--accent-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "4px",
              }}
            >
              <FileText
                style={{ width: 20, height: 20, color: "var(--accent)" }}
              />
            </div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              Noch keine Rechnungen
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--muted-foreground)",
                marginBottom: "8px",
              }}
            >
              Erstelle deine erste Rechnung in unter 30 Sekunden.
            </p>
            <Link href="/invoices/new">
              <button className="btn btn-primary">Jetzt erstellen</button>
            </Link>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 160px 120px 36px",
                padding: "10px 20px",
                borderBottom: "1px solid var(--border)",
                background: "var(--background-2)",
              }}
            >
              {["Rechnung", "Kunde", "Druck-Score", "Betrag", ""].map(
                (h, i) => (
                  <span
                    key={i}
                    className="label-caps"
                    style={{
                      textAlign:
                        i >= 3 ? ("right" as const) : ("left" as const),
                    }}
                  >
                    {h}
                  </span>
                ),
              )}
            </div>

            {invoices.map((invoice, idx) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="invoice-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr 160px 120px 36px",
                    padding: "13px 20px",
                    alignItems: "center",
                    borderBottom:
                      idx < invoices.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "var(--radius)",
                        background: "var(--accent-soft)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FileText
                        style={{
                          width: 13,
                          height: 13,
                          color: "var(--accent)",
                        }}
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
                        {invoice.invoice_number}
                      </p>
                      <StatusBadge status={invoice.status} />
                    </div>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--foreground)" }}>
                    {invoice.customer?.name ?? "-"}
                  </p>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {invoice.pressureScore ? (
                      <PressureBadge pressure={invoice.pressureScore} />
                    ) : (
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        -
                      </span>
                    )}
                  </div>
                  <p
                    className="amount"
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(invoice.total)}
                  </p>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
            ))}
          </>
        )}
      </div>
    </div>
  );
}
