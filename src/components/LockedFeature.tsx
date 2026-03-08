"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { PLAN_LABELS, type PlanId } from "@/lib/plans";
import UpgradeModal from "./UpgradeModal";

/** Feature-specific value propositions to drive conversion. */
const VALUE_PROPS: Record<string, string> = {
  "E-Mail-Versand": "Rechnungen direkt per E-Mail senden — spart Ø 15 Min.",
  "E-Mail CC/BCC": "Kopie an Steuerberater oder Team mitsenden",
  "Wiederkehrende Rechnungen": "Automatische monatliche Rechnungen",
  "DATEV-Export": "1-Klick Steuerberater-Export",
  "KI-Entwurf": "Rechnung in 30 Sekunden aus Freitext",
  "Zahlungserinnerungen": "Automatische Mahnungen — Ø 40% schnellere Zahlung",
  "Anhänge": "Dateien direkt mit der Rechnung versenden",
  "Kreditlimit": "Zahlungsrisiken automatisch erkennen",
  "Steuerbefreiung": "Reverse-Charge und Steuerbefreiungen verwalten",
};

interface Props {
  locked: boolean;
  featureName: string;
  requiredPlan: PlanId;
  children: React.ReactNode;
}

export default function LockedFeature({ locked, featureName, requiredPlan, children }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!locked) return <>{children}</>;

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setModalOpen(true); }}
        title={`${featureName} – ab ${PLAN_LABELS[requiredPlan]} verfügbar`}
        style={{ position: "relative", cursor: "pointer", userSelect: "none" }}
      >
        <div style={{ opacity: 0.35, pointerEvents: "none" }}>
          {children}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              flexDirection: VALUE_PROPS[featureName] ? "column" : "row",
              alignItems: "center",
              gap: VALUE_PROPS[featureName] ? "2px" : "5px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: VALUE_PROPS[featureName] ? "6px 12px" : "4px 9px",
              boxShadow: "var(--shadow-sm)",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Lock size={10} color="var(--text-2)" />
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-2)" }}>
                Ab {PLAN_LABELS[requiredPlan]}
              </span>
            </div>
            {VALUE_PROPS[featureName] && (
              <span style={{ fontSize: "10px", color: "var(--text-3)", lineHeight: 1.3 }}>
                {VALUE_PROPS[featureName]}
              </span>
            )}
          </div>
        </div>
      </div>

      <UpgradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        featureName={featureName}
        requiredPlan={requiredPlan}
      />
    </>
  );
}
