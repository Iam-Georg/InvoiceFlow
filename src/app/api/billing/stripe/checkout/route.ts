import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteSupabaseClient } from "@/lib/supabase-server";
import { getBaseUrl, getStripePriceId } from "@/lib/billing";
import type { SubscriptionPlan } from "@/types";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY ist nicht konfiguriert." },
      { status: 500 },
    );
  }

  const { plan } = (await req.json()) as { plan?: SubscriptionPlan };
  if (!plan || plan === "free") {
    return NextResponse.json({ error: "Ungültiger Plan." }, { status: 400 });
  }

  const priceId = getStripePriceId(plan);
  if (!priceId) {
    return NextResponse.json(
      { error: `Keine Stripe Price-ID für Plan '${plan}' konfiguriert.` },
      { status: 400 },
    );
  }

  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const baseUrl = getBaseUrl(req.url);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${baseUrl}/settings?billing=success`,
    cancel_url: `${baseUrl}/settings?billing=cancel`,
    metadata: {
      user_id: user.id,
      plan,
    },
  });

  return NextResponse.json({ url: session.url });
}
