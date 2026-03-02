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
  priceValue: number;
  description: string;
  features: { text: string; included: boolean }[];
  recommended?: boolean;
}[] = [
  {
    id: "free",
    label: "Free",
    price: "0 \u20ac",
    priceValue: 0,
    description: "Kostenlos starten, keine Kreditkarte n\u00f6tig.",
    features: [
      { text: "Bis zu 3 Rechnungen/Monat", included: true },
      { text: "PDF Export", included: true },
      { text: "1 Kunde", included: true },
      { text: "E-Mail Versand", included: false },
      { text: "Automatische Erinnerungen", included: false },
      { text: "Priorit\u00e4t-Support", included: false },
    ],
  },
  {
    id: "starter",
    label: "Starter",
    price: "9 \u20ac",
    priceValue: 9,
    description: "F\u00fcr Einzelunternehmer mit geringem Volumen.",
    features: [
      { text: "Bis zu 10 Rechnungen/Monat", included: true },
      { text: "PDF Export", included: true },
      { text: "Unbegrenzte Kunden", included: true },
      { text: "E-Mail Versand", included: true },
      { text: "Automatische Erinnerungen", included: false },
      { text: "Priorit\u00e4t-Support", included: false },
    ],
  },
  {
    id: "professional",
    label: "Professional",
    price: "19 \u20ac",
    priceValue: 19,
    description: "F\u00fcr wachsende Freelancer mit Automatisierung.",
    recommended: true,
    features: [
      { text: "Unbegrenzte Rechnungen", included: true },
      { text: "PDF Export", included: true },
      { text: "Unbegrenzte Kunden", included: true },
      { text: "E-Mail Versand", included: true },
      { text: "Automatische Erinnerungen", included: true },
      { text: "Priorit\u00e4t-Support", included: true },
    ],
  },
  {
    id: "business",
    label: "Business",
    price: "39 \u20ac",
    priceValue: 39,
    description: "F\u00fcr Teams mit h\u00f6herem Volumen und Priorit\u00e4t.",
    features: [
      { text: "Alle Professional-Features", included: true },
      { text: "Steuerexport CSV", included: true },
      { text: "API-Zugang", included: true },
      { text: "Team-Verwaltung", included: true },
      { text: "Eigenes Branding", included: true },
      { text: "Dedizierter Support", included: true },
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
            color: "var(--text-2)",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text-1)",
            letterSpacing: "-0.01em",
          }}
        >
          Billing
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-2)",
            marginTop: "4px",
          }}
        >
          Aktueller Plan:{" "}
          <strong style={{ color: "var(--text-1)" }}>
            {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
          </strong>
        </p>
      </div>

      {/* Plan Cards – 4-column grid */}
      <div className="billing-grid reveal-stagger">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isFree = plan.id === "free";
          return (
            <div
              key={plan.id}
              className="card-hover"
              style={{
                background: "var(--surface)",
                border: plan.recommended
                  ? "2px solid var(--accent)"
                  : isCurrent
                    ? "1px solid var(--accent)"
                    : "1px solid var(--border)",
                boxShadow: plan.recommended
                  ? "var(--shadow-lg)"
                  : "var(--shadow-md)",
                overflow: "hidden",
                transform: plan.recommended ? "translateY(-8px)" : "none",
              }}
            >
              {/* Empfohlen Banner */}
              {plan.recommended && (
                <div
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    padding: "6px 0",
                    textAlign: "center",
                  }}
                >
                  Empfohlen
                </div>
              )}

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
                      color: "var(--text-1)",
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
                <div style={{ marginBottom: "4px" }}>
                  <span
                    style={{
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "var(--text-1)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {plan.price}
                  </span>
                  {plan.priceValue > 0 && (
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--text-3)",
                        marginLeft: "4px",
                      }}
                    >
                      /Monat
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-2)" }}>
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
                      key={f.text}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        opacity: f.included ? 1 : 0.4,
                      }}
                    >
                      <Check
                        style={{
                          width: 13,
                          height: 13,
                          color: f.included
                            ? "var(--success)"
                            : "var(--text-3)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          color: f.included
                            ? "var(--text-1)"
                            : "var(--text-3)",
                          textDecoration: f.included ? "none" : "line-through",
                        }}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent || isFree}
                  className={`btn ${isCurrent || isFree ? "btn-secondary" : "btn-primary"} ${plan.recommended && !isCurrent ? "btn-breathe" : ""}`}
                  style={{ width: "100%" }}
                >
                  <CreditCard style={{ width: 13, height: 13 }} />
                  {isCurrent
                    ? "Aktueller Plan"
                    : isFree
                      ? "Kostenlos"
                      : "Upgrade \u2013 demn\u00e4chst"}
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
          color: "var(--text-2)",
          textAlign: "center",
        }}
      >
        Bezahlung via Lemon Squeezy \u2013 demn\u00e4chst verf\u00fcgbar.
      </p>
    </div>
  );
}
