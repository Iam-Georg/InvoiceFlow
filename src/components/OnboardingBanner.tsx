"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Settings, X, ArrowRight } from "lucide-react";

export default function OnboardingBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_name")
        .eq("id", user.id)
        .single();

      if (!profile?.company_name) {
        setVisible(true);
      }
    }
    check();
  }, []);

  if (!visible) return null;

  return (
    <div
      className="card-elevated"
      style={{
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "var(--accent-soft)",
        border: "1px solid var(--accent)",
      }}
    >
      <Settings style={{ width: 18, height: 18, color: "var(--accent)", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>
          Richte dein Unternehmen ein
        </p>
        <p style={{ fontSize: "12px", color: "var(--text-2)" }}>
          Ergänze Firmenname und Adresse, damit sie auf deinen Rechnungen erscheinen.
        </p>
      </div>
      <Link href="/settings" className="btn btn-primary" style={{ fontSize: "12px", flexShrink: 0 }}>
        Einstellungen
        <ArrowRight style={{ width: 12, height: 12 }} />
      </Link>
      <button
        onClick={() => setVisible(false)}
        aria-label="Banner schließen"
        style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", flexShrink: 0 }}
      >
        <X style={{ width: 14, height: 14, color: "var(--text-3)" }} />
      </button>
    </div>
  );
}
