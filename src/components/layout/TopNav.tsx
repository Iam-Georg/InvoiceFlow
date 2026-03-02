"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Plus, LogOut, Settings, FileText, ChevronDown, Moon, Sun, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function TopNav() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userInitial, setUserInitial] = useState("?");
  const [userName, setUserName] = useState("");
  const [isDark, setIsDark] = useState(false);
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
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, []);

  function toggleTheme() {
    const next = !isDark;
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setIsDark(next);
  }

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
    <header className="topnav-frame" style={{ animation: 'topNavSlideDown 300ms var(--ease-spring) forwards' }}>
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
          {/* Neuer Kunde – Secondary */}
          <Link href="/customers/new" style={{ textDecoration: "none" }}>
            <button
              className="btn btn-secondary"
              style={{
                height: "36px",
                padding: "0 12px",
                fontSize: "13px",
              }}
            >
              <Users size={14} />
              <span className="topnav-new-label">Neuer Kunde</span>
            </button>
          </Link>

          <Link href="/invoices/new" style={{ textDecoration: "none" }}>
            <button
              className="topnav-new-btn btn-breathe"
              style={{
                height: "36px",
                padding: "0 12px",
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
                border: "1px solid var(--border)",
                background: "var(--surface)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                transition: `background-color var(--duration-fast) var(--ease-smooth), box-shadow var(--duration-fast) var(--ease-smooth), transform var(--duration-fast) var(--ease-spring)`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = ""; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}
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
                  color: "var(--text-2)",
                  transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: `transform var(--duration-normal) var(--ease-spring)`,
                }}
              />
            </button>

            {menuOpen && (
              <div
                className="dropdown-enter"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  minWidth: "220px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-lg)",
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
                  className="dropdown-item"
                >
                  <Settings size={14} color="var(--text-2)" />
                  Einstellungen
                </Link>

                <button onClick={toggleTheme} className="dropdown-item">
                  {isDark
                    ? <Sun size={14} color="var(--text-2)" />
                    : <Moon size={14} color="var(--text-2)" />}
                  {isDark ? "Hell" : "Dunkel"}
                </button>

                <button onClick={handleLogout} className="dropdown-item dropdown-item-danger">
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
