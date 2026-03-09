import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createRouteSupabaseClient } from "@/lib/supabase-server";
import { escapeHtml } from "@/lib/email-templates";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, context: RouteContext) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { id } = await context.params;
  const supabase = await createRouteSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customer:customers(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const customer = invoice.customer as { name?: string; email?: string } | null;
  if (!customer?.email) {
    return NextResponse.json(
      { error: "Customer email missing" },
      { status: 400 },
    );
  }

  const senderName =
    profile?.company_name || profile?.full_name || "Ihr Dienstleister";
  const dueDate = new Intl.DateTimeFormat("de-DE").format(
    new Date(invoice.due_date),
  );
  const total = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(invoice.total);

  const { error } = await resend.emails.send({
    from: `${senderName} <${process.env.RESEND_FROM_EMAIL || "noreply@faktura.app"}>`,
    to: customer.email,
    subject: `Zahlungserinnerung - Rechnung ${invoice.invoice_number}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #0A0F1E;">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Zahlungserinnerung</h2>
        <p style="color: #6B7A90; font-size: 14px; margin-bottom: 24px;">Rechnung ${escapeHtml(String(invoice.invoice_number))}</p>
        <p style="font-size: 14px; line-height: 1.6;">Sehr geehrte(r) ${escapeHtml(customer.name ?? "Kunde")},</p>
        <p style="font-size: 14px; line-height: 1.6;">die Rechnung ist weiterhin offen:</p>
        <p style="font-size: 14px; line-height: 1.8;"><strong>Faellig am:</strong> ${escapeHtml(dueDate)}<br/><strong>Betrag:</strong> ${escapeHtml(total)}</p>
        <p style="font-size: 14px; line-height: 1.6;">Bitte ueberweisen Sie den offenen Betrag. Vielen Dank.</p>
        <p style="font-size: 14px; line-height: 1.6; color: #6B7A90;">Mit freundlichen Gruessen,<br/><strong style="color:#0A0F1E;">${escapeHtml(senderName)}</strong></p>
      </div>
    `,
  });

  if (error) {
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }

  await supabase.from("reminders").insert({
    invoice_id: id,
    user_id: user.id,
    type: "manual",
  });

  return NextResponse.json({ success: true });
}
