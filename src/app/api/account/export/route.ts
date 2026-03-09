import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createRouteSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const [profile, customers, invoices, reminders, templates, feedback, recurring] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("customers").select("*").eq("user_id", userId),
      supabase.from("invoices").select("*").eq("user_id", userId),
      supabase.from("reminders").select("*").eq("user_id", userId),
      supabase.from("invoice_templates").select("*").eq("user_id", userId),
      supabase.from("feedback").select("*").eq("user_id", userId),
      supabase.from("recurring_schedules").select("*").eq("user_id", userId),
    ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    profile: profile.data,
    customers: customers.data ?? [],
    invoices: invoices.data ?? [],
    reminders: reminders.data ?? [],
    invoice_templates: templates.data ?? [],
    feedback: feedback.data ?? [],
    recurring_schedules: recurring.data ?? [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="faktura-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
