'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Users, LayoutDashboard, Settings } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/invoices', icon: FileText, label: 'Rechnungen' },
  { href: '/customers', icon: Users, label: 'Kunden' },
  { href: '/settings', icon: Settings, label: 'Mehr' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-2"
      style={{
        background: 'var(--card)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-3 py-1">
            <Icon
              className="w-5 h-5"
              style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
