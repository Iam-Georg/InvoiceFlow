import { getStatusLabel, getStatusColors } from '@/lib/utils'

export default function StatusBadge({ status }: { status: string }) {
  const { bg, text } = getStatusColors(status)

  return (
    <span
      className="badge"
      style={{ background: bg, color: text }}
    >
      {getStatusLabel(status)}
    </span>
  )
}
