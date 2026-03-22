"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Check } from "lucide-react";

interface Step {
  label: string;
  href: string;
  done: boolean;
}

export default function OnboardingBanner() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { count: customerCount }, { count: invoiceCount }] =
        await Promise.all([
          supabase.from("profiles").select("company_name").eq("id", user.id).single(),
          supabase.from("customers").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("invoices").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        ]);

      setSteps([
        { label: "Unternehmen einrichten", href: "/settings", done: !!profile?.company_name },
        { label: "Ersten Kunden anlegen", href: "/customers/new", done: (customerCount ?? 0) > 0 },
        { label: "Erste Rechnung erstellen", href: "/invoices/new", done: (invoiceCount ?? 0) > 0 },
      ]);
      setLoaded(true);
    }
    check();
  }, []);

  if (!loaded || steps.every((s) => s.done)) return null;

  return (
    <div
      style={{
        padding: "16px 20px",
        background: "var(--accent-soft)",
        border: "1px solid var(--accent)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)" }}>
        Erste Schritte
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {steps.map((step) => (
          <Link
            key={step.href}
            href={step.done ? "#" : step.href}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                background: step.done ? "var(--success-bg)" : "var(--surface)",
                border: `1px solid ${step.done ? "var(--success)" : "var(--border)"}`,
                cursor: step.done ? "default" : "pointer",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: step.done ? "var(--success)" : "var(--surface-2)",
                  flexShrink: 0,
                }}
              >
                {step.done ? (
                  <Check size={11} style={{ color: "#fff" }} strokeWidth={3} />
                ) : (
                  <div style={{ width: "6px", height: "6px", background: "var(--accent)", borderRadius: "50%" }} />
                )}
              </div>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: step.done ? "var(--success)" : "var(--text-1)",
                  textDecoration: step.done ? "line-through" : "none",
                }}
              >
                {step.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
