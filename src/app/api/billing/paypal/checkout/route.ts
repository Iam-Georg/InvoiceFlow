import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase-server";
import { getBaseUrl, getPayPalPlanId } from "@/lib/billing";
import type { SubscriptionPlan } from "@/types";

const paypalClientId = process.env.PAYPAL_CLIENT_ID;
const paypalSecret = process.env.PAYPAL_CLIENT_SECRET;
const paypalEnv = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";

function paypalApiBase() {
  return paypalEnv === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getPayPalToken() {
  if (!paypalClientId || !paypalSecret) return null;
  const auth = Buffer.from(`${paypalClientId}:${paypalSecret}`).toString("base64");
  const response = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export async function POST(req: NextRequest) {
  const { plan } = (await req.json()) as { plan?: SubscriptionPlan };
  if (!plan || plan === "free") {
    return NextResponse.json({ error: "Ungültiger Plan." }, { status: 400 });
  }

  const planId = getPayPalPlanId(plan);
  if (!planId) {
    return NextResponse.json(
      { error: `Keine PayPal Plan-ID für Plan '${plan}' konfiguriert.` },
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

  const token = await getPayPalToken();
  if (!token) {
    return NextResponse.json(
      { error: "PayPal API ist nicht konfiguriert oder nicht erreichbar." },
      { status: 500 },
    );
  }

  const baseUrl = getBaseUrl(req.url);
  const response = await fetch(`${paypalApiBase()}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: user.id,
      subscriber: user.email ? { email_address: user.email } : undefined,
      application_context: {
        brand_name: "InvoiceFlow",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${baseUrl}/settings?billing=success`,
        cancel_url: `${baseUrl}/settings?billing=cancel`,
      },
    }),
  });

  const payload = (await response.json()) as {
    id?: string;
    links?: Array<{ rel?: string; href?: string }>;
    message?: string;
  };
  if (!response.ok) {
    return NextResponse.json(
      { error: payload.message || "PayPal Checkout konnte nicht erstellt werden." },
      { status: 500 },
    );
  }

  const approvalUrl = payload.links?.find((link) => link.rel === "approve")?.href;
  if (!approvalUrl) {
    return NextResponse.json(
      { error: "PayPal Approval-Link fehlt." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: approvalUrl, subscriptionId: payload.id });
}
