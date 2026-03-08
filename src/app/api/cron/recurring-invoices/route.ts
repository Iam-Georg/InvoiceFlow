import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { generateInvoiceNumber } from "@/lib/utils";

function addInterval(date: string, interval: string): string {
  const d = new Date(date);
  switch (interval) {
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString().split("T")[0];
}

async function runCron(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  // Fetch active schedules where next_run_date <= today
  const { data: schedules, error } = await supabase
    .from("recurring_schedules")
    .select("*, template:invoices(*)")
    .eq("active", true)
    .lte("next_run_date", today);

  if (error || !schedules?.length) {
    return NextResponse.json({ processed: 0 });
  }

  let created = 0;

  for (const schedule of schedules) {
    const template = schedule.template;
    if (!template) continue;

    // Get user's invoice counter
    const { data: profile } = await supabase
      .from("profiles")
      .select("invoice_counter")
      .eq("id", schedule.user_id)
      .single();

    const counter = (profile?.invoice_counter ?? 0) + 1;

    // Calculate payment days from template
    const paymentDays = Math.round(
      (new Date(template.due_date).getTime() -
        new Date(template.issue_date).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const newDueDate = new Date(Date.now() + paymentDays * 86400000)
      .toISOString()
      .split("T")[0];

    // Create new invoice from template
    const { error: insertError } = await supabase.from("invoices").insert({
      user_id: schedule.user_id,
      customer_id: schedule.customer_id,
      invoice_number: generateInvoiceNumber(counter),
      status: "draft",
      issue_date: today,
      due_date: newDueDate,
      items: template.items,
      subtotal: template.subtotal,
      tax_rate: template.tax_rate,
      tax_amount: template.tax_amount,
      total: template.total,
      notes: template.notes,
      template_id: template.template_id ?? null,
    });

    if (insertError) continue;

    // Update invoice counter
    await supabase
      .from("profiles")
      .update({ invoice_counter: counter })
      .eq("id", schedule.user_id);

    // Advance next_run_date
    const nextDate = addInterval(schedule.next_run_date, schedule.interval);
    await supabase
      .from("recurring_schedules")
      .update({ next_run_date: nextDate })
      .eq("id", schedule.id);

    created++;
  }

  return NextResponse.json({ processed: created, total: schedules.length });
}

export async function POST(req: NextRequest) {
  return runCron(req);
}
