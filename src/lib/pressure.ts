import type { Invoice } from '@/types'

export interface PressureResult {
  score: number
  label: string
  className: string
}

/**
 * Calculates a pressure score (0–100) for an invoice based on:
 *  - Days overdue (max weight 40)
 *  - Customer reliability history (max weight 20)
 *  - Number of reminders sent (max weight 20)
 *  - Invoice amount (max weight 20)
 */
export function calculatePressure(
  invoice: Invoice,
  reminderCount: number,
  customerLateRatio: number // 0 to 1 – ratio of late invoices for this customer
): PressureResult {
  let score = 0

  // Days overdue (0–40 points)
  if (invoice.status !== 'paid') {
    const now = new Date()
    const due = new Date(invoice.due_date)
    const daysOverdue = Math.max(0, Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)))
    score += Math.min(40, daysOverdue * 2) // 1 day = 2 points, max 40
  }

  // Customer reliability (0–20 points)
  score += Math.round(customerLateRatio * 20)

  // Reminders sent (0–20 points)
  score += Math.min(20, reminderCount * 7) // each reminder = 7 pts, max 20

  // Invoice amount (0–20 points) – scale: 500€ = 5pts, 2000€ = 10pts, 10000€+ = 20pts
  const amountScore = Math.min(20, Math.round((invoice.total / 10000) * 20))
  score += amountScore

  score = Math.min(100, Math.max(0, score))

  if (score <= 30) {
    return { score, label: 'Niedrig', className: 'pressure-low' }
  } else if (score <= 60) {
    return { score, label: 'Mittel', className: 'pressure-mid' }
  } else {
    return { score, label: 'Hoch', className: 'pressure-high' }
  }
}
