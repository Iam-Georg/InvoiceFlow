export type InvoiceStatus = 'draft' | 'sent' | 'open' | 'overdue' | 'paid'

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
  created_at: string
}
