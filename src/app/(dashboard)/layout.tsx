"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import TopNav from "@/components/layout/TopNav";
import Sidebar from "@/components/layout/Sidebar";
import FeedbackWidget from "@/components/FeedbackWidget";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();

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

    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      setChecked(true);
    });

    return () => {
      authSubscription.subscription.unsubscribe();
    };
  }, [router]);

  if (!checked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <Loader2 style={{ width: 18, height: 18, color: "var(--text-2)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <TopNav />
      <Sidebar />
      <main>
        <div className="app-main-container dashboard-main-container page-enter">{children}</div>
      </main>
      <FeedbackWidget />
      <KeyboardShortcuts />
    </div>
  );
}
