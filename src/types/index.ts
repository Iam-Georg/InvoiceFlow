export type InvoiceStatus = 'draft' | 'sent' | 'open' | 'overdue' | 'paid' | 'cancelled'

export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'business'

export interface Customer {
  id: string
  user_id: string
  name: string
  email: string
  company?: string
  address?: string
  city?: string
  zip?: string
  country?: string
  created_at: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface Invoice {
  id: string
  user_id: string
  customer_id: string
  customer?: Customer
  invoice_number: string
  status: InvoiceStatus
  issue_date: string
  due_date: string
  items: InvoiceItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes?: string
  sent_at?: string
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  invoice_id: string
  sent_at: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  company_name?: string
  company_address?: string
  company_city?: string
  company_zip?: string
  company_country?: string
  company_tax_id?: string
  logo_url?: string
  plan: SubscriptionPlan
  stripe_customer_id?: string
  default_tax_rate?: number
  default_payment_days?: number
  default_payment_terms?: number
  default_notes?: string
  invoice_counter?: number
  role?: string
  created_at: string
}

/* ── Template Builder ─────────────────────────────── */

export interface TemplateColors {
  primary: string
  secondary: string
  accent: string
}

export interface TemplateConfig {
  colors: TemplateColors
  font: "Helvetica" | "Courier" | "Times-Roman"
  logoUrl: string | null
  layout: "classic" | "modern" | "minimal"
  showTaxId: boolean
  showPaymentInfo: boolean
  footerText: string
  headerStyle: "full-width" | "split" | "centered"
}

export interface InvoiceTemplate {
  id: string
  user_id: string
  name: string
  is_default: boolean
  config: TemplateConfig
  created_at: string
  updated_at: string
}

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  colors: { primary: "#1B3A6B", secondary: "#6B7A90", accent: "#2563eb" },
  font: "Helvetica",
  logoUrl: null,
  layout: "classic",
  showTaxId: true,
  showPaymentInfo: true,
  footerText: "Vielen Dank für Ihr Vertrauen!",
  headerStyle: "split",
}

/* ── Recurring Schedules ──────────────────────────── */

export type RecurringInterval = "monthly" | "quarterly" | "yearly"

export interface RecurringSchedule {
  id: string
  user_id: string
  customer_id: string
  template_invoice_id: string | null
  interval: RecurringInterval
  next_run_date: string
  active: boolean
  created_at: string
}
