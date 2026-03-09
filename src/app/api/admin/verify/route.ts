import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createRouteSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ admin: false }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ admin: false }, { status: 403 });
  }

  return NextResponse.json({ admin: true });
}
