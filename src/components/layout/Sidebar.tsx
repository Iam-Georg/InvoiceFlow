"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Palette,
  Settings,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

const navItems = [
  { href: "/dashboard",           label: "Übersicht",     icon: LayoutGrid },
  { href: "/invoices",            label: "Rechnungen",    icon: FileText },
  { href: "/customers",           label: "Kunden",        icon: Users },
  { href: "/statistics",          label: "Statistiken",   icon: BarChart3 },
  { href: "/invoices/templates",  label: "Vorlagen",      icon: Palette },
  { href: "/settings",            label: "Einstellungen", icon: Settings },
  { href: "/billing",             label: "Billing",       icon: CreditCard },
  { href: "/support",             label: "Support",       icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  const [userName, setUserName] = useState("");
  const [userInitial, setUserInitial] = useState("?");

  // Active index based on current path (longest prefix match)
  function getActiveIndex(path: string): number {
    let bestIndex = -1;
    let bestLength = 0;
    navItems.forEach((item, i) => {
      if (
        (path === item.href || path.startsWith(item.href + "/")) &&
        item.href.length > bestLength
      ) {
        bestIndex = i;
        bestLength = item.href.length;
      }
    });
    return bestIndex;
  }
  const activeIndex = getActiveIndex(pathname);

  // Magnetic hover tracking
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // The indicator follows hover, falls back to active
  const indicatorIndex = hoverIndex ?? activeIndex;

  useEffect(() => {
    async function loadUser() {
      const sb = getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data: profile } = await sb
        .from("profiles")
        .select("full_name, company_name")
        .eq("id", user.id)
        .single();
      const name = profile?.full_name || user.email || "?";
      setUserName(profile?.full_name || user.email || "");
      setUserInitial(name.charAt(0).toUpperCase());
    }
    loadUser();
  }, []);

  async function handleLogout() {
    await getSupabase().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="floating-sidebar-wrap" aria-label="Seitennavigation">
      <div className="floating-sidebar">

        {/* Logo */}
        <Link
          href="/"
          title="Zur Startseite"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "0 16px",
            height: "52px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileText size={14} color="#fff" />
          </div>
          <span
            style={{
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--sidebar-active)",
            }}
          >
            Faktura
          </span>
        </Link>

        {/* Nav */}
        <nav
          style={{ position: "relative", display: "flex", flexDirection: "column", paddingTop: "6px" }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Magnetic left-edge accent bar */}
          {indicatorIndex >= 0 && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                top: 6 + indicatorIndex * 44,
                width: "3px",
                height: 44,
                background: "var(--accent)",
                borderRadius: "0 3px 3px 0",
                transition: "top var(--duration-normal) var(--ease-spring), height var(--duration-normal) var(--ease-spring)",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
          )}
          {navItems.map((item, i) => {
            const active = i === activeIndex;
            const isHovered = hoverIndex === i;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={"sidebar-nav-item" + (active ? " active" : "")}
                style={{
                  position: "relative",
                  zIndex: 1,
                  ...(active
                    ? {
                        color: "var(--text-1)",
                        background: "var(--accent-soft)",
                        boxShadow: "inset 0 0 20px var(--accent-soft)",
                      }
                    : isHovered
                      ? { color: "var(--text-1)" }
                      : {}),
                }}
                onMouseEnter={() => setHoverIndex(i)}
              >
                <Icon
                  size={17}
                  style={{
                    color: active || isHovered ? "var(--accent)" : undefined,
                    transition: "color var(--duration-fast) var(--ease-smooth)",
                  }}
                />
                <span
                  style={{
                    color: active || isHovered ? "var(--text-1)" : undefined,
                    transition: "color var(--duration-fast) var(--ease-smooth)",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Shortcut hint */}
        <div style={{ padding: "0 14px 8px", flexShrink: 0 }}>
          <p style={{ fontSize: "10px", color: "var(--text-3)", letterSpacing: "0.04em" }}>
            Drücke <kbd style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--text-2)" }}>Shift</kbd> + <kbd style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--text-2)" }}>ß</kbd> für Tastenkürzel
          </p>
        </div>

        {/* User + Logout – pinned to bottom */}
        <div
          className="sidebar-user-area"
          style={{
            marginTop: "auto",
            borderTop: "1px solid var(--border)",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "var(--accent)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {userInitial}
          </div>
          <span
            style={{
              flex: 1,
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--sidebar-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {userName || "…"}
          </span>
          <button
            onClick={handleLogout}
            aria-label="Abmelden"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "var(--text-3)",
              display: "flex",
              alignItems: "center",
              transition: `color var(--duration-fast) var(--ease-smooth), transform var(--duration-fast) var(--ease-spring)`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.transform = ""; }}
          >
            <LogOut size={13} />
          </button>
        </div>

      </div>
    </aside>
  );
}
