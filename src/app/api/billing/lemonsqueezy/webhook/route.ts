import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import type { PlanId } from "@/lib/plans";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    meta: { event_name: string; custom_data?: { user_id?: string } };
    data: { attributes: { status: string; variant_id: number } };
  };

  const userId = event.meta.custom_data?.user_id;
  if (!userId) return NextResponse.json({ ok: true });

  const eventName = event.meta.event_name;
  const status = event.data.attributes.status;
  const variantId = String(event.data.attributes.variant_id);

  let plan: PlanId = "free";
  if (eventName === "subscription_created" || eventName === "subscription_updated") {
    if (status === "active" || status === "trialing") {
      const variantMap: Record<string, PlanId> = {
        [process.env.LEMONSQUEEZY_VARIANT_STARTER!]: "starter",
        [process.env.LEMONSQUEEZY_VARIANT_PROFESSIONAL!]: "professional",
        [process.env.LEMONSQUEEZY_VARIANT_BUSINESS!]: "business",
      };
      plan = variantMap[variantId] ?? "free";
    }
  }

  const supabase = createServiceSupabaseClient();
  await supabase.from("profiles").update({ plan }).eq("id", userId);

  return NextResponse.json({ ok: true });
}
