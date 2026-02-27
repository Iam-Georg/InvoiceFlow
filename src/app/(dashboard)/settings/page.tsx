"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import type { Profile } from "@/types";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

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

  const inputStyle: React.CSSProperties = {
    height: "36px",
    padding: "0 10px",
    fontSize: "13px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    background: "var(--background)",
    color: "var(--foreground)",
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
  };

  const disabledStyle: React.CSSProperties = {
    ...inputStyle,
    background: "var(--muted)",
    color: "var(--muted-foreground)",
    cursor: "not-allowed",
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
          style={disabled ? disabledStyle : inputStyle}
        />
      </div>
    );
  }

  function Section({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) {
    return (
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-xs)",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
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
            gridTemplateColumns: "1fr 1fr",
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
    <div style={{ maxWidth: "680px" }}>
      <div style={{ marginBottom: "24px" }}>
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
          Profil, Unternehmen und Rechnungsstandards.
        </p>
      </div>

      <Section title="Profil" description="Dein Name und deine Login-E-Mail.">
        <Field label="Name" k="full_name" placeholder="Max Mustermann" />
        <Field label="E-Mail" k="email" disabled />
      </Section>

      <Section
        title="Unternehmen"
        description="Erscheint auf all deinen Rechnungen."
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
        description="Voreinstellungen fuer neue Rechnungen."
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
            style={{
              padding: "8px 10px",
              fontSize: "13px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              background: "var(--background)",
              color: "var(--foreground)",
              outline: "none",
              fontFamily: "inherit",
              width: "100%",
              resize: "vertical",
              lineHeight: 1.5,
            }}
          />
        </div>
      </Section>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingBottom: "40px",
        }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 20px",
            fontSize: "13px",
            fontWeight: 600,
            background: saving ? "var(--muted)" : "var(--primary)",
            color: saving ? "var(--muted-foreground)" : "white",
            border: "none",
            borderRadius: "var(--radius)",
            cursor: saving ? "not-allowed" : "pointer",
          }}
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
    </div>
  );
}
