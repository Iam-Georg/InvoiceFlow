import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

type InvoiceCronRow = {
  id: string;
  user_id: string;
  status: "draft" | "sent" | "open" | "overdue" | "paid";
  invoice_number: string;
  due_date: string;
  total: number;
  customer: { name?: string | null; email?: string | null } | null;
};

async function runCron(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const today = new Date().toISOString().split("T")[0];
  const intervalDays = Math.max(
    1,
    Number(process.env.AUTO_REMINDER_INTERVAL_DAYS ?? "7"),
  );
  const maxPerRun = Math.max(1, Number(process.env.AUTO_REMINDER_MAX_PER_RUN ?? "50"));

  const { data: updatedRows, error: overdueError } = await supabase
    .from("invoices")
    .update({ status: "overdue" })
    .in("status", ["open", "sent"])
    .lt("due_date", today)
    .select("id");

  if (overdueError) {
    return NextResponse.json({ error: overdueError.message }, { status: 500 });
  }

  const { data: invoices, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, user_id, status, invoice_number, due_date, total, customer:customers(name, email)")
    .eq("status", "overdue")
    .lt("due_date", today)
    .order("due_date", { ascending: true })
    .limit(maxPerRun);

  if (invoiceError) {
    return NextResponse.json({ error: invoiceError.message }, { status: 500 });
  }

  const candidates = (invoices as InvoiceCronRow[] | null) ?? [];
  if (candidates.length === 0) {
    return NextResponse.json({
      updated: updatedRows?.length ?? 0,
      candidates: 0,
      remindersSent: 0,
      skipped: 0,
    });
  }

  const invoiceIds = candidates.map((inv) => inv.id);
  const userIds = Array.from(new Set(candidates.map((inv) => inv.user_id)));

  const [{ data: reminders }, { data: profiles }] = await Promise.all([
    supabase
      .from("reminders")
      .select("invoice_id, created_at")
      .in("invoice_id", invoiceIds)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, company_name").in("id", userIds),
  ]);

  const senderByUser = new Map<string, string>();
  for (const profile of profiles ?? []) {
    senderByUser.set(
      String(profile.id),
      profile.company_name || profile.full_name || "Ihr Dienstleister",
    );
  }

  const latestReminderByInvoice = new Map<string, Date>();
  for (const reminder of reminders ?? []) {
    const invoiceId = String(reminder.invoice_id);
    if (!latestReminderByInvoice.has(invoiceId)) {
      latestReminderByInvoice.set(invoiceId, new Date(reminder.created_at));
    }
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({
      updated: updatedRows?.length ?? 0,
      candidates: candidates.length,
      remindersSent: 0,
      skipped: candidates.length,
      warning: "RESEND_API_KEY is not configured",
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const now = Date.now();
  const minIntervalMs = intervalDays * 24 * 60 * 60 * 1000;

  let remindersSent = 0;
  let skipped = 0;
  const reminderInserts: { invoice_id: string; user_id: string; type: string }[] = [];

  for (const invoice of candidates) {
    const customerEmail = invoice.customer?.email?.trim();
    if (!customerEmail) {
      skipped += 1;
      continue;
    }

    const lastReminder = latestReminderByInvoice.get(invoice.id);
    if (lastReminder && now - lastReminder.getTime() < minIntervalMs) {
      skipped += 1;
      continue;
    }

    const senderName = senderByUser.get(invoice.user_id) ?? "Ihr Dienstleister";
    const dueDate = new Intl.DateTimeFormat("de-DE").format(new Date(invoice.due_date));
    const amount = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(invoice.total);

    const sendResult = await resend.emails.send({
      from: `${senderName} <onboarding@resend.dev>`,
      to: customerEmail,
      subject: `Automatische Zahlungserinnerung - Rechnung ${invoice.invoice_number}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #0A0F1E;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Zahlungserinnerung</h2>
          <p style="color: #6B7A90; font-size: 14px; margin-bottom: 24px;">Rechnung ${invoice.invoice_number}</p>
          <p style="font-size: 14px; line-height: 1.6;">Sehr geehrte(r) ${invoice.customer?.name ?? "Kunde"},</p>
          <p style="font-size: 14px; line-height: 1.6;">Ihre Rechnung ist weiterhin offen:</p>
          <p style="font-size: 14px; line-height: 1.8;"><strong>Fällig am:</strong> ${dueDate}<br/><strong>Betrag:</strong> ${amount}</p>
          <p style="font-size: 14px; line-height: 1.6;">Bitte überweisen Sie den offenen Betrag. Vielen Dank.</p>
          <p style="font-size: 14px; line-height: 1.6; color: #6B7A90;">Mit freundlichen Grüßen,<br/><strong style="color:#0A0F1E;">${senderName}</strong></p>
        </div>
      `,
    });

    if (sendResult.error) {
      skipped += 1;
      continue;
    }

    reminderInserts.push({
      invoice_id: invoice.id,
      user_id: invoice.user_id,
      type: "automatic",
    });
    remindersSent += 1;
  }

  if (reminderInserts.length > 0) {
    const { error: insertError } = await supabase.from("reminders").insert(reminderInserts);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    updated: updatedRows?.length ?? 0,
    candidates: candidates.length,
    remindersSent,
    skipped,
    intervalDays,
  });
}

export async function POST(req: NextRequest) {
  return runCron(req);
}

export async function GET(req: NextRequest) {
  return runCron(req);
}
