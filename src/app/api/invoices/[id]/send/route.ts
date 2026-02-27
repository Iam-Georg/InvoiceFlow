import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { createRouteSupabaseClient } from "@/lib/supabase-server";
import InvoicePDF from "@/components/invoices/InvoicePDF";
import {
  applyEmailTemplate,
  getDefaultInvoiceEmailTemplate,
  textToHtml,
} from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface SendPayload {
  subject?: string;
  body?: string;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const payload = (await req.json().catch(() => ({}))) as SendPayload;
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

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const senderName =
    profile?.company_name || profile?.full_name || "Ihr Dienstleister";
  const dueDate = new Intl.DateTimeFormat("de-DE").format(
    new Date(invoice.due_date),
  );
  const issueDate = new Intl.DateTimeFormat("de-DE").format(
    new Date(invoice.issue_date),
  );
  const total = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(invoice.total);

  const defaults = getDefaultInvoiceEmailTemplate();
  const baseSubject = payload.subject?.trim() || defaults.subject;
  const baseBody = payload.body?.trim() || defaults.body;
  const vars = {
    invoice_number: String(invoice.invoice_number),
    customer_name: customer.name || "Kunde",
    issue_date: issueDate,
    due_date: dueDate,
    total,
    sender_name: senderName,
  };

  const subject = applyEmailTemplate(baseSubject, vars);
  const bodyText = applyEmailTemplate(baseBody, vars);
  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #0A0F1E;">
      ${textToHtml(bodyText)}
    </div>
  `;

  const pdfDocument = React.createElement(InvoicePDF, {
    invoice: invoice as Parameters<typeof InvoicePDF>[0]["invoice"],
    profile: {
      ...(profile ?? {}),
      email: profile?.email || user.email || "",
    },
  }) as unknown as React.ReactElement<DocumentProps>;
  const pdfBuffer = await renderToBuffer(pdfDocument);

  const { error } = await resend.emails.send({
    from: `${senderName} <onboarding@resend.dev>`,
    to: customer.email,
    subject,
    html,
    attachments: [
      {
        filename: `${invoice.invoice_number}.pdf`,
        content: pdfBuffer.toString("base64"),
      },
    ],
  });

  if (error) {
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      status: invoice.status === "draft" ? "sent" : invoice.status,
      sent_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
