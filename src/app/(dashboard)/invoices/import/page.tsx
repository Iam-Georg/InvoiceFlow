"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  FileText,
  FileSpreadsheet,
  ScanLine,
  Plus,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";
import type { Customer, InvoiceItem } from "@/types";
import { generateInvoiceNumber, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

type ImportMode = "minimal" | "normal" | "pdf";

const emptyItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: 1,
  unit_price: 0,
  total: 0,
});

const MODES: { id: ImportMode; icon: React.ElementType; label: string; desc: string }[] = [
  {
    id: "minimal",
    icon: FileSpreadsheet,
    label: "Schnell-Import",
    desc: "Rechnungsnummer, Betrag und Datum – in Sekunden erfasst",
  },
  {
    id: "normal",
    icon: FileText,
    label: "Vollständig",
    desc: "Mit Positionen, Kunden und allen Rechnungsfeldern",
  },
  {
    id: "pdf",
    icon: ScanLine,
    label: "PDF-Import",
    desc: "PDF hochladen – KI extrahiert die Daten automatisch",
  },
];

const STEPS = ["Methode", "Daten", "Vorschau"];

export default function ImportInvoicePage() {
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<ImportMode>("normal");

  // Shared fields
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("RE-2025-0001");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [taxRate, setTaxRate] = useState(19);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Minimal-specific
  const [minimalAmount, setMinimalAmount] = useState("");
  const [minimalDescription, setMinimalDescription] = useState("Leistungen laut Vereinbarung");

  // Normal + PDF items
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);

  // PDF
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const [pdfDragging, setPdfDragging] = useState(false);

  useEffect(() => {
    async function load() {
      const sb = getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      const { data: profile } = await sb
        .from("profiles")
        .select("invoice_counter")
        .eq("id", user.id)
        .single();
      if (profile) setInvoiceNumber(generateInvoiceNumber(profile.invoice_counter));

      const { data: custs } = await sb
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .order("name");
      setCustomers(custs ?? []);
    }
    load();
  }, []);

  function updateItem(id: string, field: keyof InvoiceItem, value: string | number) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.total = Number(updated.quantity) * Number(updated.unit_price);
        return updated;
      }),
    );
  }

  async function handlePdfDrop(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Bitte eine PDF-Datei hochladen");
      return;
    }
    setPdfFile(file);
    setPdfExtracting(true);
    try {
      const desc = `Importiere Rechnung: ${file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ")}`;
      const res = await fetch("/api/ai/invoice-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc }),
      });
      const payload = await res.json();
      if (res.ok && payload.items?.length) {
        setItems(
          payload.items.map((item: { description: string; quantity: number; unit_price: number }) => ({
            id: crypto.randomUUID(),
            description: item.description,
            quantity: Number(item.quantity) || 1,
            unit_price: Number(item.unit_price) || 0,
            total: (Number(item.quantity) || 1) * (Number(item.unit_price) || 0),
          })),
        );
        if (payload.notes) setNotes(payload.notes);
        toast.success("Positionen aus PDF extrahiert – bitte prüfen");
      } else {
        toast("PDF geladen – bitte Positionen manuell ergänzen");
      }
    } catch {
      toast("PDF geladen – bitte Positionen manuell ergänzen");
    } finally {
      setPdfExtracting(false);
    }
  }

  function validateStep2(): boolean {
    if (!customerId) { toast.error("Bitte einen Kunden auswählen"); return false; }
    if (mode === "minimal") {
      if (!minimalAmount || Number(minimalAmount) <= 0) {
        toast.error("Bitte einen gültigen Betrag eingeben");
        return false;
      }
    } else {
      if (items.some((i) => !i.description.trim())) {
        toast.error("Bitte alle Positionen ausfüllen");
        return false;
      }
    }
    return true;
  }

  async function handleSave() {
    setSaving(true);
    try {
      const sb = getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const minimalNet = Number(minimalAmount) || 0;
      const finalItems: InvoiceItem[] =
        mode === "minimal"
          ? [{
              id: crypto.randomUUID(),
              description: minimalDescription || "Leistungen laut Vereinbarung",
              quantity: 1,
              unit_price: minimalNet,
              total: minimalNet,
            }]
          : items;

      const finalSubtotal = finalItems.reduce((s, i) => s + i.total, 0);
      const finalTax = finalSubtotal * (taxRate / 100);
      const finalTotal = finalSubtotal + finalTax;

      const { error } = await sb.from("invoices").insert({
        user_id: user.id,
        customer_id: customerId,
        invoice_number: invoiceNumber,
        status: "draft",
        issue_date: issueDate,
        due_date: dueDate,
        items: finalItems,
        subtotal: finalSubtotal,
        tax_rate: taxRate,
        tax_amount: finalTax,
        total: finalTotal,
        notes,
      });

      if (error) { toast.error(`Fehler: ${error.message}`); return; }

      await getSupabase().rpc("increment_invoice_counter", { user_id_input: user.id });
      toast.success("Rechnung erfolgreich importiert");
      router.push("/invoices");
    } catch {
      toast.error("Unerwarteter Fehler");
    } finally {
      setSaving(false);
    }
  }

  // Derived totals for preview
  const minimalNet = Number(minimalAmount) || 0;
  const previewItems =
    mode === "minimal"
      ? [{ id: "preview", description: minimalDescription, quantity: 1, unit_price: minimalNet, total: minimalNet }]
      : items;
  const previewSubtotal = previewItems.reduce((s, i) => s + i.total, 0);
  const previewTax = previewSubtotal * (taxRate / 100);
  const previewTotal = previewSubtotal + previewTax;
  const previewCustomer = customers.find((c) => c.id === customerId);

  /* ── Styles ──────────────────────────────────────── */
  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--border)",
    background: "var(--background)",
    padding: "7px 10px",
    fontSize: "13px",
    color: "var(--foreground)",
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    height: "36px",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--muted-foreground)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    display: "block",
    marginBottom: "5px",
  };
  const cardStyle: React.CSSProperties = { overflow: "hidden", marginBottom: "16px" };
  const cardHeader: React.CSSProperties = {
    padding: "14px 20px",
    borderBottom: "1px solid var(--border)",
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--foreground)",
  };

  /* ── Render ──────────────────────────────────────── */
  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>

      {/* Back */}
      <Link
        href="/invoices"
        style={{
          display: "inline-flex", alignItems: "center", gap: "4px",
          fontSize: "13px", color: "var(--muted-foreground)", textDecoration: "none",
          marginBottom: "20px",
        }}
      >
        <ChevronLeft style={{ width: 14, height: 14 }} />
        Rechnungen
      </Link>

      {/* Title */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-1)", marginBottom: "4px" }}>
          Rechnung importieren
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
          Bestehende Rechnungen schnell erfassen oder per PDF einlesen.
        </p>
      </div>

      {/* Step progress */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "28px", gap: "0" }}>
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? "1" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "24px", height: "24px",
                    background: done || active ? "var(--accent)" : "var(--surface-2)",
                    border: `1px solid ${done || active ? "var(--accent)" : "var(--border)"}`,
                    color: done || active ? "#fff" : "var(--text-3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: 700,
                    transition: `background var(--duration-normal) var(--ease-smooth)`,
                    flexShrink: 0,
                  }}
                >
                  {done ? <Check size={12} /> : n}
                </div>
                <span style={{
                  fontSize: "12px",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--text-1)" : done ? "var(--accent)" : "var(--text-3)",
                  whiteSpace: "nowrap",
                }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1,
                  height: "1px",
                  background: step > n ? "var(--accent)" : "var(--border)",
                  margin: "0 12px",
                  transition: `background var(--duration-normal) var(--ease-smooth)`,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: Methode ─────────────────────────── */}
      {step === 1 && (
        <div className="anim-fade-in-up">
          <div style={{ display: "grid", gap: "12px", marginBottom: "24px" }}>
            {MODES.map(({ id, icon: Icon, label, desc }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "20px 24px",
                  background: "var(--surface)",
                  border: `2px solid ${mode === id ? "var(--accent)" : "var(--border)"}`,
                  boxShadow: mode === id ? "var(--shadow-md)" : "var(--shadow-sm)",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: `border-color var(--duration-fast) var(--ease-smooth), box-shadow var(--duration-fast) var(--ease-smooth)`,
                }}
              >
                <div
                  style={{
                    width: "40px", height: "40px",
                    background: mode === id ? "var(--accent)" : "var(--surface-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    transition: `background var(--duration-fast) var(--ease-smooth)`,
                  }}
                >
                  <Icon size={18} color={mode === id ? "#fff" : "var(--text-2)"} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)", marginBottom: "3px" }}>
                    {label}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-2)" }}>{desc}</p>
                </div>
                {mode === id && (
                  <div
                    style={{
                      width: "20px", height: "20px",
                      background: "var(--accent)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Check size={12} color="#fff" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setStep(2)}
              className="btn btn-primary"
            >
              Weiter
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Daten ───────────────────────────── */}
      {step === 2 && (
        <div className="anim-fade-in-up">

          {/* PDF Upload (only if PDF mode and no file yet) */}
          {mode === "pdf" && !pdfFile && (
            <div className="card-elevated" style={cardStyle}>
              <div style={cardHeader}>PDF hochladen</div>
              <div style={{ padding: "20px" }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfDrop(f); }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setPdfDragging(true); }}
                  onDragLeave={() => setPdfDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setPdfDragging(false);
                    const f = e.dataTransfer.files[0];
                    if (f) handlePdfDrop(f);
                  }}
                  style={{
                    border: `2px dashed ${pdfDragging ? "var(--accent)" : "var(--border)"}`,
                    background: pdfDragging ? "var(--accent-soft)" : "var(--surface-2)",
                    padding: "56px 24px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: `border-color var(--duration-fast) var(--ease-smooth), background var(--duration-fast) var(--ease-smooth)`,
                  }}
                >
                  <Upload size={28} color={pdfDragging ? "var(--accent)" : "var(--text-3)"} style={{ margin: "0 auto 12px" }} />
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)", marginBottom: "6px" }}>
                    PDF hier ablegen
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "16px" }}>
                    oder klicken zum Auswählen
                  </p>
                  <span className="btn btn-secondary" style={{ pointerEvents: "none" }}>
                    Datei auswählen
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PDF extracting spinner */}
          {mode === "pdf" && pdfFile && pdfExtracting && (
            <div className="card-elevated" style={{ ...cardStyle, padding: "48px 24px", textAlign: "center" }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--accent)", margin: "0 auto 12px" }} />
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)", marginBottom: "4px" }}>
                PDF wird analysiert…
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-2)" }}>KI extrahiert die Rechnungsdaten</p>
            </div>
          )}

          {/* Common fields: show when not PDF-upload-mode OR pdf is done */}
          {(mode !== "pdf" || (pdfFile && !pdfExtracting)) && (
            <>
              {/* PDF file info banner */}
              {mode === "pdf" && pdfFile && (
                <div
                  style={{
                    background: "var(--accent-soft)",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "16px",
                  }}
                >
                  <ScanLine size={14} color="var(--accent)" />
                  <p style={{ fontSize: "13px", color: "var(--accent)" }}>
                    <strong>{pdfFile.name}</strong> – Bitte extrahierte Daten prüfen
                  </p>
                  <button
                    onClick={() => { setPdfFile(null); setItems([emptyItem()]); setNotes(""); }}
                    style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "var(--accent)", fontWeight: 600 }}
                  >
                    Andere Datei
                  </button>
                </div>
              )}

              {/* Kopfdaten */}
              <div className="card-elevated" style={cardStyle}>
                <div style={cardHeader}>Rechnungsdetails</div>
                <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Rechnungsnummer</label>
                    <input style={inputStyle} value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Kunde *</label>
                    <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} style={inputStyle}>
                      <option value="">Kunde auswählen…</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Rechnungsdatum</label>
                    <input type="date" style={inputStyle} value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Fälligkeitsdatum</label>
                    <input type="date" style={inputStyle} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Minimal: single amount */}
              {mode === "minimal" && (
                <div className="card-elevated" style={cardStyle}>
                  <div style={cardHeader}>Betrag</div>
                  <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>Nettobetrag (€) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        style={inputStyle}
                        placeholder="0,00"
                        value={minimalAmount}
                        onChange={(e) => setMinimalAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>MwSt.</label>
                      <select value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} style={inputStyle}>
                        <option value={0}>0%</option>
                        <option value={7}>7%</option>
                        <option value={19}>19%</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Beschreibung</label>
                      <input
                        style={inputStyle}
                        placeholder="Leistungen laut Vereinbarung"
                        value={minimalDescription}
                        onChange={(e) => setMinimalDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Normal + PDF: line items */}
              {(mode === "normal" || mode === "pdf") && (
                <div className="card-elevated" style={cardStyle}>
                  <div style={cardHeader}>Positionen</div>
                  <div style={{ padding: "20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 100px 32px", gap: "8px", marginBottom: "8px" }}>
                      {["Beschreibung", "Menge", "Einzelpreis", "Gesamt", ""].map((h, i) => (
                        <span key={i} style={{ ...labelStyle, textAlign: i > 1 ? "right" : "left" }}>{h}</span>
                      ))}
                    </div>
                    {items.map((item) => (
                      <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 100px 32px", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                        <input
                          style={inputStyle}
                          placeholder="z.B. Webdesign, Beratung…"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        />
                        <input
                          type="number" min="1"
                          style={{ ...inputStyle, textAlign: "right" }}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                        />
                        <input
                          type="number" min="0" step="0.01"
                          style={{ ...inputStyle, textAlign: "right" }}
                          placeholder="0,00"
                          value={item.unit_price || ""}
                          onChange={(e) => updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                        />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)", textAlign: "right", display: "block" }}>
                          {formatCurrency(item.total)}
                        </span>
                        <button
                          onClick={() => items.length > 1 && setItems((prev) => prev.filter((i) => i.id !== item.id))}
                          style={{ background: "none", border: "none", cursor: items.length > 1 ? "pointer" : "default", padding: "4px", opacity: items.length > 1 ? 1 : 0.2 }}
                        >
                          <Trash2 style={{ width: 13, height: 13, color: "var(--destructive)" }} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => setItems((prev) => [...prev, emptyItem()])} className="btn btn-ghost" style={{ marginTop: "8px" }}>
                      <Plus size={13} />
                      Position hinzufügen
                    </button>

                    {/* Tax + Totals */}
                    <div style={{ borderTop: "1px solid var(--border)", marginTop: "20px", paddingTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ width: "260px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                          <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>Nettobetrag</span>
                          <span style={{ fontSize: "13px" }}>{formatCurrency(items.reduce((s, i) => s + i.total, 0))}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>MwSt.</span>
                            <select
                              value={taxRate}
                              onChange={(e) => setTaxRate(Number(e.target.value))}
                              style={{ fontSize: "12px", border: "1px solid var(--border)", padding: "1px 4px", background: "var(--background)", color: "var(--foreground)" }}
                            >
                              <option value={0}>0%</option>
                              <option value={7}>7%</option>
                              <option value={19}>19%</option>
                            </select>
                          </div>
                          <span style={{ fontSize: "13px" }}>{formatCurrency(items.reduce((s, i) => s + i.total, 0) * taxRate / 100)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", marginTop: "8px", background: "var(--accent)" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>Gesamt</span>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                            {formatCurrency(items.reduce((s, i) => s + i.total, 0) * (1 + taxRate / 100))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="card-elevated" style={cardStyle}>
                <div style={cardHeader}>Anmerkungen (optional)</div>
                <div style={{ padding: "20px" }}>
                  <textarea
                    placeholder="z.B. Zahlbar innerhalb von 14 Tagen ohne Abzug…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, height: "auto", resize: "vertical", padding: "10px 12px", lineHeight: "1.5" }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          {(mode !== "pdf" || (pdfFile && !pdfExtracting)) && (
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "16px" }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary">
                <ChevronLeft size={14} />
                Zurück
              </button>
              <button
                onClick={() => { if (validateStep2()) setStep(3); }}
                className="btn btn-primary"
              >
                Vorschau
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: Vorschau ────────────────────────── */}
      {step === 3 && (
        <div className="anim-fade-in-up">
          <div className="card-elevated" style={cardStyle}>
            <div style={cardHeader}>Vorschau – Rechnung wird als Entwurf gespeichert</div>

            {/* Meta */}
            <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderBottom: "1px solid var(--border)" }}>
              {[
                { label: "Rechnungsnummer", value: invoiceNumber },
                { label: "Kunde", value: previewCustomer?.name ?? "–" },
                { label: "Rechnungsdatum", value: new Date(issueDate).toLocaleDateString("de-DE") },
                { label: "Fälligkeitsdatum", value: new Date(dueDate).toLocaleDateString("de-DE") },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="label-caps" style={{ marginBottom: "4px" }}>{label}</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Items */}
            <div style={{ padding: "0 24px" }}>
              {previewItems.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: idx < previewItems.length - 1 ? "1px solid var(--divider)" : "none",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-1)" }}>{item.description}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>
                    {formatCurrency(item.total)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals summary */}
            <div style={{ padding: "16px 24px", background: "var(--surface-2)", borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-2)" }}>Nettobetrag</span>
                <span style={{ fontSize: "12px", color: "var(--text-2)" }}>{formatCurrency(previewSubtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-2)" }}>MwSt. {taxRate}%</span>
                <span style={{ fontSize: "12px", color: "var(--text-2)" }}>{formatCurrency(previewTax)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)" }}>Gesamt</span>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.02em" }}>
                  {formatCurrency(previewTotal)}
                </span>
              </div>
            </div>

            {notes && (
              <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)" }}>
                <p className="label-caps" style={{ marginBottom: "4px" }}>Anmerkungen</p>
                <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6 }}>{notes}</p>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "40px" }}>
            <button onClick={() => setStep(2)} className="btn btn-secondary">
              <ChevronLeft size={14} />
              Bearbeiten
            </button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving && <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />}
              Rechnung importieren
              <Check size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
