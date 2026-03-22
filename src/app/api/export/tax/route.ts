import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase-server";
import { PLAN_FEATURES } from "@/lib/plans";
import type { PlanId } from "@/lib/plans";

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

  const format = req.nextUrl.searchParams.get("format") || "standard";
  if (format === "datev") {
    const userPlan = (profile?.plan ?? "free") as PlanId;
    if (!PLAN_FEATURES[userPlan]?.datevExport) {
      return NextResponse.json(
        { error: "DATEV-Export ist ab dem Professional-Plan verfügbar." },
        { status: 403 },
      );
    }
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

  // UTF-8 BOM — required for correct display in Excel and DATEV software
  const BOM = "\uFEFF";

  // ── DATEV Buchungsstapel EXTF format ──
  if (format === "datev") {
    const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);

    // EXTF header row — exactly 20 semicolon-separated fields
    const datevHeader = [
      '"EXTF"',
      "700",
      "21",
      '"Buchungsstapel"',
      "12",
      `"${ts}"`,
      '""',       // Importiert
      '"SK"',     // Herkunft
      '""',       // Exportiert von
      '""',       // Importiert von
      `${year}0101`, // WJ-Beginn (YYYYMMDD)
      "4",           // Sachkontonummernlänge
      `${year}0101`, // Datumvon
      `${year}1231`, // Datumbis
      '""',          // Bezeichnung
      '""',          // Diktatkürzel
      "0",           // Buchungstyp (0 = ungebucht)
      "0",           // Rechnungslegungszweck
      "0",           // Festschreibung
      '"EUR"',       // WKZ
    ].join(";");

    // Column header row — must follow DATEV EXTF field order exactly
    const datevColumns = [
      "Umsatz (ohne Soll/Haben-Kz)",
      "Soll/Haben-Kennzeichen",
      "WKZ Umsatz",
      "Kurs",
      "Basis-Umsatz",
      "WKZ Basis-Umsatz",
      "Konto",
      "Gegenkonto (ohne BU-Schlüssel)",
      "BU-Schlüssel",
      "Belegdatum",
      "Belegfeld 1",
      "Belegfeld 2",
      "Skonto",
      "Buchungstext",
    ].join(";");

    const datevRows = (invoices ?? []).map((inv) => {
      const issueDate = new Date(inv.issue_date);
      const belegdatum = `${String(issueDate.getDate()).padStart(2, "0")}${String(issueDate.getMonth() + 1).padStart(2, "0")}`;
      const erloskonto =
        Number(inv.tax_rate) === 19
          ? "8400"
          : Number(inv.tax_rate) === 7
            ? "8300"
            : "8000";
      const invoiceNr = String(inv.invoice_number ?? "").replace(/"/g, '""');
      return [
        Number(inv.total ?? 0).toFixed(2).replace(".", ","),
        "S",
        "EUR",
        "",          // Kurs (leer bei EUR)
        "",          // Basis-Umsatz (leer bei EUR)
        "",          // WKZ Basis-Umsatz (leer bei EUR)
        "10000",     // Konto (Forderungen aus LuL)
        erloskonto,  // Gegenkonto (Erlöse)
        "",          // BU-Schlüssel
        belegdatum,
        `"${invoiceNr}"`, // Belegfeld 1
        "",               // Belegfeld 2
        "",               // Skonto
        `"${invoiceNr}"`, // Buchungstext
      ].join(";");
    });

    const csv = BOM + [datevHeader, datevColumns, ...datevRows].join("\r\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="EXTF_Buchungsstapel_${year}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // ── Standard CSV format ──
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

  const csv = BOM + [header.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="steuerexport-${year}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
