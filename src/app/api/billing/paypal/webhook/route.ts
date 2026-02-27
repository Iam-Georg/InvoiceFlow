import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { getPlanFromPayPalPlanId } from "@/lib/billing";

type PayPalWebhookPayload = {
  event_type?: string;
  resource?: {
    id?: string;
    custom_id?: string;
    plan_id?: string;
  };
};

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as PayPalWebhookPayload;

  const userId = payload.resource?.custom_id;
  const planId = payload.resource?.plan_id;
  if (!userId) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createServiceSupabaseClient();
  const eventType = payload.event_type;

  if (
    eventType === "BILLING.SUBSCRIPTION.ACTIVATED" ||
    eventType === "BILLING.SUBSCRIPTION.UPDATED"
  ) {
    const plan = getPlanFromPayPalPlanId(planId);
    if (plan) {
      await supabase.from("profiles").update({ plan }).eq("id", userId);
    }
  }

  if (
    eventType === "BILLING.SUBSCRIPTION.CANCELLED" ||
    eventType === "BILLING.SUBSCRIPTION.SUSPENDED" ||
    eventType === "BILLING.SUBSCRIPTION.EXPIRED"
  ) {
    await supabase.from("profiles").update({ plan: "free" }).eq("id", userId);
  }

  return NextResponse.json({ ok: true });
}
