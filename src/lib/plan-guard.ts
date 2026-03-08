import { PLAN_FEATURES, type PlanId } from "./plans";

type SupabaseClient = ReturnType<typeof import("./supabase").createClient>;

export interface PlanLimitResult {
  allowed: boolean;
  current: number;
  max: number;
  plan: PlanId;
}

export async function checkInvoiceLimit(
  supabase: SupabaseClient,
  userId: string,
): Promise<PlanLimitResult> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const plan = (profile?.plan || "free") as PlanId;
  const max = PLAN_FEATURES[plan].maxInvoices;

  if (max === Infinity) {
    return { allowed: true, current: 0, max, plan };
  }

  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const current = count ?? 0;
  return { allowed: current < max, current, max, plan };
}

export async function checkCustomerLimit(
  supabase: SupabaseClient,
  userId: string,
): Promise<PlanLimitResult> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const plan = (profile?.plan || "free") as PlanId;
  const max = PLAN_FEATURES[plan].maxCustomers;

  if (max === Infinity) {
    return { allowed: true, current: 0, max, plan };
  }

  const { count } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const current = count ?? 0;
  return { allowed: current < max, current, max, plan };
}
