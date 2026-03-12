"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function SkipToContent() {
  const [visible, setVisible] = useState(false);
  const [hasTarget, setHasTarget] = useState(false);

  useEffect(() => {
    const target = document.getElementById("main-content");
    if (!target) return;
    setHasTarget(true);

    function onScroll() {
      setVisible(window.scrollY > 50);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!hasTarget) return null;

  function handleClick() {
    const el = document.getElementById("main-content");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.focus({ preventScroll: true });
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Zum Inhalt springen"
      style={{
        position: "fixed",
        bottom: "80px",
        right: "24px",
        zIndex: 200,
        width: "48px",
        height: "48px",
        background: "var(--accent)",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "var(--shadow-lg)",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.8) translateY(8px)",
        pointerEvents: visible ? "auto" : "none",
        transition: "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease, box-shadow 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.08)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,64,204,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = visible ? "scale(1)" : "scale(0.8) translateY(8px)";
        e.currentTarget.style.boxShadow = "var(--shadow-lg)";
      }}
    >
      <ArrowUp size={20} />
    </button>
  );
}
