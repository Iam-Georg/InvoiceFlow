"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { Customer, InvoiceItem, InvoiceStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Plus, Trash2 } from "lucide-react";

interface EditInvoice {
  id: string;
  user_id: string;
  customer_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  tax_rate: number;
  notes: string | null;
  items: InvoiceItem[];
}

const EMPTY_ITEM = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: 1,
  unit_price: 0,
  total: 0,
});

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoice, setInvoice] = useState<EditInvoice | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const [{ data: inv }, { data: custs }] = await Promise.all([
        supabase
          .from("invoices")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single(),
        supabase.from("customers").select("*").eq("user_id", user.id).order("name"),
      ]);

      if (inv) {
        const parsedItems = Array.isArray(inv.items) ? (inv.items as InvoiceItem[]) : [EMPTY_ITEM()];
        setInvoice({
          id: inv.id,
          user_id: inv.user_id,
          customer_id: inv.customer_id,
          invoice_number: inv.invoice_number,
          issue_date: inv.issue_date,
          due_date: inv.due_date,
          status: inv.status,
          tax_rate: Number(inv.tax_rate ?? 0),
          notes: inv.notes,
          items: parsedItems.length > 0 ? parsedItems : [EMPTY_ITEM()],
        });
      }

      setCustomers(custs ?? []);
      setLoading(false);
    }

    load();
  }, [id, router]);

  function updateItem(itemId: string, field: keyof InvoiceItem, value: string | number) {
    if (!invoice) return;

    const nextItems = invoice.items.map((item) => {
      if (item.id !== itemId) return item;
      const next = { ...item, [field]: value };
      next.total = Number(next.quantity) * Number(next.unit_price);
      return next;
    });

    setInvoice({ ...invoice, items: nextItems });
  }

  const subtotal = useMemo(
    () => (invoice ? invoice.items.reduce((sum, item) => sum + item.total, 0) : 0),
    [invoice],
  );
  const taxAmount = useMemo(
    () => (invoice ? subtotal * (invoice.tax_rate / 100) : 0),
    [invoice, subtotal],
  );
  const total = subtotal + taxAmount;

  async function handleSave() {
    if (!invoice) return;

    if (!invoice.customer_id) {
      toast.error("Bitte einen Kunden auswählen");
      return;
    }

    if (invoice.items.length === 0 || invoice.items.some((item) => !item.description.trim())) {
      toast.error("Bitte alle Positionen vollständig ausfüllen");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("invoices")
        .update({
          customer_id: invoice.customer_id,
          invoice_number: invoice.invoice_number.trim(),
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          status: invoice.status,
          items: invoice.items,
          subtotal,
          tax_rate: invoice.tax_rate,
          tax_amount: taxAmount,
          total,
          notes: invoice.notes,
        })
        .eq("id", invoice.id)
        .eq("user_id", invoice.user_id);

      if (error) {
        toast.error(`Fehler: ${error.message}`);
        return;
      }

      toast.success("Rechnung aktualisiert");
      router.push(`/invoices/${invoice.id}`);
    } catch {
      toast.error("Unerwarteter Fehler");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <p style={{ color: "var(--muted-foreground)" }}>Rechnung nicht gefunden.</p>
        <Link href="/invoices" style={{ color: "var(--primary)", fontSize: "13px" }}>
          Zurück zur Liste
        </Link>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
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

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", display: "grid", gap: "16px" }}>
      <Link href={`/invoices/${invoice.id}`} style={{ color: "var(--muted-foreground)", fontSize: "13px", textDecoration: "none" }}>
        <ChevronLeft style={{ width: 14, height: 14, display: "inline" }} /> Zurück
      </Link>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px" }}>
        <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>Rechnung bearbeiten</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <input style={inputStyle} value={invoice.invoice_number} onChange={(e) => setInvoice({ ...invoice, invoice_number: e.target.value })} />
          <select style={inputStyle} value={invoice.customer_id} onChange={(e) => setInvoice({ ...invoice, customer_id: e.target.value })}>
            <option value="">Kunde auswählen...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input style={inputStyle} type="date" value={invoice.issue_date} onChange={(e) => setInvoice({ ...invoice, issue_date: e.target.value })} />
          <input style={inputStyle} type="date" value={invoice.due_date} onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })} />
          <select style={inputStyle} value={invoice.status} onChange={(e) => setInvoice({ ...invoice, status: e.target.value as InvoiceStatus })}>
            <option value="draft">Entwurf</option>
            <option value="sent">Gesendet</option>
            <option value="open">Offen</option>
            <option value="overdue">Überfällig</option>
            <option value="paid">Bezahlt</option>
          </select>
          <select style={inputStyle} value={invoice.tax_rate} onChange={(e) => setInvoice({ ...invoice, tax_rate: Number(e.target.value) })}>
            <option value={0}>MwSt. 0%</option>
            <option value={7}>MwSt. 7%</option>
            <option value={19}>MwSt. 19%</option>
          </select>
        </div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px" }}>
        <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>Positionen</p>
        {invoice.items.map((item) => (
          <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 90px 120px 120px 34px", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
            <input style={inputStyle} value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} />
            <input style={{ ...inputStyle, textAlign: "right" }} type="number" min={1} value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 0)} />
            <input style={{ ...inputStyle, textAlign: "right" }} type="number" min={0} step="0.01" value={item.unit_price} onChange={(e) => updateItem(item.id, "unit_price", Number(e.target.value) || 0)} />
            <span className="amount" style={{ textAlign: "right", fontSize: "13px", fontWeight: 600 }}>{formatCurrency(item.total)}</span>
            <button
              onClick={() => invoice.items.length > 1 && setInvoice({ ...invoice, items: invoice.items.filter((row) => row.id !== item.id) })}
              style={{ border: "none", background: "transparent", cursor: invoice.items.length > 1 ? "pointer" : "not-allowed", opacity: invoice.items.length > 1 ? 1 : 0.4 }}
            >
              <Trash2 style={{ width: 13, height: 13, color: "var(--destructive)" }} />
            </button>
          </div>
        ))}

        <button
          onClick={() => setInvoice({ ...invoice, items: [...invoice.items, EMPTY_ITEM()] })}
          style={{ marginTop: "6px", border: "1px solid var(--border)", background: "transparent", padding: "6px 10px", fontSize: "12px" }}
        >
          <Plus style={{ width: 12, height: 12, display: "inline" }} /> Position
        </button>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Anmerkungen</p>
        <textarea
          value={invoice.notes ?? ""}
          onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
          rows={3}
          style={{ ...inputStyle, height: "auto", resize: "vertical", padding: "10px" }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="amount" style={{ fontSize: "14px", fontWeight: 600 }}>
          Netto {formatCurrency(subtotal)} · MwSt {formatCurrency(taxAmount)} · Gesamt {formatCurrency(total)}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "8px 16px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius)", cursor: saving ? "not-allowed" : "pointer" }}
        >
          {saving ? "Speichert..." : "Speichern"}
        </button>
      </div>
    </div>
  );
}
