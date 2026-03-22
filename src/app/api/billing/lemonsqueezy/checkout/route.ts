import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase-server";
import { createCheckoutUrl, getPlanVariantId } from "@/lib/lemonsqueezy";
import type { PlanId } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = (await req.json()) as { plan?: PlanId };
  if (!plan || plan === "free") {
    return NextResponse.json({ error: "Ungültiger Plan" }, { status: 400 });
  }

  try {
    const variantId = getPlanVariantId(plan);
    const checkoutUrl = await createCheckoutUrl(variantId, user.email!, user.id);
    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
