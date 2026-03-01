"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { PLAN_LABELS, type PlanId } from "@/lib/plans";
import UpgradeModal from "./UpgradeModal";

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
              alignItems: "center",
              gap: "5px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "4px 9px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <Lock size={10} color="var(--text-2)" />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-2)" }}>
              Ab {PLAN_LABELS[requiredPlan]}
            </span>
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
