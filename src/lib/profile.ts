import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Profile } from "@/types";

export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<Profile | null> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (existing) {
    return existing as Profile;
  }

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name ?? "",
      plan: "free",
    },
    { onConflict: "id" },
  );

  const { data: created } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (created as Profile | null) ?? null;
}
