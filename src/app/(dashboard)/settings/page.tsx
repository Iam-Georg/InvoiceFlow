"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import type { Profile } from "@/types";
import { toast } from "sonner";
import { Loader2, Save, Download, Trash2, FileDown, Lock } from "lucide-react";
import { PLAN_FEATURES } from "@/lib/plans";
import type { PlanId } from "@/lib/plans";

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

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: "var(--muted-foreground)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  display: "block",
  marginBottom: "5px",
};

const COUNTRIES = [
  { value: "DE", label: "Deutschland" },
  { value: "AT", label: "Österreich" },
  { value: "CH", label: "Schweiz" },
  { value: "LI", label: "Liechtenstein" },
  { value: "LU", label: "Luxemburg" },
  { value: "BE", label: "Belgien" },
  { value: "NL", label: "Niederlande" },
  { value: "FR", label: "Frankreich" },
  { value: "IT", label: "Italien" },
  { value: "ES", label: "Spanien" },
  { value: "PT", label: "Portugal" },
  { value: "PL", label: "Polen" },
  { value: "CZ", label: "Tschechien" },
  { value: "DK", label: "Dänemark" },
  { value: "SE", label: "Schweden" },
  { value: "NO", label: "Norwegen" },
  { value: "FI", label: "Finnland" },
  { value: "GB", label: "Vereinigtes Königreich" },
  { value: "US", label: "Vereinigte Staaten" },
];

const PAYMENT_DAYS = [
  { value: "7", label: "7 Tage" },
  { value: "14", label: "14 Tage" },
  { value: "21", label: "21 Tage" },
  { value: "30", label: "30 Tage" },
  { value: "45", label: "45 Tage" },
  { value: "60", label: "60 Tage" },
  { value: "90", label: "90 Tage" },
];

function Field({
  label,
  k,
  value,
  onChange,
  placeholder = "",
  type = "text",
  disabled = false,
  fullWidth = false,
}: {
  label: string;
  k: keyof SettingsForm;
  value: string;
  onChange: (k: keyof SettingsForm, v: string) => void;
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
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(k, e.target.value)}
      />
    </div>
  );
}

function SelectField({
  label,
  k,
  value,
  onChange,
  options,
  fullWidth = false,
}: {
  label: string;
  k: keyof SettingsForm;
  value: string;
  onChange: (k: keyof SettingsForm, v: string) => void;
  options: { value: string; label: string }[];
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
      <select value={value} onChange={(e) => onChange(k, e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
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
          style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}
        >
          {title}
        </p>
        <p
          style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "2px" }}
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

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dataExportLoading, setDataExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [exportYear, setExportYear] = useState(String(new Date().getFullYear()));
  const exportYears = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => String(new Date().getFullYear() - i),
  );
  const [exportFormat, setExportFormat] = useState("standard");
  const [userId, setUserId] = useState("");
  const [userPlan, setUserPlan] = useState<PlanId>("free");
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
      setUserPlan((profile?.plan ?? "free") as PlanId);
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
        `/api/export/tax?year=${encodeURIComponent(exportYear)}&format=${exportFormat}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
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
      a.download = exportFormat === "datev"
        ? `EXTF_Buchungsstapel_${exportYear}.csv`
        : `steuerexport-${exportYear}.csv`;
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

  async function exportAllData() {
    setDataExportLoading(true);
    try {
      const res = await fetch("/api/account/export", {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error("Export fehlgeschlagen");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `faktura-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Datenexport wurde heruntergeladen");
    } catch {
      toast.error("Datenexport fehlgeschlagen");
    } finally {
      setDataExportLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "LÖSCHEN") return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/account/delete", { 
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Löschung fehlgeschlagen");
      }
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Löschung fehlgeschlagen";
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
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
          <Field label="Name" k="full_name" value={form.full_name} onChange={set} placeholder="Max Mustermann" />
          <Field label="E-Mail" k="email" value={form.email} onChange={set} disabled />
        </Section>

        <Section
          title="Unternehmen"
          description="Erscheint auf all deinen Rechnungen."
          columns="1fr 2fr"
        >
          <Field label="Firmenname" k="company_name" value={form.company_name} onChange={set} placeholder="Muster GmbH" fullWidth />
          <Field label="Adresse" k="company_address" value={form.company_address} onChange={set} placeholder="Musterstraße 1" fullWidth />
          <Field label="PLZ" k="company_zip" value={form.company_zip} onChange={set} placeholder="10115" />
          <Field label="Stadt" k="company_city" value={form.company_city} onChange={set} placeholder="Berlin" />
          <Field label="Steuernummer / USt-IdNr." k="company_tax_id" value={form.company_tax_id} onChange={set} placeholder="DE123456789" />
          <SelectField label="Land" k="company_country" value={form.company_country} onChange={set} options={COUNTRIES} />
        </Section>

        <Section
          title="Rechnungsstandards"
          description="Voreinstellungen für neue Rechnungen."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={labelStyle}>Standard-MwSt.</label>
            <div className="radio-pill-group">
              <input type="radio" name="defaultTaxRate" id="tax-0" value="0" checked={form.default_tax_rate === "0"} onChange={() => set("default_tax_rate", "0")} />
              <label htmlFor="tax-0">0 %</label>
              <input type="radio" name="defaultTaxRate" id="tax-7" value="7" checked={form.default_tax_rate === "7"} onChange={() => set("default_tax_rate", "7")} />
              <label htmlFor="tax-7">7 %</label>
              <input type="radio" name="defaultTaxRate" id="tax-19" value="19" checked={form.default_tax_rate === "19"} onChange={() => set("default_tax_rate", "19")} />
              <label htmlFor="tax-19">19 %</label>
            </div>
          </div>
          <SelectField label="Zahlungsziel" k="default_payment_days" value={form.default_payment_days} onChange={set} options={PAYMENT_DAYS} />
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
              CSV oder DATEV Export für Steuerberater.
            </p>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                Format
              </p>
              <div className="radio-pill-group">
                <input type="radio" name="exportFormat" id="fmt-standard" value="standard" checked={exportFormat === "standard"} onChange={() => setExportFormat("standard")} />
                <label htmlFor="fmt-standard">Standard CSV</label>
                <input
                  type="radio"
                  name="exportFormat"
                  id="fmt-datev"
                  value="datev"
                  checked={exportFormat === "datev"}
                  disabled={!PLAN_FEATURES[userPlan]?.datevExport}
                  onChange={() => setExportFormat("datev")}
                />
                <label
                  htmlFor="fmt-datev"
                  style={!PLAN_FEATURES[userPlan]?.datevExport ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                >
                  DATEV
                  {!PLAN_FEATURES[userPlan]?.datevExport && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", marginLeft: "5px", fontSize: "10px", color: "var(--muted-foreground)", fontWeight: 600 }}>
                      <Lock size={9} />
                      Pro
                    </span>
                  )}
                </label>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
              <div style={{ flex: "0 0 120px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                  Jahr
                </p>
                <select
                  value={exportYear}
                  onChange={(e) => setExportYear(e.target.value)}
                  style={{ width: "120px" }}
                >
                  {exportYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={exportTaxCsv}
                disabled={exportLoading}
                className="btn btn-secondary"
                style={{ height: "44px" }}
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
                {exportFormat === "datev" ? "DATEV" : "CSV"} herunterladen
              </button>
            </div>
          </div>
        </div>
        {/* Datenschutz */}
        <div className="card-elevated" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
              Datenschutz
            </p>
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "2px" }}>
              Datenexport und Account-Verwaltung (DSGVO Art. 17 & 20).
            </p>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Datenexport */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)" }}>
                  Alle Daten exportieren
                </p>
                <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                  Lade alle deine Daten als JSON herunter.
                </p>
              </div>
              <button
                onClick={exportAllData}
                disabled={dataExportLoading}
                className="btn btn-secondary"
              >
                {dataExportLoading ? (
                  <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                ) : (
                  <FileDown style={{ width: 14, height: 14 }} />
                )}
                Exportieren
              </button>
            </div>

            {/* Account löschen */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--danger)" }}>
                    Account löschen
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                    Alle Daten werden unwiderruflich gelöscht. Gesendete Rechnungen werden gemäß GoBD 10 Jahre aufbewahrt (anonymisiert).
                  </p>
                </div>
                {!showDeleteConfirm && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn"
                    style={{ background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger)" }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                    Löschen
                  </button>
                )}
              </div>

              {showDeleteConfirm && (
                <div style={{ marginTop: "12px", padding: "16px", background: "var(--danger-bg)", border: "1px solid var(--danger)" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--danger)", marginBottom: "8px" }}>
                    Bist du sicher? Tippe &quot;LÖSCHEN&quot; um zu bestätigen.
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder='LÖSCHEN'
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "LÖSCHEN" || deleteLoading}
                      className="btn"
                      style={{
                        background: deleteConfirmText === "LÖSCHEN" ? "var(--danger)" : "var(--danger-bg)",
                        color: deleteConfirmText === "LÖSCHEN" ? "#fff" : "var(--danger)",
                        border: "1px solid var(--danger)",
                      }}
                    >
                      {deleteLoading ? (
                        <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                      ) : (
                        <Trash2 style={{ width: 14, height: 14 }} />
                      )}
                      Endgültig löschen
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
                      className="btn btn-secondary"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}