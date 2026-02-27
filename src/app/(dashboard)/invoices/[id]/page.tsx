"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Customer, Invoice, Profile } from "@/types";
import { calculatePressure } from "@/lib/pressure";
import { getDefaultInvoiceEmailTemplate } from "@/lib/email-templates";
import PressureBadge from "@/components/invoices/PressureBadge";
import {
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusColors,
} from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "@/components/invoices/InvoicePDF";
import {
  ChevronLeft,
  Download,
  Send,
  CheckCircle,
  Bell,
  Trash2,
  Loader2,
  User,
  Calendar,
  Hash,
  AlertCircle,
} from "lucide-react";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  type InvoiceWithRelations = Invoice & {
    customer?: Customer | null;
    sent_at?: string | null;
    paid_at?: string | null;
  };

  const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [pressure, setPressure] =
    useState<ReturnType<typeof calculatePressure> | null>(null);
  const [showSendComposer, setShowSendComposer] = useState(false);
  const [emailSubject, setEmailSubject] = useState(
    getDefaultInvoiceEmailTemplate().subject,
  );
  const [emailBody, setEmailBody] = useState(
    getDefaultInvoiceEmailTemplate().body,
  );
  const [templates, setTemplates] = useState<
    Array<{ id: string; name: string; subject: string; body: string }>
  >(() => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem("invoiceflow:email-templates:v1");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as Array<{
        id: string;
        name: string;
        subject: string;
        body: string;
      }>;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const TEMPLATE_STORAGE_KEY = "invoiceflow:email-templates:v1";

  useEffect(() => {
    async function load() {
      const sb = getSupabase();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const [{ data: inv }, { data: prof }] = await Promise.all([
        sb
          .from("invoices")
          .select("*, customer:customers(*)")
          .eq("id", id)
          .single(),
        sb.from("profiles").select("*").eq("id", user.id).single(),
      ]);
      if (inv) {
        const [{ data: reminders }, { data: customerInvoices }] =
          await Promise.all([
            sb.from("reminders").select("id").eq("invoice_id", inv.id),
            sb
              .from("invoices")
              .select("status, due_date, paid_at")
              .eq("user_id", user.id)
              .eq("customer_id", inv.customer_id),
          ]);

        const customerRows = customerInvoices ?? [];
        const lateCount = customerRows.filter((row) => {
          const paidLate =
            row.status === "paid" && row.paid_at
              ? new Date(row.paid_at).getTime() > new Date(row.due_date).getTime()
              : false;
          return row.status === "overdue" || paidLate;
        }).length;
        const lateRatio =
          customerRows.length > 0 ? lateCount / customerRows.length : 0;

        setPressure(
          calculatePressure(inv as Invoice, reminders?.length ?? 0, lateRatio),
        );
      }

      setInvoice((inv as InvoiceWithRelations | null) ?? null);
      setProfile((prof as Profile | null) ?? null);
      setLoading(false);
      // Kurz warten damit PDF-Renderer initialisiert
      setTimeout(() => setPdfReady(true), 500);
    }
    load();
  }, [id, router]);

  async function markAsPaid() {
    setActionLoading("paid");
    const sb = getSupabase();
    const { error } = await sb
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("Fehler");
      setActionLoading(null);
      return;
    }
    setInvoice((prev) =>
      prev
        ? { ...prev, status: "paid", paid_at: new Date().toISOString() }
        : prev,
    );
    toast.success("Rechnung als bezahlt markiert");
    setActionLoading(null);
  }

  async function sendReminder() {
    setActionLoading("reminder");
    const res = await fetch(`/api/invoices/${id}/remind`, { method: "POST" });
    if (!res.ok) {
      toast.error("Fehler beim Senden");
      setActionLoading(null);
      return;
    }
    toast.success("Erinnerung gesendet");
    setActionLoading(null);
  }

  async function sendInvoice() {
    setActionLoading("send");
    const res = await fetch(`/api/invoices/${id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: emailSubject, body: emailBody }),
    });
    if (!res.ok) {
      toast.error("Fehler beim Senden");
      setActionLoading(null);
      return;
    }
    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            status: prev.status === "draft" ? "sent" : prev.status,
            sent_at: new Date().toISOString(),
          }
        : prev,
    );
    toast.success("Rechnung per E-Mail gesendet");
    setShowSendComposer(false);
    setActionLoading(null);
  }

  function saveCurrentTemplate() {
    const name = window.prompt("Name der Vorlage?");
    if (!name?.trim()) return;
    const next = [
      ...templates,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        subject: emailSubject,
        body: emailBody,
      },
    ];
    setTemplates(next);
    window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(next));
    toast.success("Vorlage gespeichert");
  }

  function applyTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    const tpl = templates.find((item) => item.id === templateId);
    if (!tpl) return;
    setEmailSubject(tpl.subject);
    setEmailBody(tpl.body);
  }

  async function deleteInvoice() {
    setActionLoading("delete");
    const sb = getSupabase();
    const { error } = await sb.from("invoices").delete().eq("id", id);
    if (error) {
      toast.error("Fehler");
      setActionLoading(null);
      return;
    }
    toast.success("Rechnung gelöscht");
    router.push("/invoices");
  }

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
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

  if (!invoice)
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <p style={{ color: "var(--muted-foreground)" }}>
          Rechnung nicht gefunden.
        </p>
        <Link
          href="/invoices"
          style={{ color: "var(--primary)", fontSize: "13px" }}
        >
          Zurück zur Liste
        </Link>
      </div>
    );

  const customer = invoice.customer;
  const { bg, text } = getStatusColors(invoice.status);
  const isPaid = invoice.status === "paid";

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Back + Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <Link
          href="/invoices"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "13px",
            color: "var(--muted-foreground)",
            textDecoration: "none",
          }}
        >
          <ChevronLeft style={{ width: 15, height: 15 }} />
          Rechnungen
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href={`/invoices/${invoice.id}/edit`} style={{ textDecoration: "none" }}>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                fontSize: "13px",
                fontWeight: 500,
                background: "var(--card)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                cursor: "pointer",
              }}
            >
              Bearbeiten
            </button>
          </Link>

          {/* PDF Download */}
          {pdfReady && invoice && profile && (
            <PDFDownloadLink
              document={<InvoicePDF invoice={invoice} profile={profile} />}
              fileName={`${invoice.invoice_number}.pdf`}
              style={{ textDecoration: "none" }}
            >
              {({ loading: pdfLoading }) => (
                <button
                  disabled={pdfLoading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    fontSize: "13px",
                    fontWeight: 500,
                    background: "var(--card)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                  }}
                >
                  <Download style={{ width: 14, height: 14 }} />
                  {pdfLoading ? "Wird erstellt..." : "PDF herunterladen"}
                </button>
              )}
            </PDFDownloadLink>
          )}

          {/* Reminder */}
          {!isPaid && (
            <button
              onClick={sendReminder}
              disabled={actionLoading === "reminder"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                fontSize: "13px",
                fontWeight: 500,
                background: "var(--card)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                cursor: "pointer",
              }}
            >
              {actionLoading === "reminder" ? (
                <Loader2
                  style={{
                    width: 14,
                    height: 14,
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <Bell style={{ width: 14, height: 14 }} />
              )}
              Erinnerung senden
            </button>
          )}

          {/* Send invoice */}
          {!isPaid && (
            <button
              onClick={() => setShowSendComposer((prev) => !prev)}
              disabled={actionLoading === "send"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                fontSize: "13px",
                fontWeight: 500,
                background: "var(--card)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                cursor: "pointer",
              }}
            >
              {actionLoading === "send" ? (
                <Loader2
                  style={{
                    width: 14,
                    height: 14,
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <Send style={{ width: 14, height: 14 }} />
              )}
              {showSendComposer ? "Composer schließen" : "Rechnung senden"}
            </button>
          )}

          {/* Mark as Paid */}
          {!isPaid && (
            <button
              onClick={markAsPaid}
              disabled={actionLoading === "paid"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                fontSize: "13px",
                fontWeight: 500,
                background: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: "pointer",
              }}
            >
              {actionLoading === "paid" ? (
                <Loader2
                  style={{
                    width: 14,
                    height: 14,
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <CheckCircle style={{ width: 14, height: 14 }} />
              )}
              Als bezahlt markieren
            </button>
          )}
        </div>
      </div>

      {showSendComposer && (
        <div
          style={{
            marginBottom: "16px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "14px",
            display: "grid",
            gap: "10px",
          }}
        >
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
            E-Mail-Text & Vorlagen
          </p>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={selectedTemplateId}
              onChange={(e) => applyTemplate(e.target.value)}
              style={{
                border: "1px solid var(--border)",
                background: "var(--background)",
                borderRadius: "var(--radius)",
                padding: "7px 10px",
                fontSize: "13px",
                color: "var(--foreground)",
              }}
            >
              <option value="">Vorhandene Vorlage nutzen...</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>
            <button
              onClick={saveCurrentTemplate}
              style={{
                border: "1px solid var(--border)",
                background: "var(--card)",
                borderRadius: "var(--radius)",
                padding: "7px 10px",
                fontSize: "12px",
                color: "var(--foreground)",
                cursor: "pointer",
              }}
            >
              Vorlage speichern
            </button>
          </div>
          <input
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Betreff"
            style={{
              border: "1px solid var(--border)",
              background: "var(--background)",
              borderRadius: "var(--radius)",
              padding: "8px 10px",
              fontSize: "13px",
              color: "var(--foreground)",
              width: "100%",
            }}
          />
          <textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            rows={8}
            style={{
              border: "1px solid var(--border)",
              background: "var(--background)",
              borderRadius: "var(--radius)",
              padding: "10px",
              fontSize: "13px",
              color: "var(--foreground)",
              width: "100%",
              resize: "vertical",
              lineHeight: 1.5,
            }}
          />
          <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
            Verfügbare Platzhalter: {`{{invoice_number}}, {{customer_name}}, {{issue_date}}, {{due_date}}, {{total}}, {{sender_name}}`}
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={sendInvoice}
              disabled={actionLoading === "send"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 600,
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: actionLoading === "send" ? "not-allowed" : "pointer",
              }}
            >
              {actionLoading === "send" ? (
                <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
              ) : (
                <Send style={{ width: 14, height: 14 }} />
              )}
              E-Mail mit PDF senden
            </button>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}
      >
        {/* Invoice Header */}
        <div
          style={{
            padding: "28px 32px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--foreground)",
                  letterSpacing: "-0.02em",
                }}
              >
                {invoice.invoice_number}
              </h1>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "99px",
                  fontSize: "11px",
                  fontWeight: 600,
                  background: bg,
                  color: text,
                  ...(invoice.status === "overdue"
                    ? { animation: "overdue-pulse 2.4s ease-in-out infinite" }
                    : {}),
                }}
              >
                {getStatusLabel(invoice.status)}
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
              Erstellt am {formatDate(invoice.issue_date)} · Fällig am{" "}
              {formatDate(invoice.due_date)}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="label-caps" style={{ marginBottom: "4px" }}>
              Gesamtbetrag
            </p>
            <p
              className="amount"
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "var(--foreground)",
                letterSpacing: "-0.03em",
              }}
            >
              {formatCurrency(invoice.total)}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div
          style={{
            padding: "20px 32px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          {[
            {
              icon: User,
              label: "Kunde",
              value: customer?.name ?? "–",
              sub: customer?.email,
            },
            {
              icon: Hash,
              label: "Rechnungs-Nr.",
              value: invoice.invoice_number,
            },
            {
              icon: Calendar,
              label: "Fälligkeitsdatum",
              value: formatDate(invoice.due_date),
            },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "6px",
                }}
              >
                <Icon
                  style={{
                    width: 12,
                    height: 12,
                    color: "var(--muted-foreground)",
                  }}
                />
                <span className="label-caps">{label}</span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--foreground)",
                }}
              >
                {value}
              </p>
              {sub && (
                <p
                  style={{ fontSize: "12px", color: "var(--muted-foreground)" }}
                >
                  {sub}
                </p>
              )}
            </div>
          ))}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: "6px" }}>
              <span className="label-caps">Druck-Score</span>
            </div>
            {pressure ? (
              <PressureBadge pressure={pressure} />
            ) : (
              <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                –
              </span>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div style={{ padding: "0 32px 24px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "24px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Beschreibung", "Menge", "Einzelpreis", "Gesamt"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className="label-caps"
                      style={{
                        padding: "8px 0",
                        textAlign: i === 0 ? "left" : "right",
                        paddingRight: i < 3 ? "24px" : "0",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background:
                      i % 2 === 1 ? "var(--background-2)" : "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 24px 12px 0",
                      fontSize: "13px",
                      color: "var(--foreground)",
                    }}
                  >
                    {item.description}
                  </td>
                  <td
                    className="amount"
                    style={{
                      padding: "12px 24px 12px 0",
                      fontSize: "13px",
                      color: "var(--muted-foreground)",
                      textAlign: "right",
                    }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    className="amount"
                    style={{
                      padding: "12px 24px 12px 0",
                      fontSize: "13px",
                      color: "var(--muted-foreground)",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td
                    className="amount"
                    style={{
                      padding: "12px 0",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px",
            }}
          >
            <div style={{ width: "260px" }}>
              {[
                {
                  label: "Nettobetrag",
                  value: formatCurrency(invoice.subtotal),
                },
                {
                  label: `MwSt. ${invoice.tax_rate}%`,
                  value: formatCurrency(invoice.tax_amount),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    className="amount"
                    style={{ fontSize: "13px", color: "var(--foreground)" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  marginTop: "8px",
                  background: "var(--primary)",
                  borderRadius: "var(--radius)",
                }}
              >
                <span
                  style={{ fontSize: "13px", fontWeight: 700, color: "white" }}
                >
                  Gesamt
                </span>
                <span
                  className="amount"
                  style={{ fontSize: "15px", fontWeight: 700, color: "white" }}
                >
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div
            style={{
              margin: "0 32px 24px",
              padding: "14px 16px",
              background: "var(--background-2)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="label-caps" style={{ marginBottom: "6px" }}>
              Anmerkungen
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--foreground)",
                lineHeight: 1.6,
              }}
            >
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div
          style={{
            padding: "16px 32px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: "24px",
            background: "var(--background-2)",
          }}
        >
          {[
            { label: "Erstellt", date: invoice.created_at },
            { label: "Gesendet", date: invoice.sent_at },
            { label: "Bezahlt", date: invoice.paid_at },
          ].map(({ label, date }) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "99px",
                  background: date ? "var(--success)" : "var(--border-strong)",
                  flexShrink: 0,
                }}
              />
              <span className="label-caps">{label}:</span>
              <span
                style={{
                  fontSize: "11px",
                  color: date ? "var(--foreground)" : "var(--muted-foreground)",
                }}
              >
                {date ? formatDate(date) : "–"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Delete */}
      <div
        style={{
          marginTop: "24px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              fontSize: "13px",
              fontWeight: 500,
              background: "transparent",
              color: "var(--destructive)",
              border: "1px solid var(--destructive-border)",
              borderRadius: "var(--radius)",
              cursor: "pointer",
            }}
          >
            <Trash2 style={{ width: 14, height: 14 }} />
            Rechnung löschen
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 16px",
              background: "var(--destructive-bg)",
              border: "1px solid var(--destructive-border)",
              borderRadius: "var(--radius)",
            }}
          >
            <AlertCircle
              style={{
                width: 14,
                height: 14,
                color: "var(--destructive)",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: "13px", color: "var(--destructive)" }}>
              Wirklich löschen? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </span>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: 500,
                background: "white",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                color: "var(--foreground)",
              }}
            >
              Abbrechen
            </button>
            <button
              onClick={deleteInvoice}
              disabled={actionLoading === "delete"}
              style={{
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: 500,
                background: "var(--destructive)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: "pointer",
              }}
            >
              {actionLoading === "delete" ? "Löschen..." : "Ja, löschen"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
