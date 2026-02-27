import type { SubscriptionPlan } from "@/types";

export const PLAN_ORDER: SubscriptionPlan[] = [
  "free",
  "starter",
  "professional",
  "business",
];

export function getStripePriceId(plan: SubscriptionPlan): string | null {
  const map: Record<SubscriptionPlan, string | undefined> = {
    free: undefined,
    starter: process.env.STRIPE_PRICE_STARTER,
    professional: process.env.STRIPE_PRICE_PROFESSIONAL,
    business: process.env.STRIPE_PRICE_BUSINESS,
  };
  return map[plan] ?? null;
}

export function getPayPalPlanId(plan: SubscriptionPlan): string | null {
  const map: Record<SubscriptionPlan, string | undefined> = {
    free: undefined,
    starter: process.env.PAYPAL_PLAN_ID_STARTER,
    professional: process.env.PAYPAL_PLAN_ID_PROFESSIONAL,
    business: process.env.PAYPAL_PLAN_ID_BUSINESS,
  };
  return map[plan] ?? null;
}

export function getPlanFromStripePrice(
  priceId: string | null | undefined,
): SubscriptionPlan | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL) return "professional";
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return "business";
  return null;
}

export function getPlanFromPayPalPlanId(
  planId: string | null | undefined,
): SubscriptionPlan | null {
  if (!planId) return null;
  if (planId === process.env.PAYPAL_PLAN_ID_STARTER) return "starter";
  if (planId === process.env.PAYPAL_PLAN_ID_PROFESSIONAL) return "professional";
  if (planId === process.env.PAYPAL_PLAN_ID_BUSINESS) return "business";
  return null;
}

export function getBaseUrl(reqUrl: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const parsed = new URL(reqUrl);
  return `${parsed.protocol}//${parsed.host}`;
}
