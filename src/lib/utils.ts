import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('de-DE').format(new Date(date))
}

export function generateInvoiceNumber(counter: number): string {
  const year = new Date().getFullYear()
  const num = String(counter).padStart(4, '0')
  return `RE-${year}-${num}`
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Entwurf',
    sent: 'Gesendet',
    open: 'Offen',
    overdue: 'Überfällig',
    paid: 'Bezahlt',
  }
  return labels[status] ?? status
}

export function getStatusColors(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    draft:   { bg: '#F1F5F9', text: '#64748B' },
    sent:    { bg: '#EFF6FF', text: '#2563EB' },
    open:    { bg: '#FFF7ED', text: '#C2410C' },
    overdue: { bg: '#FEF2F2', text: '#DC2626' },
    paid:    { bg: '#F0FDF4', text: '#16A34A' },
  }
  return colors[status] ?? { bg: '#F1F5F9', text: '#64748B' }
}