import { getStatusLabel, getStatusColors } from '@/lib/utils'

export default function StatusBadge({ status }: { status: string }) {
  const { bg, text } = getStatusColors(status)
  const isOverdue = status === 'overdue'
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isOverdue ? 'animate-overdue-pulse' : ''}`}
      style={{ background: bg, color: text }}
    >
      {getStatusLabel(status)}
    </span>
  )
}
