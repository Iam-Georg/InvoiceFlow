"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, FileText } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      toast.error("Bitte alle Felder ausfuellen");
      return;
    }
    if (password.length < 8) {
      toast.error("Passwort muss mindestens 8 Zeichen haben");
      return;
    }
    if (password !== password2) {
      toast.error("Passwoerter stimmen nicht ueberein");
      return;
    }

    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.session) {
        if (data.user) {
          await ensureProfile(sb, data.user);
          // Fire-and-forget welcome email
          fetch("/api/account/welcome", { method: "POST" }).catch(() => {});
        }
        toast.success("Account erstellt!");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.success("Bitte bestaetige deine E-Mail-Adresse.");
        router.push("/login");
      }
    } catch {
      toast.error("Unerwarteter Fehler");
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
        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
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
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText style={{ width: 16, height: 16, color: "#fff" }} />
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

        <div className="card-elevated" style={{ overflow: "hidden" }}>
          <div style={{ padding: "24px 24px 0" }}>
            <h1
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--foreground)",
                marginBottom: "4px",
              }}
            >
              Account erstellen
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "var(--muted-foreground)",
                marginBottom: "24px",
              }}
            >
              Kostenlos starten - keine Kreditkarte noetig.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {input("Name", name, setName, "text", "Max Mustermann")}
              {input("E-Mail", email, setEmail, "email", "max@firma.de")}
              {input(
                "Passwort",
                password,
                setPassword,
                "password",
                "Mind. 8 Zeichen",
              )}
              {input(
                "Passwort bestaetigen",
                password2,
                setPassword2,
                "password",
                "********",
              )}
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
              onClick={handleRegister}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              {loading && (
                <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
              )}
              {loading ? "Erstelle Account..." : "Kostenlos registrieren"}
            </button>

            <p
              style={{
                textAlign: "center",
                fontSize: "11px",
                color: "var(--muted-foreground)",
                lineHeight: 1.5,
              }}
            >
              Mit der Registrierung akzeptierst du unsere{" "}
              <Link
                href="/agb"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                AGB
              </Link>{" "}
              und{" "}
              <Link
                href="/datenschutz"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                Datenschutzerklärung
              </Link>
              .
            </p>

            <p
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "var(--muted-foreground)",
              }}
            >
              Bereits registriert?{" "}
              <Link
                href="/login"
                style={{
                  color: "var(--accent)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
