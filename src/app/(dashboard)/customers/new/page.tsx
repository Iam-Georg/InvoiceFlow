"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface CustomerForm {
  name: string;
  email: string;
  company: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

export default function NewCustomerPage() {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CustomerForm>({
    name: "",
    email: "",
    company: "",
    address: "",
    city: "",
    zip: "",
    country: "DE",
  });

  type FormField = keyof CustomerForm;
  function set(field: FormField, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name und E-Mail sind Pflichtfelder");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("Nicht eingeloggt - bitte neu anmelden");
        router.push("/login");
        return;
      }

      const { error } = await supabase.from("customers").insert({
        user_id: user.id,
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        zip: form.zip.trim() || null,
        country: form.country,
      });

      if (error) {
        toast.error(`Fehler: ${error.message}`);
        return;
      }

      toast.success("Kunde angelegt");
      router.push("/customers");
    } catch {
      toast.error("Unerwarteter Fehler - bitte erneut versuchen");
    } finally {
      setSaving(false);
    }
  }

  const field = (
    label: string,
    key: FormField,
    placeholder: string,
    required = false,
    type = "text",
    fullWidth = false,
  ) => (
    <div
      style={{
        gridColumn: fullWidth ? "1 / -1" : "auto",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <Label
        style={{
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--foreground)",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--destructive)", marginLeft: "2px" }}>*</span>
        )}
      </Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        style={{
          borderColor: "var(--border)",
          background: "var(--background)",
          fontSize: "13px",
          height: "36px",
        }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      <Link
        href="/customers"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "13px",
          color: "var(--muted-foreground)",
          textDecoration: "none",
          marginBottom: "24px",
        }}
      >
        <ChevronLeft style={{ width: 15, height: 15 }} />
        Zurueck
      </Link>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-xs)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h1
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--foreground)",
            }}
          >
            Neuer Kunde
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "var(--muted-foreground)",
              marginTop: "2px",
            }}
          >
            Felder mit * sind Pflichtfelder.
          </p>
        </div>

        <div
          style={{
            padding: "24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {field("Name", "name", "Max Mustermann", true)}
          {field("E-Mail", "email", "max@firma.de", true, "email")}
          {field("Firma", "company", "Muster GmbH", false, "text", true)}
          {field("Adresse", "address", "Musterstrasse 1", false, "text", true)}
          {field("PLZ", "zip", "10115")}
          {field("Stadt", "city", "Berlin")}
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            background: "var(--background-2)",
          }}
        >
          <Link href="/customers">
            <button
              style={{
                padding: "7px 16px",
                fontSize: "13px",
                fontWeight: 500,
                background: "transparent",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                cursor: "pointer",
              }}
            >
              Abbrechen
            </button>
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 20px",
              fontSize: "13px",
              fontWeight: 600,
              background: saving ? "var(--muted)" : "var(--primary)",
              color: saving ? "var(--muted-foreground)" : "white",
              border: "none",
              borderRadius: "var(--radius)",
              cursor: saving ? "not-allowed" : "pointer",
              transition: "background 150ms ease",
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
            {saving ? "Wird gespeichert..." : "Kunde speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}
