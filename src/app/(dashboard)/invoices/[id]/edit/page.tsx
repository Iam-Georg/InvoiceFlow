"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { Customer, InvoiceItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Plus, Trash2 } from "lucide-react";

interface EditInvoice {
  id: string;
  customer_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: "draft" | "sent" | "open" | "overdue" | "paid";
  tax_rate: number;
  notes: string | null;
  items: InvoiceItem[];
}

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
      const [{ data: inv }, { data: custs }] = await Promise.all([
        supabase.from("invoices").select("*").eq("id", id).single(),
        supabase.from("customers").select("*").order("name"),
      ]);
      setInvoice((inv as EditInvoice | null) ?? null);
      setCustomers(custs ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

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

  async function handleSave() {
    if (!invoice) return;
    setSaving(true);
    const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (invoice.tax_rate / 100);
    const total = subtotal + taxAmount;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("invoices")
        .update({
          customer_id: invoice.customer_id,
          invoice_number: invoice.invoice_number,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          items: invoice.items,
          subtotal,
          tax_rate: invoice.tax_rate,
          tax_amount: taxAmount,
          total,
          notes: invoice.notes,
        })
        .eq("id", invoice.id);

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

  if (loading || !invoice) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (invoice.tax_rate / 100);
  const total = subtotal + taxAmount;

  return (
    <div style={{ maxWidth: "820px", margin: "0 auto", display: "grid", gap: "14px" }}>
      <Link href={`/invoices/${invoice.id}`} style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>
        <ChevronLeft style={{ width: 14, height: 14, display: "inline" }} /> Zurueck
      </Link>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "10px" }}>Rechnung bearbeiten</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <input value={invoice.invoice_number} onChange={(e) => setInvoice({ ...invoice, invoice_number: e.target.value })} />
          <select value={invoice.customer_id} onChange={(e) => setInvoice({ ...invoice, customer_id: e.target.value })}>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input type="date" value={invoice.issue_date} onChange={(e) => setInvoice({ ...invoice, issue_date: e.target.value })} />
          <input type="date" value={invoice.due_date} onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })} />
        </div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "10px" }}>Positionen</p>
        {invoice.items.map((item) => (
          <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 90px 110px 110px 34px", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
            <input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} />
            <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 0)} />
            <input type="number" value={item.unit_price} onChange={(e) => updateItem(item.id, "unit_price", Number(e.target.value) || 0)} />
            <span className="amount">{formatCurrency(item.total)}</span>
            <button
              onClick={() => setInvoice({ ...invoice, items: invoice.items.filter((row) => row.id !== item.id) })}
              style={{ border: "none", background: "transparent", cursor: "pointer" }}
            >
              <Trash2 style={{ width: 13, height: 13, color: "var(--destructive)" }} />
            </button>
          </div>
        ))}

        <button
          onClick={() =>
            setInvoice({
              ...invoice,
              items: [
                ...invoice.items,
                {
                  id: crypto.randomUUID(),
                  description: "",
                  quantity: 1,
                  unit_price: 0,
                  total: 0,
                },
              ],
            })
          }
          style={{ marginTop: "6px", border: "1px solid var(--border)", background: "transparent", borderRadius: "4px", padding: "6px 10px" }}
        >
          <Plus style={{ width: 12, height: 12, display: "inline" }} /> Position
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", alignItems: "center" }}>
        <div className="amount" style={{ fontSize: "14px", fontWeight: 600 }}>
          Gesamt: {formatCurrency(total)}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "8px 16px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius)" }}
        >
          {saving ? "Speichert..." : "Speichern"}
        </button>
      </div>

      <div style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>
        Netto: {formatCurrency(subtotal)} | MwSt: {formatCurrency(taxAmount)}
      </div>
    </div>
  );
}
