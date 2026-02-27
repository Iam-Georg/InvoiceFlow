import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteSupabaseClient } from "@/lib/supabase-server";
import { getBaseUrl } from "@/lib/billing";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY ist nicht konfiguriert." },
      { status: 500 },
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

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Kein Stripe-Kunde gefunden." },
      { status: 400 },
    );
  }

  const baseUrl = getBaseUrl(req.url);
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${baseUrl}/settings`,
  });

  return NextResponse.json({ url: session.url });
}
