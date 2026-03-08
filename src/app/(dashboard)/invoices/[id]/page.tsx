"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Customer, Invoice, Profile, TemplateConfig } from "@/types";
import { canTransition, canDelete } from "@/lib/invoice-status";
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
  XCircle,
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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [pressure, setPressure] = useState<ReturnType<
    typeof calculatePressure
  > | null>(null);
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
    const raw = window.localStorage.getItem("faktura:email-templates:v1");
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
  const [invoiceTemplateConfig, setInvoiceTemplateConfig] = useState<TemplateConfig | undefined>(undefined);

  const TEMPLATE_STORAGE_KEY = "faktura:email-templates:v1";

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
              ? new Date(row.paid_at).getTime() >
                new Date(row.due_date).getTime()
              : false;
          return row.status === "overdue" || paidLate;
        }).length;
        const lateRatio =
          customerRows.length > 0 ? lateCount / customerRows.length : 0;

        setPressure(
          calculatePressure(inv as Invoice, reminders?.length ?? 0, lateRatio),
        );
      }

      // Load invoice template config if set
      if (inv?.template_id) {
        const { data: tpl } = await sb
          .from("invoice_templates")
          .select("config")
          .eq("id", inv.template_id)
          .single();
        if (tpl) setInvoiceTemplateConfig(tpl.config as TemplateConfig);
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
    if (!invoice || !canTransition(invoice.status, "paid")) {
      toast.error("Statuswechsel nicht erlaubt (GoBD)");
      return;
    }
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
    if (invoice?.status === "draft" && !canTransition("draft", "sent")) {
      toast.error("Statuswechsel nicht erlaubt (GoBD)");
      return;
    }
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
    if (!invoice || !canDelete(invoice.status)) {
      toast.error("Nur Entwürfe dürfen gelöscht werden (GoBD)");
      return;
    }
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

  async function cancelInvoice() {
    if (!invoice || !canTransition(invoice.status, "cancelled")) {
      toast.error("Stornierung nicht möglich (GoBD)");
      return;
    }
    setActionLoading("cancel");
    const sb = getSupabase();
    const { error } = await sb
      .from("invoices")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) {
      toast.error("Fehler beim Stornieren");
      setActionLoading(null);
      return;
    }
    setInvoice((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
    toast.success("Rechnung storniert");
    setShowCancelConfirm(false);
    setActionLoading(null);
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
          style={{ color: "var(--accent)", fontSize: "13px" }}
        >
          Zurück zur Liste
        </Link>
      </div>
    );

  const customer = invoice.customer;
  const { bg, text } = getStatusColors(invoice.status);
  const isPaid = invoice.status === "paid";
  const isCancelled = invoice.status === "cancelled";
  const isActionable = !isPaid && !isCancelled;
  const glassCardStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-md)",
  } as const;

  return (
    <div style={{ maxWidth: "920px", margin: "0 auto" }}>
      {/* Back + Actions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        <Link
          href="/invoices"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "15px",
            color: "var(--muted-foreground)",
            textDecoration: "none",
          }}
        >
          <ChevronLeft style={{ width: 15, height: 15 }} />
          Rechnungen
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            padding: "10px",
            // borderRadius: "10px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {/* GoBD: Nur Entwürfe sind bearbeitbar */}
          {invoice.status === "draft" && (
            <Link
              href={`/invoices/${invoice.id}/edit`}
              style={{ textDecoration: "none" }}
            >
              <button className="btn btn-secondary">Bearbeiten</button>
            </Link>
          )}

          {/* PDF Download */}
          {pdfReady && invoice && profile && (
            <PDFDownloadLink
              document={<InvoicePDF invoice={invoice} profile={profile} templateConfig={invoiceTemplateConfig} />}
              fileName={`${invoice.invoice_number}.pdf`}
              style={{ textDecoration: "none" }}
            >
              {({ loading: pdfLoading }) => (
                <button disabled={pdfLoading} className="btn btn-secondary">
                  <Download style={{ width: 14, height: 14 }} />
                  {pdfLoading ? "Wird erstellt..." : "PDF herunterladen"}
                </button>
              )}
            </PDFDownloadLink>
          )}

          {/* Reminder */}
          {isActionable && (
            <button
              onClick={sendReminder}
              disabled={actionLoading === "reminder"}
              className="btn btn-secondary"
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
          {isActionable && (
            <button
              onClick={() => setShowSendComposer((prev) => !prev)}
              disabled={actionLoading === "send"}
              className="btn btn-secondary"
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
          {isActionable && (
            <button
              onClick={markAsPaid}
              disabled={actionLoading === "paid"}
              className="btn btn-primary"
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

      {/* GoBD: Stornierung-Banner */}
      {isCancelled && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 20px",
            background: "var(--destructive-bg)",
            border: "1px solid var(--destructive-border)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <XCircle style={{ width: 16, height: 16, color: "var(--destructive)", flexShrink: 0 }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--destructive)" }}>
            Diese Rechnung wurde storniert und kann nicht mehr bearbeitet werden.
          </span>
        </div>
      )}

      {showSendComposer && (
        <div
          className="anim-fade-in-up"
          style={{
            marginBottom: "20px",
            ...glassCardStyle,
            padding: "20px",
            display: "grid",
            gap: "12px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--foreground)",
            }}
          >
            E-Mail-Text & Vorlagen
          </p>
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <select
              value={selectedTemplateId}
              onChange={(e) => applyTemplate(e.target.value)}
              style={{
                minHeight: "44px",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                padding: "10px 12px",
                fontSize: "14px",
                color: "var(--text-1)",
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
              className="btn btn-secondary"
            >
              Vorlage speichern
            </button>
          </div>
          <input
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Betreff"
            style={{
              minHeight: "44px",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              padding: "10px 12px",
              fontSize: "14px",
              color: "var(--text-1)",
              width: "100%",
            }}
          />
          <textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            rows={8}
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface)",
              padding: "10px 12px",
              fontSize: "14px",
              color: "var(--text-1)",
              width: "100%",
              resize: "vertical",
              lineHeight: 1.5,
            }}
          />
          <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
            Verfügbare Platzhalter:{" "}
            {`{{invoice_number}}, {{customer_name}}, {{issue_date}}, {{due_date}}, {{total}}, {{sender_name}}`}
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={sendInvoice}
              disabled={actionLoading === "send"}
              className="btn btn-primary"
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
              E-Mail mit PDF senden
            </button>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div
        style={{
          ...glassCardStyle,
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
                  // borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  background: bg,
                  color: text,
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
              <span
                style={{ fontSize: "13px", color: "var(--muted-foreground)" }}
              >
                –
              </span>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div style={{ padding: "0 32px 30px" }}>
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
                  background: "var(--accent)",
                }}
              >
                <span
                  style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}
                >
                  Gesamt
                </span>
                <span
                  className="amount"
                  style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}
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
                  // borderRadius: "6px",
                  background: date ? "var(--success)" : "var(--border)",
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

      {/* GoBD: Entwürfe löschen, sonst stornieren */}
      {invoice.status === "draft" && (
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
              className="btn btn-danger"
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
                className="btn btn-secondary"
              >
                Abbrechen
              </button>
              <button
                onClick={deleteInvoice}
                disabled={actionLoading === "delete"}
                className="btn btn-danger"
              >
                {actionLoading === "delete" ? "Löschen..." : "Ja, löschen"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* GoBD: Stornieren für nicht-Entwürfe */}
      {!isCancelled && invoice.status !== "draft" && (
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="btn btn-danger"
            >
              <XCircle style={{ width: 14, height: 14 }} />
              Rechnung stornieren
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
                Rechnung stornieren? Der Status wird auf &quot;Storniert&quot;
                gesetzt (GoBD-konform, keine Löschung).
              </span>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="btn btn-secondary"
              >
                Abbrechen
              </button>
              <button
                onClick={cancelInvoice}
                disabled={actionLoading === "cancel"}
                className="btn btn-danger"
              >
                {actionLoading === "cancel"
                  ? "Stornieren..."
                  : "Ja, stornieren"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
