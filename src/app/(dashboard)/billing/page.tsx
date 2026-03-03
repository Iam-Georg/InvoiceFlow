"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import type { Profile, SubscriptionPlan } from "@/types";
import { Check, CreditCard, Loader2, Minus } from "lucide-react";

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
    price: "0 €",
    priceValue: 0,
    description: "Kostenlos starten, keine Kreditkarte nötig.",
    features: [
      { text: "Bis zu 3 Rechnungen/Monat", included: true },
      { text: "PDF Export", included: true },
      { text: "1 Kunde", included: true },
      { text: "E-Mail Versand", included: false },
      { text: "Automatische Erinnerungen", included: false },
      { text: "Priorität-Support", included: false },
    ],
  },
  {
    id: "starter",
    label: "Starter",
    price: "9 €",
    priceValue: 9,
    description: "Für Einzelunternehmer mit geringem Volumen.",
    features: [
      { text: "Bis zu 10 Rechnungen/Monat", included: true },
      { text: "PDF Export", included: true },
      { text: "Unbegrenzte Kunden", included: true },
      { text: "E-Mail Versand", included: true },
      { text: "Automatische Erinnerungen", included: false },
      { text: "Priorität-Support", included: false },
    ],
  },
  {
    id: "professional",
    label: "Professional",
    price: "19 €",
    priceValue: 19,
    description: "Für wachsende Freelancer mit Automatisierung.",
    recommended: true,
    features: [
      { text: "Unbegrenzte Rechnungen", included: true },
      { text: "PDF Export", included: true },
      { text: "Unbegrenzte Kunden", included: true },
      { text: "E-Mail Versand", included: true },
      { text: "Automatische Erinnerungen", included: true },
      { text: "Priorität-Support", included: true },
    ],
  },
  {
    id: "business",
    label: "Business",
    price: "39 €",
    priceValue: 39,
    description: "Für Teams mit höherem Volumen und Priorität.",
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
      {/* Hero Header */}
      <div
        className="anim-fade-in-up"
        style={{
          marginBottom: "32px",
          textAlign: "center",
          padding: "8px 0 0",
        }}
      >
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: "var(--text-1)",
            letterSpacing: "-0.03em",
            marginBottom: "8px",
          }}
        >
          Wähle deinen Plan
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-2)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Aktueller Plan:
          <span
            style={{
              padding: "3px 10px",
              fontSize: "11px",
              fontWeight: 700,
              background: "var(--accent)",
              color: "#fff",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
          </span>
        </p>
      </div>

      {/* Plan Cards */}
      <div className="billing-grid reveal-stagger">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isFree = plan.id === "free";
          return (
            <div
              key={plan.id}
              className={`billing-card${plan.recommended ? " billing-card-recommended" : ""}`}
              style={{
                background: "var(--surface)",
                border: isCurrent
                  ? "1px solid var(--accent)"
                  : "1px solid var(--border)",
                boxShadow: "var(--shadow-md)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Card Body */}
              <div style={{ padding: "24px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Plan name + badge row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <p
                    style={{
                      fontSize: plan.recommended ? "16px" : "14px",
                      fontWeight: 700,
                      color: "var(--text-1)",
                    }}
                  >
                    {plan.label}
                  </p>
                  {plan.recommended && (
                    <span
                      className="label-caps"
                      style={{
                        color: "var(--accent)",
                        fontSize: "9px",
                      }}
                    >
                      Beliebteste Wahl
                    </span>
                  )}
                  {isCurrent && !plan.recommended && (
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

                {/* Price */}
                <div style={{ marginBottom: "16px" }}>
                  <span
                    style={{
                      fontSize: plan.recommended ? "32px" : "28px",
                      fontWeight: 700,
                      color: "var(--text-1)",
                      letterSpacing: "-0.02em",
                      fontVariantNumeric: "tabular-nums",
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

                {/* Features */}
                <ul
                  style={{
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginBottom: "16px",
                    flex: 1,
                  }}
                >
                  {plan.features.map((f) => (
                    <li
                      key={f.text}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {f.included ? (
                        <Check
                          style={{
                            width: 14,
                            height: 14,
                            color: "var(--success)",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <Minus
                          style={{
                            width: 14,
                            height: 14,
                            color: "var(--text-3)",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: "12px",
                          color: f.included
                            ? "var(--text-1)"
                            : "var(--text-3)",
                        }}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Description */}
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-3)",
                    marginBottom: "16px",
                    lineHeight: 1.5,
                  }}
                >
                  {plan.description}
                </p>

                {/* CTA */}
                <button
                  disabled={isCurrent || isFree}
                  className={
                    isCurrent
                      ? "btn btn-secondary"
                      : plan.recommended
                        ? "btn btn-primary btn-breathe"
                        : isFree
                          ? "btn btn-secondary"
                          : "btn btn-ghost"
                  }
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

      {/* Trust Footer */}
      <p
        style={{
          marginTop: "28px",
          fontSize: "12px",
          color: "var(--text-3)",
          textAlign: "center",
          letterSpacing: "0.01em",
        }}
      >
        Jederzeit kündbar · Keine versteckten Kosten · Lemon Squeezy Zahlungsabwicklung
      </p>
    </div>
  );
}
