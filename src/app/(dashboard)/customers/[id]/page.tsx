"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import {
  formatCurrency,
  formatDate,
  getStatusColors,
  getStatusLabel,
} from "@/lib/utils";
import type { Customer, Invoice } from "@/types";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Save,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import LockedFeature from "@/components/LockedFeature";

interface CustomerForm {
  name: string;
  email: string;
  company: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  const { can, loading: planLoading } = usePlan();
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [discount, setDiscount] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [taxExempt, setTaxExempt] = useState(false);
  const accordionRef = useRef<HTMLDivElement>(null);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CustomerForm>({
    name: "",
    email: "",
    company: "",
    address: "",
    city: "",
    zip: "",
    country: "DE",
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const sb = getSupabase();
      const {
        data: { user },
      } = await sb.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const [{ data: cust }, { data: invs }] = await Promise.all([
        sb
          .from("customers")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single(),
        sb
          .from("invoices")
          .select("*")
          .eq("customer_id", id)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (cust) {
        setCustomer(cust);
        setForm({
          name: cust.name || "",
          email: cust.email || "",
          company: cust.company || "",
          address: cust.address || "",
          city: cust.city || "",
          zip: cust.zip || "",
          country: cust.country || "DE",
        });
      } else {
        setCustomer(null);
      }

      setInvoices(invs ?? []);
      setLoading(false);
    }

    loadData();
  }, [id, router]);

  useEffect(() => {
    const el = accordionRef.current;
    if (!el) return;
    el.style.height = accordionOpen ? `${el.scrollHeight}px` : "0px";
  }, [accordionOpen]);

  function set(field: keyof CustomerForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim() || !customer) {
      toast.error("Name und E-Mail sind Pflichtfelder");
      return;
    }

    setSaving(true);
    const sb = getSupabase();
    const { error } = await sb
      .from("customers")
      .update({
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        zip: form.zip.trim() || null,
        country: form.country.trim() || null,
      })
      .eq("id", customer.id);

    if (error) {
      toast.error(`Fehler beim Speichern: ${error.message}`);
    } else {
      toast.success("Kunde aktualisiert");
      setEditing(false);
      setCustomer((prev) => (prev ? { ...prev, ...form } : prev));
    }

    setSaving(false);
  }

  const totalBilled = useMemo(
    () => invoices.reduce((sum, inv) => sum + inv.total, 0),
    [invoices],
  );

  const totalPaid = useMemo(
    () =>
      invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.total, 0),
    [invoices],
  );

  const outstanding = totalBilled - totalPaid;

  const avgPaymentDays = useMemo(() => {
    const paid = invoices.filter((inv) => inv.status === "paid" && inv.paid_at);
    if (paid.length === 0) return null;
    const totalDays = paid.reduce((sum, inv) => {
      const issued = new Date(inv.issue_date);
      const paidDate = new Date(inv.paid_at as string);
      return (
        sum +
        Math.max(
          0,
          Math.floor(
            (paidDate.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      );
    }, 0);
    return Math.round(totalDays / paid.length);
  }, [invoices]);

  if (loading) {
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
  }

  if (!customer) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <p style={{ color: "var(--muted-foreground)" }}>
          Kunde nicht gefunden.
        </p>
        <Link
          href="/customers"
          style={{ color: "var(--accent)", fontSize: "13px" }}
        >
          Zurück zur Liste
        </Link>
      </div>
    );
  }

  const cardStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-md)",
  } as const;

  const statCards = [
    {
      label: "Gesamt berechnet",
      value: formatCurrency(totalBilled),
      icon: TrendingUp,
      iconColor: "var(--accent)",
    },
    {
      label: "Bezahlt",
      value: formatCurrency(totalPaid),
      icon: CheckCircle,
      iconColor: "var(--success)",
    },
    {
      label: "Ausstehend",
      value: formatCurrency(outstanding),
      icon: AlertTriangle,
      iconColor: "var(--danger)",
    },
    {
      label: "Ø Zahlung",
      value: avgPaymentDays !== null ? `${avgPaymentDays} Tage` : "–",
      icon: Clock,
      iconColor: "var(--text-2)",
    },
  ];

  return (
    <div style={{ maxWidth: "920px", margin: "0 auto" }}>
      {/* Zurück-Link */}
      <Link
        href="/customers"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "15px",
          color: "var(--muted-foreground)",
          textDecoration: "none",
          marginBottom: "28px",
        }}
      >
        <ChevronLeft style={{ width: 15, height: 15 }} />
        Kunden
      </Link>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {statCards.map(({ label, value, icon: Icon, iconColor }) => (
          <div key={label} style={{ ...cardStyle, padding: "16px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span className="label-caps">{label}</span>
              <Icon style={{ width: 14, height: 14, color: iconColor }} />
            </div>
            <p
              className="amount"
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--foreground)",
                letterSpacing: "-0.02em",
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Zwei Spalten */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 2fr",
          gap: "16px",
          alignItems: "start",
        }}
      >
        {/* Links: Kundendaten */}
        <div style={{ ...cardStyle, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              Kundendaten
            </p>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn btn-secondary"
              >
                Bearbeiten
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      name: customer.name || "",
                      email: customer.email || "",
                      company: customer.company || "",
                      address: customer.address || "",
                      city: customer.city || "",
                      zip: customer.zip || "",
                      country: customer.country || "DE",
                    });
                  }}
                  className="btn btn-secondary"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? (
                    <Loader2
                      style={{
                        width: 14,
                        height: 14,
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  ) : (
                    <Save style={{ width: 14, height: 14 }} />
                  )}
                  {saving ? "Speichern..." : "Speichern"}
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              padding: "20px 24px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div>
              <p className="label-caps" style={{ marginBottom: "6px" }}>
                Name *
              </p>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Max Mustermann"
                disabled={!editing}
              />
            </div>
            <div>
              <p className="label-caps" style={{ marginBottom: "6px" }}>
                E-Mail *
              </p>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="max@firma.de"
                disabled={!editing}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <p className="label-caps" style={{ marginBottom: "6px" }}>
                Firma
              </p>
              <input
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="Muster GmbH"
                disabled={!editing}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <p className="label-caps" style={{ marginBottom: "6px" }}>
                Adresse
              </p>
              <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Musterstraße 1"
                disabled={!editing}
              />
            </div>
            <div>
              <p className="label-caps" style={{ marginBottom: "6px" }}>
                PLZ
              </p>
              <input
                value={form.zip}
                onChange={(e) => set("zip", e.target.value)}
                placeholder="10115"
                disabled={!editing}
              />
            </div>
            <div>
              <p className="label-caps" style={{ marginBottom: "6px" }}>
                Stadt
              </p>
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Berlin"
                disabled={!editing}
              />
            </div>
            <div>
              <p className="label-caps" style={{ marginBottom: "6px" }}>
                Land
              </p>
              <input
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                placeholder="DE"
                disabled={!editing}
              />
            </div>
          </div>

          {/* Erweiterte Einstellungen – nur ab Starter */}
          {!planLoading && can("starter") && (
            <>
              <button
                className="accordion-trigger"
                aria-expanded={accordionOpen}
                onClick={() => setAccordionOpen((o) => !o)}
              >
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
                  Erweiterte Einstellungen
                </span>
                <ChevronDown size={14} className="accordion-chevron" />
              </button>

              <div ref={accordionRef} className="accordion-content">
                <div
                  style={{
                    padding: "20px 24px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  {/* Kundenrabatt – ab Starter */}
                  <div>
                    <p className="label-caps" style={{ marginBottom: "6px" }}>Kundenrabatt (%)</p>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      placeholder="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      disabled={!editing}
                    />
                  </div>

                  {/* Kreditlimit – ab Professional */}
                  <div>
                    <p className="label-caps" style={{ marginBottom: "6px" }}>Kreditlimit (€)</p>
                    <LockedFeature
                      locked={!can("professional")}
                      featureName="Kreditlimit"
                      requiredPlan="professional"
                    >
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="0"
                        value={creditLimit}
                        onChange={(e) => setCreditLimit(e.target.value)}
                        disabled={!editing}
                      />
                    </LockedFeature>
                  </div>

                  {/* Steuerbefreiung – ab Professional */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <LockedFeature
                      locked={!can("professional")}
                      featureName="Steuerbefreiung"
                      requiredPlan="professional"
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          cursor: editing ? "pointer" : "default",
                          fontSize: "13px",
                          color: "var(--foreground)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={taxExempt}
                          onChange={(e) => setTaxExempt(e.target.checked)}
                          disabled={!editing}
                          style={{ width: "15px", height: "15px", cursor: "inherit" }}
                        />
                        Steuerbefreit (keine MwSt. auf Rechnungen)
                      </label>
                    </LockedFeature>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Rechts: Rechnungshistorie */}
        <div style={{ ...cardStyle, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              Rechnungshistorie
            </p>
            <span
              style={{ fontSize: "11px", color: "var(--muted-foreground)" }}
            >
              {invoices.length} gesamt
            </span>
          </div>

          {invoices.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "48px 24px",
                gap: "8px",
              }}
            >
              <FileText
                style={{ width: 24, height: 24, color: "var(--text-3)" }}
              />
              <p
                style={{ fontSize: "13px", color: "var(--muted-foreground)" }}
              >
                Noch keine Rechnungen.
              </p>
            </div>
          ) : (
            invoices.map((inv, idx) => {
              const { bg, text } = getStatusColors(inv.status);
              return (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="invoice-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 20px",
                    textDecoration: "none",
                    borderBottom:
                      idx < invoices.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                  }}
                >
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
                        marginTop: "2px",
                      }}
                    >
                      {formatDate(inv.issue_date)}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        padding: "2px 8px",
                        fontSize: "10px",
                        fontWeight: 600,
                        background: bg,
                        color: text,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getStatusLabel(inv.status)}
                    </span>
                    <span
                      className="amount"
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--foreground)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatCurrency(inv.total)}
                    </span>
                    <ChevronRight
                      style={{ width: 13, height: 13, color: "var(--text-3)" }}
                    />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
