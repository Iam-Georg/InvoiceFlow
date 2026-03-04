"use client";

import { useState, useEffect, useRef, use, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { BlobProvider } from "@react-pdf/renderer";
import InvoicePDF from "@/components/invoices/InvoicePDF";
import {
  InvoiceTemplate,
  TemplateConfig,
  DEFAULT_TEMPLATE_CONFIG,
} from "@/types";
import { ArrowLeft, Save, Upload, Star, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/* ── Preview data ─────────────────────────────────── */

const PREVIEW_INVOICE = {
  id: "preview",
  user_id: "preview",
  customer_id: "preview",
  invoice_number: "RE-2026-0042",
  status: "sent" as const,
  issue_date: "2026-03-03",
  due_date: "2026-03-17",
  items: [
    {
      id: "1",
      description: "Webdesign & Entwicklung",
      quantity: 40,
      unit_price: 95,
      total: 3800,
    },
    {
      id: "2",
      description: "SEO Optimierung",
      quantity: 1,
      unit_price: 450,
      total: 450,
    },
    {
      id: "3",
      description: "Hosting (12 Monate)",
      quantity: 12,
      unit_price: 9.99,
      total: 119.88,
    },
  ],
  subtotal: 4369.88,
  tax_rate: 19,
  tax_amount: 830.28,
  total: 5200.16,
  notes: "Zahlbar innerhalb von 14 Tagen ohne Abzug.",
  created_at: "2026-03-03",
  updated_at: "2026-03-03",
  customer: {
    id: "preview-customer",
    user_id: "preview",
    name: "Max Mustermann",
    company: "Mustermann GmbH",
    address: "Musterstraße 123",
    zip: "10115",
    city: "Berlin",
    email: "max@mustermann.de",
    created_at: "2026-01-01",
  },
};

const PREVIEW_PROFILE = {
  full_name: "Anna Schmidt",
  company_name: "Schmidt Design Studio",
  company_address: "Kreativweg 7",
  company_city: "München",
  company_zip: "80331",
  company_tax_id: "DE123456789",
  email: "anna@schmidt-design.de",
};

/* ── Layout option cards ──────────────────────────── */

const LAYOUTS: {
  value: TemplateConfig["layout"];
  label: string;
  desc: string;
}[] = [
  {
    value: "classic",
    label: "Klassisch",
    desc: "Logo links, Metadaten rechts",
  },
  { value: "modern", label: "Modern", desc: "Zentriert mit großem Header" },
  { value: "minimal", label: "Minimal", desc: "Schlicht und kompakt" },
];

const FONTS: { value: TemplateConfig["font"]; label: string }[] = [
  { value: "Helvetica", label: "Helvetica (Sans-Serif)" },
  { value: "Times-Roman", label: "Times (Serif)" },
  { value: "Courier", label: "Courier (Monospace)" },
];

/* ── Component ────────────────────────────────────── */

export default function TemplateEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [config, setConfig] = useState<TemplateConfig>(DEFAULT_TEMPLATE_CONFIG);
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [pdfKey, setPdfKey] = useState(0);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  useEffect(() => {
    async function load() {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("invoice_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Vorlage nicht gefunden");
        router.push("/invoices/templates");
        return;
      }

      const template = data as InvoiceTemplate;
      setName(template.name);
      setConfig(template.config);
      setIsDefault(template.is_default);
      setLoading(false);
    }
    load();
  }, [id, router]);

  // Debounced PDF re-render
  const triggerPreviewUpdate = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPdfKey((k) => k + 1), 400);
  }, []);

  function updateConfig(partial: Partial<TemplateConfig>) {
    setConfig((prev) => ({ ...prev, ...partial }));
    triggerPreviewUpdate();
  }

  function updateColors(partial: Partial<TemplateConfig["colors"]>) {
    setConfig((prev) => ({
      ...prev,
      colors: { ...prev.colors, ...partial },
    }));
    triggerPreviewUpdate();
  }

  async function handleSave() {
    const sb = getSupabase();
    setSaving(true);
    const { error } = await sb
      .from("invoice_templates")
      .update({
        name,
        config,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setSaving(false);
    if (error) {
      toast.error("Fehler beim Speichern");
      return;
    }
    toast.success("Vorlage gespeichert");
  }

  async function handleSetDefault() {
    const sb = getSupabase();
    await sb
      .from("invoice_templates")
      .update({ is_default: true })
      .eq("id", id);
    setIsDefault(true);
    toast.success("Als Standard gesetzt");
  }

  async function handleLogoUpload(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Datei zu groß (max. 2 MB)");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Nur Bilder erlaubt");
      return;
    }

    setLogoUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/templates/upload-logo", {
      method: "POST",
      body: formData,
    });

    setLogoUploading(false);
    if (!res.ok) {
      toast.error("Upload fehlgeschlagen");
      return;
    }

    const { url } = await res.json();
    updateConfig({ logoUrl: url });
    toast.success("Logo hochgeladen");
  }

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "64px" }}
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
    );
  }

  return (
    <div>
      {/* ── Top bar ── */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/invoices/templates">
            <button className="btn btn-ghost" style={{ padding: "6px" }}>
              <ArrowLeft size={16} />
            </button>
          </Link>
          <div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--foreground)",
                letterSpacing: "-0.03em",
              }}
            >
              Vorlage bearbeiten
            </h1>
            <p
              style={{
                fontSize: "12px",
                color: "var(--muted-foreground)",
                marginTop: "2px",
              }}
            >
              Änderungen werden in der Vorschau live angezeigt
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {!isDefault && (
            <button
              className="btn btn-secondary"
              onClick={handleSetDefault}
              style={{ gap: "6px" }}
            >
              <Star size={13} />
              Als Standard
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ gap: "6px" }}
          >
            {saving ? (
              <Loader2
                size={13}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Save size={13} />
            )}
            Speichern
          </button>
        </div>
      </div>

      {/* ── Split view ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: "20px",
          alignItems: "flex-start",
        }}
      >
        {/* ── Left: Controls ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Name */}
          <div className="card-elevated" style={{ padding: "16px" }}>
            <label
              className="label-caps"
              style={{ marginBottom: "6px", display: "block" }}
            >
              Name
            </label>
            <input
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meine Vorlage"
            />
          </div>

          {/* Colors */}
          <div className="card-elevated" style={{ padding: "16px" }}>
            <label
              className="label-caps"
              style={{ marginBottom: "12px", display: "block" }}
            >
              Farben
            </label>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {[
                ["Primärfarbe", "primary"] as const,
                ["Sekundärfarbe", "secondary"] as const,
                ["Akzentfarbe", "accent"] as const,
              ].map(([label, key]) => (
                <div
                  key={key}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <input
                    type="color"
                    value={config.colors[key]}
                    onChange={(e) => updateColors({ [key]: e.target.value })}
                    style={{
                      width: "32px",
                      height: "32px",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      cursor: "pointer",
                      padding: "2px",
                      background: "var(--background)",
                    }}
                  />
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--foreground)" }}>
                      {label}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {config.colors[key]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Font */}
          <div className="card-elevated" style={{ padding: "16px" }}>
            <label
              className="label-caps"
              style={{ marginBottom: "6px", display: "block" }}
            >
              Schriftart
            </label>
            <select
              className="input-field"
              value={config.font}
              onChange={(e) =>
                updateConfig({ font: e.target.value as TemplateConfig["font"] })
              }
            >
              {FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Layout */}
          <div className="card-elevated" style={{ padding: "16px" }}>
            <label
              className="label-caps"
              style={{ marginBottom: "10px", display: "block" }}
            >
              Layout
            </label>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {LAYOUTS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => updateConfig({ layout: l.value })}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "10px 12px",
                    border: `1.5px solid ${config.layout === l.value ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius)",
                    background:
                      config.layout === l.value
                        ? "var(--accent-soft)"
                        : "var(--background)",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color:
                        config.layout === l.value
                          ? "var(--accent)"
                          : "var(--foreground)",
                    }}
                  >
                    {l.label}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {l.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Logo */}
          <div className="card-elevated" style={{ padding: "16px" }}>
            <label
              className="label-caps"
              style={{ marginBottom: "10px", display: "block" }}
            >
              Logo
            </label>
            {config.logoUrl ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <img
                  src={config.logoUrl}
                  alt="Logo"
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "contain",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "4px",
                  }}
                />
                <button
                  className="btn btn-ghost"
                  onClick={() => updateConfig({ logoUrl: null })}
                  style={{ color: "var(--danger)", padding: "6px" }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "20px",
                  border: "1.5px dashed var(--border)",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  transition: "border-color 150ms ease",
                  gap: "6px",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoUpload(f);
                  }}
                />
                {logoUploading ? (
                  <Loader2
                    size={18}
                    style={{
                      color: "var(--muted-foreground)",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <Upload
                    size={18}
                    style={{ color: "var(--muted-foreground)" }}
                  />
                )}
                <p
                  style={{ fontSize: "12px", color: "var(--muted-foreground)" }}
                >
                  Logo hochladen (max. 2 MB)
                </p>
              </label>
            )}
          </div>

          {/* Footer text + options */}
          <div className="card-elevated" style={{ padding: "16px" }}>
            <label
              className="label-caps"
              style={{ marginBottom: "6px", display: "block" }}
            >
              Fußzeile
            </label>
            <textarea
              className="input-field"
              rows={2}
              value={config.footerText}
              onChange={(e) => updateConfig({ footerText: e.target.value })}
              placeholder="Vielen Dank für Ihr Vertrauen!"
              style={{ resize: "vertical" }}
            />
            <div
              style={{
                marginTop: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--foreground)",
                    }}
                  >
                    Steuernummer anzeigen
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--muted-foreground)",
                      marginTop: "1px",
                    }}
                  >
                    St.-Nr. im PDF-Header
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="toggle-switch"
                  checked={config.showTaxId}
                  onChange={(e) =>
                    updateConfig({ showTaxId: e.target.checked })
                  }
                />
              </label>
              <div
                style={{
                  height: "1px",
                  background: "var(--border)",
                  opacity: 0.5,
                }}
              />
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--foreground)",
                    }}
                  >
                    Zahlungsinformationen
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--muted-foreground)",
                      marginTop: "1px",
                    }}
                  >
                    Bankdaten in der Fußzeile
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="toggle-switch"
                  checked={config.showPaymentInfo}
                  onChange={(e) =>
                    updateConfig({ showPaymentInfo: e.target.checked })
                  }
                />
              </label>
            </div>
          </div>
        </div>

        {/* ── Right: Live PDF Preview ── */}
        <div
          style={{
            position: "sticky",
            top: "20px",
          }}
        >
          {/* Color accent bar */}
          <div
            style={{
              height: "3px",
              borderRadius: "2px 2px 0 0",
              background: `linear-gradient(90deg, ${config.colors.primary}, ${config.colors.accent})`,
            }}
          />
          {/* Paper container with shadow */}
          <div
            style={{
              background: "#8b8b8b",
              display: "flex",
              justifyContent: "center",
              borderRadius: "0 0 var(--radius) var(--radius)",
              // minHeight: "760px",
            }}
          >
            <BlobProvider
              key={pdfKey}
              document={
                <InvoicePDF
                  invoice={PREVIEW_INVOICE}
                  profile={PREVIEW_PROFILE}
                  templateConfig={config}
                />
              }
            >
              {({ url, loading: pdfLoading }) =>
                pdfLoading || !url ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      background: "#fff",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
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
                ) : (
                  <iframe
                    src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    style={{
                      width: "100%",
                      height: "1120px",
                      border: "none",
                      background: "#fff",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
                    }}
                    title="PDF Vorschau"
                  />
                )
              }
            </BlobProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
