export interface EmailTemplatePayload {
  subject: string;
  body: string;
}

export interface EmailTemplateVariables {
  invoice_number: string;
  customer_name: string;
  issue_date: string;
  due_date: string;
  total: string;
  sender_name: string;
}

export function getDefaultInvoiceEmailTemplate(): EmailTemplatePayload {
  return {
    subject: "Rechnung {{invoice_number}}",
    body: [
      "Sehr geehrte(r) {{customer_name}},",
      "",
      "anbei erhalten Sie die Rechnung {{invoice_number}}.",
      "Rechnungsdatum: {{issue_date}}",
      "Faellig am: {{due_date}}",
      "Betrag: {{total}}",
      "",
      "Vielen Dank fuer die Zusammenarbeit.",
      "",
      "Mit freundlichen Gruessen",
      "{{sender_name}}",
    ].join("\n"),
  };
}

export function applyEmailTemplate(
  text: string,
  vars: EmailTemplateVariables,
): string {
  return text.replace(
    /\{\{(invoice_number|customer_name|issue_date|due_date|total|sender_name)\}\}/g,
    (_match, key: keyof EmailTemplateVariables) => vars[key] ?? "",
  );
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function textToHtml(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br/>");
}
