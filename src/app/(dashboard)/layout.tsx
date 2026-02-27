"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import TopNav from "@/components/layout/TopNav";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setChecked(true);
    }

    checkAuth();

    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.replace("/login");
          return;
        }
        setChecked(true);
      },
    );

    return () => {
      authSubscription.subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (!checked)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background)",
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
    );

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <TopNav />
      <main style={{ paddingTop: "52px" }}>
        <div
          className="app-main-container"
          style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 40px" }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
