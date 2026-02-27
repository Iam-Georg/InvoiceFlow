import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase-server";

function csvEscape(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (text.includes(";") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET(req: NextRequest) {
  const supabase = await createRouteSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const yearParam = req.nextUrl.searchParams.get("year");
  const currentYear = new Date().getFullYear();
  const year = Number(yearParam || currentYear);
  if (!Number.isFinite(year) || year < 2000 || year > currentYear + 1) {
    return NextResponse.json({ error: "Ungueltiges Jahr" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (profile?.plan !== "business") {
    return NextResponse.json(
      { error: "Steuerexport ist nur im Business-Plan verfuegbar." },
      { status: 403 },
    );
  }

  const from = `${year}-01-01`;
  const to = `${year}-12-31`;

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(
      "invoice_number, issue_date, due_date, paid_at, status, subtotal, tax_rate, tax_amount, total",
    )
    .eq("user_id", user.id)
    .gte("issue_date", from)
    .lte("issue_date", to)
    .order("issue_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = [
    "Rechnungsnummer",
    "Rechnungsdatum",
    "Faelligkeitsdatum",
    "BezahltAm",
    "Status",
    "Netto",
    "MwStSatz",
    "MwStBetrag",
    "Brutto",
  ];

  const rows = (invoices ?? []).map((inv) => [
    csvEscape(inv.invoice_number),
    csvEscape(inv.issue_date),
    csvEscape(inv.due_date),
    csvEscape(inv.paid_at),
    csvEscape(inv.status),
    csvEscape(Number(inv.subtotal ?? 0).toFixed(2)),
    csvEscape(Number(inv.tax_rate ?? 0).toFixed(2)),
    csvEscape(Number(inv.tax_amount ?? 0).toFixed(2)),
    csvEscape(Number(inv.total ?? 0).toFixed(2)),
  ]);

  const csv = [header.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="steuerexport-${year}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
