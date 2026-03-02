"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import type { Profile } from "@/types";
import { toast } from "sonner";
import { Loader2, Save, Download } from "lucide-react";

interface SettingsForm {
  full_name: string;
  email: string;
  company_name: string;
  company_address: string;
  company_city: string;
  company_zip: string;
  company_country: string;
  company_tax_id: string;
  default_tax_rate: string;
  default_payment_days: string;
  default_notes: string;
}

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportYear, setExportYear] = useState(String(new Date().getFullYear()));
  const [userId, setUserId] = useState("");
  const [form, setForm] = useState<SettingsForm>({
    full_name: "",
    email: "",
    company_name: "",
    company_address: "",
    company_city: "",
    company_zip: "",
    company_country: "DE",
    company_tax_id: "",
    default_tax_rate: "19",
    default_payment_days: "14",
    default_notes: "",
  });

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      const profile = (await ensureProfile(supabase, user)) as Profile | null;
      setForm({
        full_name: profile?.full_name ?? "",
        email: user.email ?? "",
        company_name: profile?.company_name ?? "",
        company_address: profile?.company_address ?? "",
        company_city: profile?.company_city ?? "",
        company_zip: profile?.company_zip ?? "",
        company_country: profile?.company_country ?? "DE",
        company_tax_id: profile?.company_tax_id ?? "",
        default_tax_rate: String(profile?.default_tax_rate ?? "19"),
        default_payment_days: String(
          profile?.default_payment_days ?? profile?.default_payment_terms ?? 14,
        ),
        default_notes: profile?.default_notes ?? "",
      });
      setLoading(false);
    }
    load();
  }, [supabase]);

  function set(k: keyof SettingsForm, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    if (!userId) {
      toast.error("Nicht eingeloggt");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          company_name: form.company_name,
          company_address: form.company_address,
          company_city: form.company_city,
          company_zip: form.company_zip,
          company_country: form.company_country,
          company_tax_id: form.company_tax_id,
          default_tax_rate: Number(form.default_tax_rate),
          default_payment_days: Number(form.default_payment_days),
          default_notes: form.default_notes,
        })
        .eq("id", userId);
      if (error) {
        toast.error(`Fehler: ${error.message}`);
        return;
      }
      toast.success("Einstellungen gespeichert");
    } catch {
      toast.error("Unerwarteter Fehler");
    } finally {
      setSaving(false);
    }
  }

  async function exportTaxCsv() {
    setExportLoading(true);
    try {
      const response = await fetch(
        `/api/export/tax?year=${encodeURIComponent(exportYear)}`,
      );
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error || "Steuerexport fehlgeschlagen.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `steuerexport-${exportYear}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Steuerexport wurde heruntergeladen");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Steuerexport fehlgeschlagen.";
      toast.error(message);
    } finally {
      setExportLoading(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--muted-foreground)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    display: "block",
    marginBottom: "5px",
  };

  function Field({
    label,
    k,
    placeholder = "",
    type = "text",
    disabled = false,
    fullWidth = false,
  }: {
    label: string;
    k: keyof SettingsForm;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    fullWidth?: boolean;
  }) {
    return (
      <div
        style={{
          gridColumn: fullWidth ? "1 / -1" : "auto",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <label style={labelStyle}>{label}</label>
        <input
          type={type}
          placeholder={placeholder}
          value={form[k]}
          disabled={disabled}
          onChange={(e) => set(k, e.target.value)}
        />
      </div>
    );
  }

  function Section({
    title,
    description,
    children,
    columns = "1fr 1fr",
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
    columns?: string;
  }) {
    return (
      <div className="card-elevated" style={{ overflow: "hidden" }}>
        <div
          style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}
        >
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--foreground)",
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "var(--muted-foreground)",
              marginTop: "2px",
            }}
          >
            {description}
          </p>
        </div>
        <div
          style={{
            padding: "20px",
            display: "grid",
            gridTemplateColumns: columns,
            gap: "14px",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}
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
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--foreground)",
              letterSpacing: "-0.01em",
            }}
          >
            Einstellungen
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--muted-foreground)",
              marginTop: "4px",
            }}
          >
            Profil, Unternehmen, Rechnungsstandards
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? (
            <Loader2
              style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }}
            />
          ) : (
            <Save style={{ width: 14, height: 14 }} />
          )}
          {saving ? "Speichern..." : "Speichern"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Section title="Profil" description="Dein Name und deine Login-E-Mail.">
          <Field label="Name" k="full_name" placeholder="Max Mustermann" />
          <Field label="E-Mail" k="email" disabled />
        </Section>

        <Section
          title="Unternehmen"
          description="Erscheint auf all deinen Rechnungen."
          columns="1fr 2fr"
        >
          <Field
            label="Firmenname"
            k="company_name"
            placeholder="Muster GmbH"
            fullWidth
          />
          <Field
            label="Adresse"
            k="company_address"
            placeholder="Musterstrasse 1"
            fullWidth
          />
          <Field label="PLZ" k="company_zip" placeholder="10115" />
          <Field label="Stadt" k="company_city" placeholder="Berlin" />
          <Field
            label="Steuernummer / USt-IdNr."
            k="company_tax_id"
            placeholder="DE123456789"
          />
          <Field label="Land" k="company_country" placeholder="DE" />
        </Section>

        <Section
          title="Rechnungsstandards"
          description="Voreinstellungen für neue Rechnungen."
        >
          <Field
            label="Standard-MwSt. (%)"
            k="default_tax_rate"
            type="number"
            placeholder="19"
          />
          <Field
            label="Zahlungsziel (Tage)"
            k="default_payment_days"
            type="number"
            placeholder="14"
          />
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <label style={labelStyle}>Standard-Anmerkung</label>
            <textarea
              value={form.default_notes}
              onChange={(e) => set("default_notes", e.target.value)}
              placeholder="z.B. Zahlbar innerhalb von 14 Tagen ohne Abzug."
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>
        </Section>

        {/* Steuerexport */}
        <div className="card-elevated" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              Steuerexport
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "var(--muted-foreground)",
                marginTop: "2px",
              }}
            >
              CSV Export für Steuerberater.
            </p>
          </div>
          <div
            style={{
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <input
              type="number"
              value={exportYear}
              onChange={(e) => setExportYear(e.target.value)}
              min={2000}
              max={new Date().getFullYear() + 1}
              style={{ width: "100px" }}
            />
            <button
              onClick={exportTaxCsv}
              disabled={exportLoading}
              className="btn btn-secondary"
            >
              {exportLoading ? (
                <Loader2
                  style={{
                    width: 14,
                    height: 14,
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <Download style={{ width: 14, height: 14 }} />
              )}
              CSV herunterladen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
