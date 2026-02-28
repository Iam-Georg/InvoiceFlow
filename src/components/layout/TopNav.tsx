"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Plus, LogOut, Settings, FileText, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DarkModeToggle } from "./DarkModeToggle";

export default function TopNav() {
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
    <header className="topnav-frame">
      <div className="topnav-shell">
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              /* borderRadius: "8px", */
              background: "var(--accent-theme)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileText style={{ width: 14, height: 14 }} />
          </div>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--text-primary-theme)",
            }}
          >
            Faktura
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <DarkModeToggle />
          
          <Link href="/invoices/new" style={{ textDecoration: "none" }}>
            <button
              className="topnav-new-btn"
              style={{
                height: "36px",
                padding: "0 12px",
                /* borderRadius: "8px", */
                border: "none",
                background: "var(--accent-theme)",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus size={14} />
              <span className="topnav-new-label">Neue Rechnung</span>
            </button>
          </Link>

          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              style={{
                height: "36px",
                padding: "0 10px",
                /* borderRadius: "8px", */
                border: "1px solid var(--border)",
                background: "var(--surface)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  /* borderRadius: "8px", */
                  background: "var(--accent-theme)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {userInitial}
              </div>
              <ChevronDown
                style={{
                  width: 12,
                  height: 12,
                  color: "var(--text-secondary)",
                }}
              />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  minWidth: "220px",
                  /* borderRadius: "10px", */
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-card)",
                  overflow: "hidden",
                  zIndex: 100,
                }}
              >
                <div
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid var(--divider)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--text-primary-theme)",
                    }}
                  >
                    {userName || "-"}
                  </p>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 12px",
                      color: "var(--text-primary-theme)",
                      fontSize: "14px",
                    }}
                  >
                    <Settings size={14} color="var(--text-secondary-theme)" />
                    Einstellungen
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    border: "none",
                    borderTop: "1px solid var(--divider)",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 12px",
                    color: "var(--danger)",
                    fontSize: "14px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <LogOut size={14} />
                  Abmelden
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
