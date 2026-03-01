"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import type { Profile, SubscriptionPlan } from "@/types";
import { Check, CreditCard, Loader2 } from "lucide-react";

const PLANS: {
  id: SubscriptionPlan;
  label: string;
  price: string;
  description: string;
  features: string[];
}[] = [
  {
    id: "free",
    label: "Free",
    price: "0 EUR / Monat",
    description: "Kostenlos starten, keine Kreditkarte nötig.",
    features: ["Bis zu 3 Rechnungen/Monat", "PDF Export", "1 Kunde"],
  },
  {
    id: "starter",
    label: "Starter",
    price: "9 EUR / Monat",
    description: "Für Einzelunternehmer mit geringem Rechnungsvolumen.",
    features: ["Bis zu 10 Rechnungen/Monat", "PDF Export", "E-Mail Versand"],
  },
  {
    id: "professional",
    label: "Professional",
    price: "19 EUR / Monat",
    description: "Für wachsende Freelancer mit Automatisierung.",
    features: [
      "Unbegrenzte Rechnungen",
      "Automatische Erinnerungen",
      "Priorität-Support",
    ],
  },
  {
    id: "business",
    label: "Business",
    price: "39 EUR / Monat",
    description: "Für Teams mit höherem Volumen und Priorität.",
    features: [
      "Alle Professional-Features",
      "Steuerexport CSV",
      "API-Zugang",
    ],
  },
];

export default function BillingPage() {
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>("free");

  useEffect(() => {
    async function load() {
      const sb = getSupabase();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const profile = (await ensureProfile(sb, user)) as Profile | null;
      setCurrentPlan(profile?.plan ?? "free");
      setLoading(false);
    }
    load();
  }, [router]);

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
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--foreground)",
            letterSpacing: "-0.01em",
          }}
        >
          Billing
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "var(--muted-foreground)",
            marginTop: "4px",
          }}
        >
          Aktueller Plan:{" "}
          <strong style={{ color: "var(--foreground)" }}>
            {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
          </strong>
        </p>
      </div>

      {/* Plan Cards – 2×2 Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          alignItems: "start",
        }}
      >
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isFree = plan.id === "free";
          return (
            <div
              key={plan.id}
              style={{
                background: "var(--surface)",
                border: isCurrent
                  ? "1px solid var(--accent)"
                  : "1px solid var(--border)",
                boxShadow: "var(--shadow-md)",
                overflow: "hidden",
              }}
            >
              {/* Plan Header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border)",
                  background: isCurrent ? "var(--accent-soft)" : "transparent",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--foreground)",
                    }}
                  >
                    {plan.label}
                  </p>
                  {isCurrent && (
                    <span
                      style={{
                        padding: "2px 8px",
                        fontSize: "10px",
                        fontWeight: 700,
                        background: "var(--accent)",
                        color: "#fff",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      Aktiv
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: isFree ? "var(--success)" : "var(--accent)",
                    marginBottom: "4px",
                  }}
                >
                  {plan.price}
                </p>
                <p
                  style={{ fontSize: "12px", color: "var(--muted-foreground)" }}
                >
                  {plan.description}
                </p>
              </div>

              {/* Features + Button */}
              <div style={{ padding: "16px 20px" }}>
                <ul
                  style={{
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Check
                        style={{
                          width: 13,
                          height: 13,
                          color: "var(--success)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{ fontSize: "12px", color: "var(--foreground)" }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent || isFree}
                  className={isCurrent || isFree ? "btn btn-secondary" : "btn btn-primary"}
                  style={{ width: "100%" }}
                >
                  <CreditCard style={{ width: 13, height: 13 }} />
                  {isCurrent
                    ? "Aktueller Plan"
                    : isFree
                      ? "Kostenlos"
                      : "Upgrade – demnächst"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p
        style={{
          marginTop: "20px",
          fontSize: "12px",
          color: "var(--muted-foreground)",
          textAlign: "center",
        }}
      >
        Bezahlung via Lemon Squeezy – demnächst verfügbar.
      </p>
    </div>
  );
}
