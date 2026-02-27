'use client'

import { PressureResult } from '@/lib/pressure'
import { useState } from 'react'

export default function PressureBadge({ pressure }: { pressure: PressureResult }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative inline-flex">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-default tabular-nums ${pressure.className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {pressure.score} {pressure.label}
      </span>
      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded-lg whitespace-nowrap z-50"
          style={{
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="font-medium mb-1">Druck-Score: {pressure.score}/100</div>
          <div style={{ color: 'var(--muted-foreground)' }}>
            Basierend auf Zahlungsverzug, Kundenhistorie,
            <br />
            Erinnerungen und Rechnungsbetrag.
          </div>
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
            style={{ background: 'var(--card)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginTop: '-4px' }}
          />
        </div>
      )}
    </div>
  )
}
