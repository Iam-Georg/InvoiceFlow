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

async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const baseUrl =
    process.env.PAYPAL_ENV === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

async function verifyWebhookSignature(
  req: NextRequest,
  rawBody: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID not configured");
    return false;
  }

  const transmissionId = req.headers.get("paypal-transmission-id");
  const transmissionTime = req.headers.get("paypal-transmission-time");
  const certUrl = req.headers.get("paypal-cert-url");
  const authAlgo = req.headers.get("paypal-auth-algo");
  const transmissionSig = req.headers.get("paypal-transmission-sig");

  if (!transmissionId || !transmissionTime || !certUrl || !transmissionSig || !authAlgo) {
    return false;
  }

  const accessToken = await getPayPalAccessToken();
  if (!accessToken) return false;

  const baseUrl =
    process.env.PAYPAL_ENV === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const verifyRes = await fetch(
    `${baseUrl}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    },
  );

  if (!verifyRes.ok) return false;
  const result = (await verifyRes.json()) as { verification_status?: string };
  return result.verification_status === "SUCCESS";
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Signaturprüfung
  const isValid = await verifyWebhookSignature(req, rawBody);
  if (!isValid) {
    console.error("PayPal webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as PayPalWebhookPayload;

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
