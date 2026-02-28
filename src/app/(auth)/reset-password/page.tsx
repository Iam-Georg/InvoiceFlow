"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"request" | "update">("request");

  useEffect(() => {
    const supabase = getSupabase();

    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setMode("update");
      }
    }

    checkSession();

    const { data: authSub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setMode("update");
      }
    });

    return () => {
      authSub.subscription.unsubscribe();
    };
  }, []);

  async function requestReset() {
    if (!email.trim()) {
      toast.error("Bitte E-Mail eingeben");
      return;
    }
    setLoading(true);
    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Reset-Link wurde versendet");
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword() {
    if (!password || !password2) {
      toast.error("Bitte Passwort ausfüllen");
      return;
    }
    if (password.length < 8) {
      toast.error("Passwort muss mindestens 8 Zeichen haben");
      return;
    }
    if (password !== password2) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }

    setLoading(true);
    try {
      const { error } = await getSupabase().auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Passwort erfolgreich geändert");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
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
          <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--foreground)" }}>
            Faktura
          </span>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            // borderRadius: "8px",
            boxShadow: "var(--shadow-sm)",
            padding: "24px",
            display: "grid",
            gap: "12px",
          }}
        >
          <h1 style={{ fontSize: "16px", fontWeight: 700, color: "var(--foreground)" }}>
            {mode === "request" ? "Passwort zurücksetzen" : "Neues Passwort setzen"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
            {mode === "request"
              ? "Wir senden dir einen Link per E-Mail."
              : "Vergib jetzt ein neues Passwort."}
          </p>

          {mode === "request" ? (
            <>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="max@firma.de"
                style={{
                  height: "38px",
                  padding: "0 12px",
                  fontSize: "13px",
                  border: "1px solid var(--border)",
                  // borderRadius: "var(--radius)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                  outline: "none",
                }}
              />
              <button
                onClick={requestReset}
                disabled={loading}
                style={{
                  height: "38px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: loading ? "var(--muted)" : "var(--primary)",
                  color: loading ? "var(--muted-foreground)" : "white",
                  border: "none",
                  // borderRadius: "var(--radius)",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "inline-flex",
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
                Link senden
              </button>
            </>
          ) : (
            <>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Neues Passwort"
                style={{
                  height: "38px",
                  padding: "0 12px",
                  fontSize: "13px",
                  border: "1px solid var(--border)",
                  // borderRadius: "var(--radius)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                  outline: "none",
                }}
              />
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="Passwort wiederholen"
                style={{
                  height: "38px",
                  padding: "0 12px",
                  fontSize: "13px",
                  border: "1px solid var(--border)",
                  // borderRadius: "var(--radius)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                  outline: "none",
                }}
              />
              <button
                onClick={updatePassword}
                disabled={loading}
                style={{
                  height: "38px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: loading ? "var(--muted)" : "var(--primary)",
                  color: loading ? "var(--muted-foreground)" : "white",
                  border: "none",
                  // borderRadius: "var(--radius)",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "inline-flex",
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
                Passwort speichern
              </button>
            </>
          )}

          <Link href="/login" style={{ fontSize: "12px", color: "var(--primary)" }}>
            Zurück zum Login
          </Link>
        </div>
      </div>
    </div>
  );
}
