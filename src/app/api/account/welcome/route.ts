import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createRouteSupabaseClient } from "@/lib/supabase-server";
import { getWelcomeEmailHtml } from "@/lib/email-templates";

export async function POST() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name || user.user_metadata?.full_name || "";
  const { subject, html } = getWelcomeEmailHtml(name);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@faktura.app";

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: `Faktura <${fromEmail}>`,
    to: user.email,
    subject,
    html,
  });

  if (error) {
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
