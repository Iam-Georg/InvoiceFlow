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
    overdue: 'Ueberfaellig',
    paid: 'Bezahlt',
    cancelled: 'Storniert',
  }
  return labels[status] ?? status
}

export function getStatusColors(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    draft: { bg: 'var(--badge-draft-bg)', text: 'var(--badge-draft-text)' },
    sent: { bg: 'var(--badge-sent-bg)', text: 'var(--badge-sent-text)' },
    open: { bg: 'var(--badge-open-bg)', text: 'var(--badge-open-text)' },
    overdue: { bg: 'var(--badge-overdue-bg)', text: 'var(--badge-overdue-text)' },
    paid: { bg: 'var(--badge-paid-bg)', text: 'var(--badge-paid-text)' },
    cancelled: { bg: 'var(--destructive-bg)', text: 'var(--destructive)' },
  }

  return colors[status] ?? { bg: 'var(--badge-draft-bg)', text: 'var(--badge-draft-text)' }
}
