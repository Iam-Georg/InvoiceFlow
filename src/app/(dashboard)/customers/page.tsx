"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { Customer } from "@/types";
import { Plus, Users, ChevronRight, Loader2, Mail } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("customers")
        .select("*")
        .order("name");
      setCustomers(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
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
            Kunden
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
              : `${customers.length} ${customers.length === 1 ? "Kunde" : "Kunden"}`}
          </p>
        </div>
        <Link href="/customers/new">
          <button className="btn btn-primary">
            <Plus size={15} />
            Neuer Kunde
          </button>
        </Link>
      </div>

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
        ) : customers.length === 0 ? (
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
                // borderRadius: "10px",
                background: "var(--accent-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "4px",
              }}
            >
              <Users
                style={{ width: 20, height: 20, color: "var(--accent)" }}
              />
            </div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              Noch keine Kunden
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--muted-foreground)",
                marginBottom: "8px",
              }}
            >
              Lege deinen ersten Kunden an.
            </p>
            <Link href="/customers/new">
              <button className="btn btn-primary">Jetzt anlegen</button>
            </Link>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 36px",
                padding: "10px 20px",
                borderBottom: "1px solid var(--border)",
                background: "var(--background-2)",
              }}
            >
              {["Name", "E-Mail", "Firma", ""].map((h, i) => (
                <span key={i} className="label-caps">
                  {h}
                </span>
              ))}
            </div>

            {customers.map((customer, idx) => (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="invoice-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 36px",
                    padding: "13px 20px",
                    alignItems: "center",
                    borderBottom:
                      idx < customers.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        // borderRadius: "8px",
                        background: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--foreground)",
                      }}
                    >
                      {customer.name}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Mail
                      style={{
                        width: 12,
                        height: 12,
                        color: "var(--muted-foreground)",
                        flexShrink: 0,
                      }}
                    />
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {customer.email}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {customer.company ?? "-"}
                  </p>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <ChevronRight
                      style={{
                        width: 14,
                        height: 14,
                        color: "var(--muted-foreground)",
                      }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
