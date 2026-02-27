import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { getPlanFromStripePrice } from "@/lib/billing";
import type { SubscriptionPlan } from "@/types";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe Webhook ist nicht vollständig konfiguriert." },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  async function setPlanByCustomer(customerId: string | null, plan: SubscriptionPlan) {
    if (!customerId) return;
    await supabase.from("profiles").update({ plan }).eq("stripe_customer_id", customerId);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = typeof session.customer === "string" ? session.customer : null;
    const metadataPlan = session.metadata?.plan as SubscriptionPlan | undefined;
    const plan = metadataPlan && metadataPlan !== "free" ? metadataPlan : "free";
    await setPlanByCustomer(customerId, plan);
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = typeof sub.customer === "string" ? sub.customer : null;
    const priceId = sub.items.data[0]?.price?.id;
    const plan = getPlanFromStripePrice(priceId);
    if (plan) {
      await setPlanByCustomer(customerId, plan);
    }
  }

  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "invoice.payment_failed"
  ) {
    const payload = event.data.object as
      | Stripe.Subscription
      | Stripe.Invoice
      | Stripe.Checkout.Session;
    const customer = typeof payload.customer === "string" ? payload.customer : null;
    await setPlanByCustomer(customer, "free");
  }

  return NextResponse.json({ received: true });
}
