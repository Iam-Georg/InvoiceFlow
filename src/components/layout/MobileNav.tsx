"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Users, LayoutDashboard, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/invoices", icon: FileText, label: "Rechnungen" },
  { href: "/customers", icon: Users, label: "Kunden" },
  { href: "/settings", icon: Settings, label: "Mehr" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-4 left-4 right-4 z-50"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        /* borderRadius: '10px', */
        boxShadow: "var(--shadow-card)",
        padding: "6px 8px",
      }}
    >
      <div className="flex items-center justify-around">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-2 py-1"
            >
              <Icon
                className="w-4 h-4"
                style={{
                  color: isActive ? "var(--primary)" : "var(--text-secondary)",
                }}
              />
              <span
                className="text-[10px] font-medium"
                style={{
                  color: isActive ? "var(--primary)" : "var(--text-secondary)",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
