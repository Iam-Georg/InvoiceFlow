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
      "Fällig am: {{due_date}}",
      "Betrag: {{total}}",
      "",
      "Vielen Dank für die Zusammenarbeit.",
      "",
      "Mit freundlichen Grüßen",
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

export function getWelcomeEmailHtml(name: string): { subject: string; html: string } {
  const safeName = escapeHtml(name || "dort");
  return {
    subject: "Willkommen bei Faktura!",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #0A0F1E;">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Willkommen bei Faktura!</h2>
        <p style="font-size: 14px; line-height: 1.6;">Hallo ${safeName},</p>
        <p style="font-size: 14px; line-height: 1.6;">vielen Dank für deine Registrierung bei Faktura. Dein Account ist bereit.</p>
        <p style="font-size: 14px; line-height: 1.6;">So startest du am besten:</p>
        <ol style="font-size: 14px; line-height: 1.8; padding-left: 20px;">
          <li>Richte dein Unternehmen unter <strong>Einstellungen</strong> ein</li>
          <li>Lege deinen ersten <strong>Kunden</strong> an</li>
          <li>Erstelle deine erste <strong>Rechnung</strong></li>
        </ol>
        <p style="font-size: 14px; line-height: 1.6;">Bei Fragen erreichst du uns jederzeit über das Feedback-Widget in der App.</p>
        <p style="font-size: 14px; line-height: 1.6; color: #6B7A90;">Viel Erfolg!<br/><strong style="color: #0A0F1E;">Dein Faktura Team</strong></p>
      </div>
    `,
  };
}
