export type PlanId = "free" | "starter" | "professional" | "business";

export interface PlanFeatures {
  maxInvoices: number;
  maxCustomers: number;
  maxTemplates: number;
  import: boolean;
  recurringInvoices: boolean;
  customEmail: boolean;
  customerPortal: boolean;
  aiFeatures: boolean;
  multiCurrency: boolean;
  multiLanguage: boolean;
  attachments: boolean;
  emailCcBcc: boolean;
  customerDiscount: boolean;
  creditLimit: boolean;
  multipleContacts: boolean;
  taxExemption: boolean;
  datevExport: boolean;
}

export const PLAN_FEATURES: Record<PlanId, PlanFeatures> = {
  free: {
    maxInvoices: 5,
    maxCustomers: 3,
    maxTemplates: 1,
    import: false,
    recurringInvoices: false,
    customEmail: false,
    customerPortal: false,
    aiFeatures: false,
    multiCurrency: false,
    multiLanguage: false,
    attachments: false,
    emailCcBcc: false,
    customerDiscount: false,
    creditLimit: false,
    multipleContacts: false,
    taxExemption: false,
    datevExport: false,
  },
  starter: {
    maxInvoices: Infinity,
    maxCustomers: Infinity,
    maxTemplates: 3,
    import: true,
    recurringInvoices: true,
    customEmail: true,
    customerPortal: false,
    aiFeatures: false,
    multiCurrency: false,
    multiLanguage: false,
    attachments: false,
    emailCcBcc: false,
    customerDiscount: true,
    creditLimit: false,
    multipleContacts: false,
    taxExemption: false,
    datevExport: false,
  },
  professional: {
    maxInvoices: Infinity,
    maxCustomers: Infinity,
    maxTemplates: Infinity,
    import: true,
    recurringInvoices: true,
    customEmail: true,
    customerPortal: true,
    aiFeatures: true,
    multiCurrency: true,
    multiLanguage: true,
    attachments: true,
    emailCcBcc: true,
    customerDiscount: true,
    creditLimit: true,
    multipleContacts: true,
    taxExemption: true,
    datevExport: true,
  },
  business: {
    maxInvoices: Infinity,
    maxCustomers: Infinity,
    maxTemplates: Infinity,
    import: true,
    recurringInvoices: true,
    customEmail: true,
    customerPortal: true,
    aiFeatures: true,
    multiCurrency: true,
    multiLanguage: true,
    attachments: true,
    emailCcBcc: true,
    customerDiscount: true,
    creditLimit: true,
    multipleContacts: true,
    taxExemption: true,
    datevExport: true,
  },
};

export const PLAN_LABELS: Record<PlanId, string> = {
  free:         "Free",
  starter:      "Starter",
  professional: "Professional",
  business:     "Business",
};

export const PLAN_PRICES: Record<PlanId, string> = {
  free:         "kostenlos",
  starter:      "9 €/Monat",
  professional: "19 €/Monat",
  business:     "39 €/Monat",
};

export const PLAN_ORDER: PlanId[] = ["free", "starter", "professional", "business"];

export function hasPlan(userPlan: PlanId, requiredPlan: PlanId): boolean {
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(requiredPlan);
}
