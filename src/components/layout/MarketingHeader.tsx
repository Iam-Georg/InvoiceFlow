"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ArrowRight, FileText } from "lucide-react";

const NAV = [
  { href: "/", label: "Startseite" },
  { href: "/funktionen", label: "Funktionen" },
  { href: "/preise", label: "Preise" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/docs", label: "Dokumentation" },
];

type IndicatorState = { left: number; width: number; opacity: number };

export default function MarketingHeader() {
  const pathname = usePathname();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Sliding indicator
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState<IndicatorState>({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const activePos = useRef<{ left: number; width: number } | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  useEffect(() => {
    async function check() {
      const {
        data: { user },
      } = await getSupabase().auth.getUser();
      setIsLoggedIn(!!user);
    }
    check();
  }, []);

  // Init indicator at active item on mount / pathname change
  useEffect(() => {
    const activeIndex = NAV.findIndex((n) => n.href === pathname);
    if (activeIndex >= 0 && itemRefs.current[activeIndex] && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = itemRefs.current[activeIndex]!.getBoundingClientRect();
      const pos = { left: itemRect.left - navRect.left, width: itemRect.width };
      activePos.current = pos;
      setIndicator({ ...pos, opacity: 1 });
    } else {
      activePos.current = null;
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [pathname]);

  function handleMouseEnter(index: number) {
    const el = itemRefs.current[index];
    if (!el || !navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();
    setIndicator({
      left: itemRect.left - navRect.left,
      width: itemRect.width,
      opacity: 1,
    });
  }

  function handleMouseLeave() {
    if (activePos.current) {
      setIndicator({ ...activePos.current, opacity: 1 });
    } else {
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
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
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        height: "58px",
        display: "flex",
        alignItems: "center",
        padding: "0 40px",
        gap: "32px",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
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
          }}
        >
          <FileText size={14} color="#fff" />
        </div>
        <span
          style={{
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text-1)",
            transition: "color var(--duration-fast) var(--ease-smooth)",
          }}
        >
          Faktura
        </span>
        <span
          style={{
            padding: "2px 7px",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            background: "var(--success-bg)",
            color: "var(--success)",
          }}
        >
          Beta
        </span>
      </Link>

      {/* Nav with sliding indicator */}
      <nav
        ref={navRef}
        style={{ display: "flex", flex: 1, position: "relative" }}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sliding indicator line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: indicator.left,
            width: indicator.width,
            height: "2px",
            background: "var(--accent)",
            opacity: indicator.opacity,
            pointerEvents: "none",
            transition: `left var(--duration-normal) var(--ease-spring), width var(--duration-normal) var(--ease-spring), opacity var(--duration-fast) var(--ease-smooth)`,
          }}
        />

        {NAV.map(({ href, label }, i) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              onMouseEnter={() => handleMouseEnter(i)}
              style={{
                height: "58px",
                padding: "0 14px",
                display: "inline-flex",
                alignItems: "center",
                fontSize: "13px",
                fontWeight: active ? 600 : 500,
                color: active ? "var(--text-1)" : "var(--text-2)",
                textDecoration: "none",
                transition: `color var(--duration-fast) var(--ease-smooth), font-weight var(--duration-fast) var(--ease-smooth)`,
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Auth buttons */}
      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        {isLoggedIn === null ? null : isLoggedIn ? (
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button className="btn btn-primary">
              Dashboard <ArrowRight size={13} />
            </button>
          </Link>
        ) : (
          <>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <button className="btn btn-secondary">Anmelden</button>
            </Link>
            <Link href="/register" style={{ textDecoration: "none" }}>
              <button className="btn btn-primary">Kostenlos starten</button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
