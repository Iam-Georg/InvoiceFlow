"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { PLAN_FEATURES, hasPlan, type PlanFeatures, type PlanId } from "@/lib/plans";

export interface UsePlanResult {
  plan: PlanId;
  features: PlanFeatures;
  can: (required: PlanId) => boolean;
  loading: boolean;
}

export function usePlan(): UsePlanResult {
  const [plan, setPlan] = useState<PlanId>("free");
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

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
      if (!user) { setLoading(false); return; }

      const { data: profile } = await sb
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (profile?.plan) setPlan(profile.plan as PlanId);
      setLoading(false);
    }
    load();
  }, []);

  return {
    plan,
    features: PLAN_FEATURES[plan],
    can: (required: PlanId) => hasPlan(plan, required),
    loading,
  };
}
