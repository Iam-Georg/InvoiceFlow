"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, FileText } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      toast.error("Bitte E-Mail und Passwort eingeben");
      return;
    }
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error || !data.session) {
        toast.error("Falsche E-Mail oder Passwort");
        return;
      }

      if (data.user) {
        await ensureProfile(sb, data.user);
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Unerwarteter Fehler – bitte erneut versuchen");
    } finally {
      setLoading(false);
    }
  }

  const input = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    type = "text",
    placeholder = "",
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "var(--foreground)",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        style={{
          height: "38px",
          padding: "0 12px",
          fontSize: "13px",
          border: "1px solid var(--border)",
          // borderRadius: "var(--radius)",
          background: "var(--background)",
          color: "var(--foreground)",
          outline: "none",
          fontFamily: "inherit",
          width: "100%",
        }}
      />
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "380px" }}>
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "32px",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "var(--primary)",
              // borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText style={{ width: 16, height: 16, color: "white" }} />
          </div>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--foreground)",
              letterSpacing: "-0.01em",
            }}
          >
            Faktura
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            // borderRadius: "8px",
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "24px 24px 0" }}>
            <h1
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--foreground)",
                marginBottom: "4px",
              }}
            >
              Willkommen zurück
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "var(--muted-foreground)",
                marginBottom: "24px",
              }}
            >
              Melde dich mit deinem Account an.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {input("E-Mail", email, setEmail, "email", "max@firma.de")}
              {input("Passwort", password, setPassword, "password", "••••••••")}
            </div>

            <div style={{ textAlign: "right", marginTop: "8px" }}>
              <Link
                href="/reset-password"
                style={{
                  fontSize: "12px",
                  color: "var(--primary)",
                  textDecoration: "none",
                }}
              >
                Passwort vergessen?
              </Link>
            </div>
          </div>

          <div
            style={{
              padding: "20px 24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                height: "38px",
                width: "100%",
                fontSize: "13px",
                fontWeight: 600,
                background: loading ? "var(--muted)" : "var(--primary)",
                color: loading ? "var(--muted-foreground)" : "white",
                border: "none",
                // borderRadius: "var(--radius)",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {loading && (
                <Loader2
                  style={{
                    width: 14,
                    height: 14,
                    animation: "spin 1s linear infinite",
                  }}
                />
              )}
              {loading ? "Anmelden..." : "Anmelden"}
            </button>

            <p
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "var(--muted-foreground)",
              }}
            >
              Noch kein Account?{" "}
              <Link
                href="/register"
                style={{
                  color: "var(--primary)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
