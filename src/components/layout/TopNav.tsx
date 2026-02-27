"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  Plus,
  LogOut,
  Settings,
  FileText,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Übersicht" },
  { href: "/invoices", label: "Rechnungen" },
  { href: "/customers", label: "Kunden" },
  { href: "/statistics", label: "Statistiken" },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userInitial, setUserInitial] = useState("?");
  const [userName, setUserName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) return;
      const { data: profile } = await sb
        .from("profiles")
        .select("full_name, company_name")
        .eq("id", user.id)
        .single();
      const name = profile?.full_name || user.email || "?";
      setUserName(
        profile?.company_name || profile?.full_name || user.email || "",
      );
      setUserInitial(name.charAt(0).toUpperCase());
    }
    loadUser();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    try {
      const sb = createClient();
      await sb.auth.signOut();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "var(--topbar-bg)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 40px",
          height: "52px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            marginRight: "32px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "26px",
              height: "26px",
              background: "var(--primary)",
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText style={{ width: 13, height: 13, color: "white" }} />
          </div>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--foreground)",
              letterSpacing: "-0.01em",
            }}
          >
            InvoiceFlow
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              padding: "1px 6px",
              background: "var(--primary-light)",
              color: "var(--primary)",
              borderRadius: "3px",
              letterSpacing: "0.04em",
            }}
          >
            FREE
          </span>
        </Link>

        {/* Nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "stretch",
            height: "52px",
            flex: 1,
          }}
        >
          {navItems.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                  fontSize: "13.5px",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--primary)" : "var(--muted-foreground)",
                  textDecoration: "none",
                  borderBottom: `2px solid ${active ? "var(--primary)" : "transparent"}`,
                  transition: "color 100ms ease, border-color 100ms ease",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <Link href="/invoices/new" style={{ textDecoration: "none" }}>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                height: "32px",
                padding: "0 14px",
                fontSize: "13px",
                fontWeight: 600,
                background: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: "pointer",
              }}
            >
              <Plus style={{ width: 13, height: 13 }} strokeWidth={2.5} />
              Neue Rechnung
            </button>
          </Link>

          {/* User Menu */}
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                height: "32px",
                padding: "0 10px",
                background: menuOpen ? "var(--muted)" : "transparent",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                transition: "background 100ms",
              }}
              onMouseEnter={(e) => {
                if (!menuOpen)
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--muted)";
              }}
              onMouseLeave={(e) => {
                if (!menuOpen)
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{ fontSize: "10px", fontWeight: 700, color: "white" }}
                >
                  {userInitial}
                </span>
              </div>
              <ChevronDown
                style={{
                  width: 12,
                  height: 12,
                  color: "var(--muted-foreground)",
                }}
              />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--shadow-md)",
                  minWidth: "200px",
                  zIndex: 100,
                  overflow: "hidden",
                }}
              >
                {/* User info */}
                <div
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "white",
                      }}
                    >
                      {userInitial}
                    </span>
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--foreground)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {userName || "–"}
                    </p>
                  </div>
                </div>

                {/* Menu items */}
                {[
                  { icon: Settings, label: "Einstellungen", href: "/settings" },
                ].map(({ icon: Icon, label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "9px 14px",
                        cursor: "pointer",
                        transition: "background 100ms",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "var(--muted)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "transparent")
                      }
                    >
                      <Icon
                        style={{
                          width: 14,
                          height: 14,
                          color: "var(--muted-foreground)",
                        }}
                      />
                      <span
                        style={{ fontSize: "13px", color: "var(--foreground)" }}
                      >
                        {label}
                      </span>
                    </div>
                  </Link>
                ))}

                <div style={{ borderTop: "1px solid var(--border)" }}>
                  <div
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "9px 14px",
                      cursor: "pointer",
                      transition: "background 100ms",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "var(--destructive-bg)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "transparent")
                    }
                  >
                    <LogOut
                      style={{
                        width: 14,
                        height: 14,
                        color: "var(--destructive)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--destructive)",
                        fontWeight: 500,
                      }}
                    >
                      Abmelden
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
