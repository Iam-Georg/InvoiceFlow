"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { generateInvoiceNumber, formatCurrency } from "@/lib/utils";
import { Customer, InvoiceItem } from "@/types";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";

const emptyItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: 1,
  unit_price: 0,
  total: 0,
});

export default function NewInvoicePage() {
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);
  const [taxRate, setTaxRate] = useState(19);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("RE-2025-0001");
  const [aiDescription, setAiDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("invoice_counter")
        .eq("id", user.id)
        .single();
      if (profile)
        setInvoiceNumber(generateInvoiceNumber(profile.invoice_counter));
      const { data: custs } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .order("name");
      setCustomers(custs ?? []);
    }
    load();
  }, []);

  function updateItem(
    id: string,
    field: keyof InvoiceItem,
    value: string | number,
  ) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.total = Number(updated.quantity) * Number(updated.unit_price);
        return updated;
      }),
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  async function handleSave(status: "draft" | "sent") {
    if (!customerId) {
      toast.error("Bitte einen Kunden auswählen");
      return;
    }
    if (items.some((i) => !i.description)) {
      toast.error("Bitte alle Positionen ausfüllen");
      return;
    }
    setSaving(true);
    try {
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Nicht eingeloggt");
        router.push("/login");
        return;
      }

      const { error } = await supabase.from("invoices").insert({
        user_id: user.id,
        customer_id: customerId,
        invoice_number: invoiceNumber,
        status,
        issue_date: issueDate,
        due_date: dueDate,
        items,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        notes,
        sent_at: status === "sent" ? new Date().toISOString() : null,
      });

      if (error) {
        toast.error(`Fehler: ${error.message}`);
        return;
      }

      await getSupabase().rpc("increment_invoice_counter", { user_id_input: user.id });
      toast.success(
        status === "draft" ? "Entwurf gespeichert" : "Rechnung erstellt",
      );
      router.push("/invoices");
    } catch {
      toast.error("Unerwarteter Fehler");
    } finally {
      setSaving(false);
    }
  }

  async function applyAiDraft() {
    if (!aiDescription.trim()) {
      toast.error("Bitte eine Projektbeschreibung eingeben");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/invoice-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiDescription.trim() }),
      });
      const payload = (await res.json()) as {
        items?: Array<{ description: string; quantity: number; unit_price: number }>;
        notes?: string;
        suggested_due_days?: number;
        source?: "groq" | "heuristic";
        error?: string;
      };

      if (!res.ok || !payload.items?.length) {
        throw new Error(payload.error || "KI-Entwurf fehlgeschlagen");
      }

      const nextItems: InvoiceItem[] = payload.items.map((item) => ({
        id: crypto.randomUUID(),
        description: item.description,
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
        total: (Number(item.quantity) || 1) * (Number(item.unit_price) || 0),
      }));

      setItems(nextItems);
      if (payload.notes && !notes.trim()) {
        setNotes(payload.notes);
      }
      if (payload.suggested_due_days && Number.isFinite(payload.suggested_due_days)) {
        const d = new Date(issueDate);
        d.setDate(d.getDate() + payload.suggested_due_days);
        setDueDate(d.toISOString().split("T")[0]);
      }
      toast.success(
        payload.source === "groq"
          ? "KI-Entwurf übernommen"
          : "Entwurf aus Beschreibung erstellt",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "KI-Entwurf fehlgeschlagen";
      toast.error(message);
    } finally {
      setAiLoading(false);
    }
  }

  const inputStyle = {
    border: "1px solid var(--border)",
    background: "var(--background)",
    borderRadius: "var(--radius)",
    padding: "7px 10px",
    fontSize: "13px",
    color: "var(--foreground)",
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    height: "36px",
  };

  const labelStyle = {
    fontSize: "11px",
    fontWeight: 600 as const,
    color: "var(--muted-foreground)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    display: "block",
    marginBottom: "5px",
  };

  const card = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    boxShadow: "var(--shadow-xs)",
    overflow: "hidden",
    marginBottom: "16px",
  };

  const cardHeader = {
    padding: "14px 20px",
    borderBottom: "1px solid var(--border)",
    fontSize: "13px",
    fontWeight: 600 as const,
    color: "var(--foreground)",
  };

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      <Link
        href="/invoices"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "13px",
          color: "var(--muted-foreground)",
          textDecoration: "none",
          marginBottom: "20px",
        }}
      >
        <ChevronLeft style={{ width: 14, height: 14 }} />
        Zurück
      </Link>

      <div style={card}>
        <div style={cardHeader}>KI-Rechnungserstellung</div>
        <div style={{ padding: "20px", display: "grid", gap: "10px" }}>
          <textarea
            placeholder="Projektbeschreibung eingeben, z.B. Website-Redesign, 12h Entwicklung, 3h Beratung ..."
            value={aiDescription}
            onChange={(e) => setAiDescription(e.target.value)}
            rows={4}
            style={{
              ...inputStyle,
              height: "auto",
              resize: "vertical",
              padding: "10px 12px",
              lineHeight: 1.5,
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={applyAiDraft}
              disabled={aiLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 12px",
                fontSize: "12px",
                fontWeight: 600,
                background: "var(--primary-light)",
                color: "var(--primary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                cursor: aiLoading ? "not-allowed" : "pointer",
              }}
            >
              {aiLoading ? (
                <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
              ) : (
                <Sparkles style={{ width: 14, height: 14 }} />
              )}
              Positionen per KI erzeugen
            </button>
          </div>
        </div>
      </div>

      {/* Kopfdaten */}
      <div style={card}>
        <div style={cardHeader}>Rechnungsdetails</div>
        <div
          style={{
            padding: "20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div>
            <label style={labelStyle}>Rechnungsnummer</label>
            <input
              style={inputStyle}
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Kunde *</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              style={{ ...inputStyle }}
            >
              <option value="">Kunde auswählen...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {customers.length === 0 && (
              <Link
                href="/customers/new"
                style={{
                  fontSize: "11px",
                  color: "var(--primary)",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                + Ersten Kunden anlegen
              </Link>
            )}
          </div>
          <div>
            <label style={labelStyle}>Rechnungsdatum</label>
            <input
              type="date"
              style={inputStyle}
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Fälligkeitsdatum</label>
            <input
              type="date"
              style={inputStyle}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Positionen */}
      <div style={card}>
        <div style={cardHeader}>Positionen</div>
        <div style={{ padding: "20px" }}>
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 100px 100px 32px",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            {["Beschreibung", "Menge", "Einzelpreis", "Gesamt", ""].map(
              (h, i) => (
                <span
                  key={i}
                  style={{
                    ...labelStyle,
                    textAlign: i > 1 ? ("right" as const) : ("left" as const),
                  }}
                >
                  {h}
                </span>
              ),
            )}
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 100px 100px 32px",
                gap: "8px",
                marginBottom: "8px",
                alignItems: "center",
              }}
            >
              <input
                style={inputStyle}
                placeholder="z.B. Webdesign, Beratung..."
                value={item.description}
                onChange={(e) =>
                  updateItem(item.id, "description", e.target.value)
                }
              />
              <input
                type="number"
                min="1"
                style={{ ...inputStyle, textAlign: "right" }}
                value={item.quantity}
                onChange={(e) =>
                  updateItem(
                    item.id,
                    "quantity",
                    parseFloat(e.target.value) || 0,
                  )
                }
              />
              <input
                type="number"
                min="0"
                step="0.01"
                style={{ ...inputStyle, textAlign: "right" }}
                placeholder="0,00"
                value={item.unit_price || ""}
                onChange={(e) =>
                  updateItem(
                    item.id,
                    "unit_price",
                    parseFloat(e.target.value) || 0,
                  )
                }
              />
              <span
                className="amount"
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--foreground)",
                  textAlign: "right",
                  display: "block",
                }}
              >
                {formatCurrency(item.total)}
              </span>
              <button
                onClick={() =>
                  items.length > 1 &&
                  setItems((prev) => prev.filter((i) => i.id !== item.id))
                }
                style={{
                  background: "none",
                  border: "none",
                  cursor: items.length > 1 ? "pointer" : "default",
                  padding: "4px",
                  opacity: items.length > 1 ? 1 : 0.2,
                }}
              >
                <Trash2
                  style={{ width: 13, height: 13, color: "var(--destructive)" }}
                />
              </button>
            </div>
          ))}

          <button
            onClick={() => setItems((prev) => [...prev, emptyItem()])}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              marginTop: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 500,
              background: "transparent",
              color: "var(--primary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              cursor: "pointer",
            }}
          >
            <Plus style={{ width: 13, height: 13 }} />
            Position hinzufügen
          </button>

          {/* Totals */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              marginTop: "20px",
              paddingTop: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: "280px" }}>
                {[
                  { label: "Nettobetrag", value: formatCurrency(subtotal) },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "5px 0",
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
                    <span className="amount" style={{ fontSize: "13px" }}>
                      {value}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 0",
                    borderBottom: "1px solid var(--border)",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      MwSt.
                    </span>
                    <select
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      style={{
                        fontSize: "12px",
                        border: "1px solid var(--border)",
                        // borderRadius: "3px",
                        padding: "1px 4px",
                        background: "var(--background)",
                        color: "var(--foreground)",
                      }}
                    >
                      <option value={0}>0%</option>
                      <option value={7}>7%</option>
                      <option value={19}>19%</option>
                    </select>
                  </div>
                  <span className="amount" style={{ fontSize: "13px" }}>
                    {formatCurrency(taxAmount)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    marginTop: "8px",
                    background: "var(--primary)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    Gesamt
                  </span>
                  <span
                    className="amount"
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notizen */}
      <div style={card}>
        <div style={cardHeader}>Anmerkungen (optional)</div>
        <div style={{ padding: "20px" }}>
          <textarea
            placeholder="z.B. Zahlbar innerhalb von 14 Tagen ohne Abzug..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{
              ...inputStyle,
              height: "auto",
              resize: "vertical",
              padding: "10px 12px",
              lineHeight: "1.5",
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
          paddingBottom: "40px",
        }}
      >
        <button
          onClick={() => handleSave("draft")}
          disabled={saving}
          style={{
            padding: "8px 18px",
            fontSize: "13px",
            fontWeight: 500,
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            cursor: "pointer",
          }}
        >
          Als Entwurf speichern
        </button>
        <button
          onClick={() => handleSave("sent")}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 20px",
            fontSize: "13px",
            fontWeight: 600,
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius)",
            cursor: "pointer",
          }}
        >
          {saving && (
            <Loader2
              style={{
                width: 14,
                height: 14,
                animation: "spin 1s linear infinite",
              }}
            />
          )}
          Rechnung erstellen
        </button>
      </div>
    </div>
  );
}
