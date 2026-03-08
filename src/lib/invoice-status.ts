import type { InvoiceStatus } from "@/types";

/** Allowed forward-only status transitions (GoBD-compliant). */
const ALLOWED_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ["sent"],
  sent: ["open", "overdue", "paid", "cancelled"],
  open: ["overdue", "paid", "cancelled"],
  overdue: ["paid", "cancelled"],
  paid: ["cancelled"],
  cancelled: [],
};

/** Returns true if transitioning from → to is allowed. */
export function canTransition(from: InvoiceStatus, to: InvoiceStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Returns a human-readable German label for the status. */
export function statusLabel(status: InvoiceStatus): string {
  switch (status) {
    case "draft": return "Entwurf";
    case "sent": return "Gesendet";
    case "open": return "Offen";
    case "overdue": return "Überfällig";
    case "paid": return "Bezahlt";
    case "cancelled": return "Storniert";
  }
}

/** Returns true if the invoice is in a finalized (non-editable) state. */
export function isFinalized(status: InvoiceStatus): boolean {
  return status !== "draft";
}

/** Returns true if the invoice can be hard-deleted (only drafts). */
export function canDelete(status: InvoiceStatus): boolean {
  return status === "draft";
}
