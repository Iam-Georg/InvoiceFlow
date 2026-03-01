"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  LayoutGrid,
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Übersicht", icon: LayoutGrid },
  { href: "/invoices", label: "Rechnungen", icon: FileText },
  { href: "/customers", label: "Kunden", icon: Users },
  { href: "/statistics", label: "Statistiken", icon: BarChart3 },
  { href: "/settings", label: "Einstellungen", icon: Settings },
];

export default function FloatingSidebar() {
  const pathname = usePathname();

  return (
    <aside className="floating-sidebar-wrap" aria-label="Sidebar Navigation">
      <div className="floating-sidebar">
        <div
          style={{
            padding: "8px 8px 14px",
            borderBottom: "1px solid var(--divider)",
            marginBottom: "12px",
          }}
        >
          <p className="card-label">Navigation</p>
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flex: 1,
          }}
        >
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "0 12px",
                  /* borderRadius: "10px", */
                  textDecoration: "none",
                  background: active ? "var(--primary-light)" : "transparent",
                  color: active ? "var(--primary)" : "#374151",
                  borderLeft: active
                    ? "2px solid var(--primary)"
                    : "2px solid transparent",
                  fontSize: "14px",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/invoices/new"
          style={{ textDecoration: "none", marginTop: "12px" }}
        >
          <button
            style={{
              width: "100%",
              height: "40px",
              border: "none",
              /* borderRadius: "8px", */
              background: "var(--primary)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <PlusCircle size={16} />
            Neue Rechnung
          </button>
        </Link>
      </div>
    </aside>
  );
}
