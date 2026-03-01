"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Zap } from "lucide-react";
import { PLAN_LABELS, PLAN_PRICES, type PlanId } from "@/lib/plans";

interface Props {
  open: boolean;
  onClose: () => void;
  featureName: string;
  requiredPlan: PlanId;
}

export default function UpgradeModal({ open, onClose, featureName, requiredPlan }: Props) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn var(--duration-fast) var(--ease-smooth) both",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          width: "100%",
          maxWidth: "400px",
          margin: "0 16px",
          boxShadow: "var(--shadow-lg)",
          animation: "fadeInUp var(--duration-normal) var(--ease-spring) both",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px", height: "32px",
                background: "var(--accent-soft)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Zap size={14} color="var(--accent)" />
            </div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)" }}>
                Upgrade erforderlich
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "2px" }}>
                {featureName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "4px", color: "var(--text-3)",
              display: "flex", alignItems: "center", flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "16px" }}>
            Diese Funktion ist ab dem{" "}
            <strong style={{ color: "var(--text-1)" }}>{PLAN_LABELS[requiredPlan]}-Plan</strong>{" "}
            verfügbar ({PLAN_PRICES[requiredPlan]}).
          </p>

          <div
            style={{
              background: "var(--accent-soft)",
              padding: "12px 16px",
              borderLeft: "3px solid var(--accent)",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                fontSize: "11px", fontWeight: 700, color: "var(--accent)",
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px",
              }}
            >
              {PLAN_LABELS[requiredPlan]} – {PLAN_PRICES[requiredPlan]}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-2)" }}>
              Inklusive {featureName} und vieler weiterer Premium-Funktionen.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Vielleicht später
            </button>
            <button
              onClick={() => { onClose(); router.push("/billing"); }}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <Zap size={13} />
              Jetzt upgraden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
