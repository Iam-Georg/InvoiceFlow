"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { InvoiceTemplate, DEFAULT_TEMPLATE_CONFIG } from "@/types";
import { Plus, Palette, Star, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePlan } from "@/hooks/usePlan";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const router = useRouter();
  const { can, loading: planLoading } = usePlan();

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  useEffect(() => {
    async function load() {
      const sb = getSupabase();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) return;

      const { data, error } = await sb
        .from("invoice_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (error) {
        console.error("Template load error:", error);
      }
      setTemplates((data as InvoiceTemplate[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const maxTemplates = !can("starter") ? 1 : !can("professional") ? 3 : Infinity;
  const canCreate = templates.length < maxTemplates;

  async function handleCreate() {
    const sb = getSupabase();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return;

    setActionLoading("create");
    const { data, error } = await sb
      .from("invoice_templates")
      .insert({
        user_id: user.id,
        name: `Vorlage ${templates.length + 1}`,
        is_default: templates.length === 0,
        config: DEFAULT_TEMPLATE_CONFIG,
      })
      .select()
      .single();

    setActionLoading(null);
    if (error) {
      toast.error(`Fehler: ${error.message}`);
      console.error("Template create error:", error);
      return;
    }
    router.push(`/invoices/templates/${data.id}`);
  }

  async function handleDelete(id: string) {
    const sb = getSupabase();
    setActionLoading(id);
    await sb.from("invoice_templates").delete().eq("id", id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setActionLoading(null);
    toast.success("Vorlage gelöscht");
  }

  async function handleSetDefault(id: string) {
    const sb = getSupabase();
    setActionLoading(id);
    await sb.from("invoice_templates").update({ is_default: true }).eq("id", id);
    setTemplates((prev) =>
      prev.map((t) => ({ ...t, is_default: t.id === id })),
    );
    setActionLoading(null);
    toast.success("Als Standard gesetzt");
  }

  return (
    <div>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--foreground)",
              letterSpacing: "-0.03em",
            }}
          >
            Rechnungsvorlagen
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "var(--muted-foreground)",
              marginTop: "2px",
            }}
          >
            {loading
              ? "..."
              : `${templates.length} ${templates.length === 1 ? "Vorlage" : "Vorlagen"}${maxTemplates < Infinity ? ` von ${maxTemplates}` : ""}`}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleCreate}
          disabled={!canCreate || actionLoading === "create"}
          style={{ gap: "6px" }}
        >
          {actionLoading === "create" ? (
            <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Plus size={13} />
          )}
          Neue Vorlage
        </button>
      </div>

      {!canCreate && !loading && (
        <div
          className="card-elevated"
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            fontSize: "13px",
            color: "var(--muted-foreground)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Palette size={14} />
          Du hast das Maximum von {maxTemplates} Vorlage{maxTemplates > 1 ? "n" : ""} erreicht.{" "}
          <Link href="/billing" style={{ color: "var(--accent)", fontWeight: 600 }}>
            Upgrade
          </Link>
        </div>
      )}

      <div className="card-elevated" style={{ overflow: "hidden" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "64px",
            }}
          >
            <Loader2
              style={{
                width: 18,
                height: 18,
                color: "var(--muted-foreground)",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
        ) : templates.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "64px 24px",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                background: "var(--accent-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "4px",
                animation: "floatY 3s ease-in-out infinite",
              }}
            >
              <Palette style={{ width: 20, height: 20, color: "var(--accent)" }} />
            </div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              Noch keine Vorlagen
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--muted-foreground)",
                marginBottom: "8px",
              }}
            >
              Erstelle deine erste Rechnungsvorlage mit eigenem Design.
            </p>
            <button className="btn btn-primary" onClick={handleCreate}>
              Vorlage erstellen
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
              padding: "20px",
            }}
          >
            {templates.map((template) => (
              <div
                key={template.id}
                className="card-hover"
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Color preview bar */}
                <div
                  style={{
                    height: "6px",
                    background: `linear-gradient(90deg, ${template.config.colors.primary}, ${template.config.colors.accent})`,
                  }}
                />

                {/* Template preview area */}
                <div
                  style={{
                    padding: "20px",
                    background: "var(--background)",
                    borderBottom: "1px solid var(--border)",
                    minHeight: "100px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {/* Mini preview mockup */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: template.config.colors.primary,
                        borderRadius: "2px",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div
                        style={{
                          height: "6px",
                          width: "80px",
                          background: "var(--border)",
                          borderRadius: "2px",
                          marginBottom: "4px",
                        }}
                      />
                      <div
                        style={{
                          height: "4px",
                          width: "50px",
                          background: "var(--border)",
                          borderRadius: "2px",
                          opacity: 0.6,
                        }}
                      />
                    </div>
                  </div>
                  {/* Mini table mockup */}
                  <div style={{ marginTop: "8px" }}>
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        style={{
                          height: "4px",
                          background: n === 1 ? "var(--border)" : "var(--background-2)",
                          borderRadius: "2px",
                          marginBottom: "3px",
                          width: n === 1 ? "100%" : `${90 - n * 10}%`,
                        }}
                      />
                    ))}
                  </div>
                  {/* Mini total bar */}
                  <div
                    style={{
                      height: "8px",
                      width: "40%",
                      alignSelf: "flex-end",
                      background: template.config.colors.primary,
                      borderRadius: "2px",
                      marginTop: "4px",
                    }}
                  />
                </div>

                {/* Info + actions */}
                <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--foreground)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {template.name}
                      {template.is_default && (
                        <Star
                          size={12}
                          fill="var(--accent)"
                          color="var(--accent)"
                        />
                      )}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "2px" }}>
                      {template.config.layout === "classic"
                        ? "Klassisch"
                        : template.config.layout === "modern"
                          ? "Modern"
                          : "Minimal"}{" "}
                      · {template.config.font}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "4px" }}>
                    {!template.is_default && (
                      <button
                        className="btn btn-ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSetDefault(template.id);
                        }}
                        disabled={actionLoading === template.id}
                        title="Als Standard setzen"
                        style={{ padding: "6px" }}
                      >
                        <Star size={13} />
                      </button>
                    )}
                    <Link href={`/invoices/templates/${template.id}`}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "6px 10px", fontSize: "12px" }}
                      >
                        Bearbeiten
                      </button>
                    </Link>
                    <button
                      className="btn btn-ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(template.id);
                      }}
                      disabled={actionLoading === template.id}
                      title="Löschen"
                      style={{ padding: "6px", color: "var(--danger)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
