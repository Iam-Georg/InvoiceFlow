import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";

lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });

export async function createCheckoutUrl(
  variantId: string,
  userEmail: string,
  userId: string,
): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutOptions: { embed: false },
    checkoutData: {
      email: userEmail,
      custom: { user_id: userId },
    },
    productOptions: {
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=1`,
    },
  });
  if (error || !data?.data?.attributes?.url) {
    throw new Error("Checkout konnte nicht erstellt werden");
  }
  return data.data.attributes.url;
}

export function getPlanVariantId(plan: "starter" | "professional" | "business"): string {
  const map: Record<string, string | undefined> = {
    starter: process.env.LEMONSQUEEZY_VARIANT_STARTER,
    professional: process.env.LEMONSQUEEZY_VARIANT_PROFESSIONAL,
    business: process.env.LEMONSQUEEZY_VARIANT_BUSINESS,
  };
  const id = map[plan];
  if (!id) throw new Error(`Keine Variant ID für Plan: ${plan}`);
  return id;
}
