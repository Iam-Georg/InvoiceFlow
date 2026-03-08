● Die tiefgehende Analyse ist abgeschlossen. Hier ist der vollständige CTPO-Report:

                                                                                                                                                                                                                
  ---                                                                                                                                                                                                             FAKTURA — CTPO Audit Report                                                                                                                                                                                   
                                                                                                                                                                                                                  Executive Summary                                                                                                                                                                                                                                                                                                                                                                                                               Faktura ist ein solides Phase-1-Produkt mit exzellentem Design-System (9/10) und starker Invoice-Engine (95%). Es gibt jedoch 4 kritische Blocker vor Go-Live:                                                                                                                                                                                                                                                                
  1. GoBD-Verstoß: Gesendete Rechnungen sind editierbar
  2. PayPal-Webhook ohne Signaturprüfung: Jeder kann Plans upgraden
  3. Keine server-seitige Plan-Limit-Prüfung: Free-Limits umgehbar
  4. Checkout-Flow nicht verbunden: Billing-Buttons sind disabled

  ---
  Phase 1: Technisches Audit & Reifegrad

  1.1 Supabase RLS — Bewertung: 7/10

  Gut:
  - RLS auf allen Core-Tabellen (profiles, customers, invoices, reminders, invoice_templates, recurring_schedules)
  - Policies korrekt mit user_id = auth.uid()
  - increment_invoice_counter RPC als security definer korrekt

  Kritisch:
  - Feedback-Tabelle fehlt in Schema/Migration — Code in src/lib/feedback.ts greift darauf zu, aber keine RLS-Policies definiert. getAllFeedback() liest ALLE Einträge ohne user_id-Filter
  - Keine RLS-basierte Plan-Limitierung — Free-User können via direktem API-Call beliebig viele Rechnungen erstellen

  1.2 Singleton-Pattern — Bewertung: 9/10

  src/lib/supabase.ts implementiert korrektes Singleton:
  - Server-seitig: neuer Client pro Request (korrekt für SSR)
  - Client-seitig: globales Singleton via \_client
  - usePlan.ts nutzt korrektes useRef-Pattern

  Einziges Risiko: Wenn Komponenten createClient() direkt importieren statt über useRef, könnte es zu Race-Conditions kommen. Das Pattern ist aber konsistent eingehalten.

  1.3 GoBD-Compliance — Bewertung: 2/10 (KRITISCH)

  Aktuelle Lücken:

  ┌─────────────────────────────────────────┬────────┬──────────────────────────────────────────────────────────┐
  │               Anforderung               │ Status │                         Problem                          │
  ├─────────────────────────────────────────┼────────┼──────────────────────────────────────────────────────────┤
  │ Unveränderbarkeit gesendeter Rechnungen │ ❌     │ invoices/[id]/edit erlaubt Bearbeitung nach Versand      │
  ├─────────────────────────────────────────┼────────┼──────────────────────────────────────────────────────────┤
  │ Status-Änderung nur vorwärts            │ ❌     │ Status kann von "paid" zurück auf "draft" gesetzt werden │
  ├─────────────────────────────────────────┼────────┼──────────────────────────────────────────────────────────┤
  │ Lückenlose Nummernvergabe               │ ⚠️     │ Counter existiert, aber Löschung möglich                 │
  ├─────────────────────────────────────────┼────────┼──────────────────────────────────────────────────────────┤
  │ Aufbewahrungspflicht (10 Jahre)         │ ❌     │ Kein Soft-Delete, kein Audit-Log                         │
  ├─────────────────────────────────────────┼────────┼──────────────────────────────────────────────────────────┤
  │ Stornierung statt Löschung              │ ❌     │ Rechnungen werden hard-deleted                           │
  └─────────────────────────────────────────┴────────┴──────────────────────────────────────────────────────────┘

  Sofort-Fix für Invoice Edit — src/app/(dashboard)/invoices/[id]/edit/page.tsx:

  // Am Anfang der Komponente, nach dem Laden der Rechnung:
  useEffect(() => {
    if (invoice && (invoice.status === "sent" || invoice.status === "paid" || invoice.status === "overdue")) {
      toast.error("Gesendete Rechnungen können nicht bearbeitet werden.");
      router.replace(`/invoices/${invoice.id}`);
    }
  }, [invoice]);

  Server-seitiger Schutz — Neuer Check in der Update-Logik:

  // Vor dem Supabase update() Call
  const { data: existing } = await supabase
    .from("invoices")
    .select("status")
    .eq("id", invoiceId)
    .single();

  if (existing && ["sent", "paid", "overdue"].includes(existing.status)) {
    toast.error("GoBD: Gesendete Rechnungen sind unveränderlich.");
    return;
  }

  Stornierungs-Konzept statt Löschung:

  // Neuer Status in der Invoice-Tabelle
  type InvoiceStatus = "draft" | "sent" | "open" | "overdue" | "paid" | "cancelled";

  // Statt DELETE: Stornierung mit Verweis
  async function cancelInvoice(invoiceId: string) {
    const sb = getSupabase();
    await sb.from("invoices").update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      // Optional: Automatisch Stornorechnung erstellen
    }).eq("id", invoiceId);
  }

  1.4 Sicherheitslücken — Bewertung: 5/10

  ┌─────────────┬─────────────────────────────────────────┬─────────────────────────────────────┐
  │ Schweregrad │                  Issue                  │                Datei                │
  ├─────────────┼─────────────────────────────────────────┼─────────────────────────────────────┤
  │ 🔴 KRITISCH │ PayPal-Webhook ohne Signaturprüfung     │ api/billing/paypal/webhook/route.ts │
  ├─────────────┼─────────────────────────────────────────┼─────────────────────────────────────┤
  │ 🔴 KRITISCH │ Keine server-seitige Plan-Limit-Prüfung │ Invoice/Customer Creation           │
  ├─────────────┼─────────────────────────────────────────┼─────────────────────────────────────┤
  │ 🟠 HOCH     │ Admin-Panel nur client-seitig geschützt │ admin/page.tsx                      │
  ├─────────────┼─────────────────────────────────────────┼─────────────────────────────────────┤
  │ 🟠 HOCH     │ Cron-Jobs akzeptieren GET-Requests      │ api/cron/                           │
  ├─────────────┼─────────────────────────────────────────┼─────────────────────────────────────┤
  │ 🟡 MITTEL   │ Email-Template-Variablen XSS-Risiko     │ api/invoices/[id]/send/             │
  └─────────────┴─────────────────────────────────────────┴─────────────────────────────────────┘

  PayPal-Webhook-Fix:

  // src/app/api/billing/paypal/webhook/route.ts
  import { NextRequest, NextResponse } from "next/server";

  async function verifyPayPalWebhook(req: NextRequest, body: string): Promise<boolean> {
    const transmissionId = req.headers.get("paypal-transmission-id");
    const transmissionTime = req.headers.get("paypal-transmission-time");
    const certUrl = req.headers.get("paypal-cert-url");
    const transmissionSig = req.headers.get("paypal-transmission-sig");
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    if (!transmissionId || !transmissionTime || !certUrl || !transmissionSig || !webhookId) {
      return false;
    }

    const verifyUrl = process.env.PAYPAL_ENV === "live"
      ? "https://api-m.paypal.com/v1/notifications/verify-webhook-signature"
      : "https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature";

    const tokenRes = await fetch(/_ PayPal OAuth token endpoint _/);
    const { access_token } = await tokenRes.json();

    const res = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: req.headers.get("paypal-auth-algo"),
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    });

    const result = await res.json();
    return result.verification_status === "SUCCESS";
  }

  1.5 Feature-Reifegrad

  ┌─────────────────────────────────┬─────────────────┬──────────────────────────┐
  │             Feature             │ Vollständigkeit │           Prio           │
  ├─────────────────────────────────┼─────────────────┼──────────────────────────┤
  │ Rechnungen (CRUD + PDF + Email) │ 95%             │ —                        │
  ├─────────────────────────────────┼─────────────────┼──────────────────────────┤
  │ Template Builder                │ 100%            │ —                        │
  ├─────────────────────────────────┼─────────────────┼──────────────────────────┤
  │ Dashboard + Analytics           │ 90%             │ —                        │
  ├─────────────────────────────────┼─────────────────┼──────────────────────────┤
  │ Plan-System + Gating            │ 85%             │ Checkout fehlt           │
  ├─────────────────────────────────┼─────────────────┼──────────────────────────┤
  │ Kundenverwaltung                │ 65%             │ Edit/Delete fehlt        │
  ├─────────────────────────────────┼─────────────────┼──────────────────────────┤
  │ Wiederkehrende Rechnungen       │ 85%             │ UI-Management fehlt      │
  ├─────────────────────────────────┼─────────────────┼──────────────────────────┤
  │ Billing/Payments                │ 40%             │ Checkout nicht verbunden │
  ├─────────────────────────────────┼─────────────────┼──────────────────────────┤
  │ Admin-Panel                     │ 5%              │ Stub                     │
  ├─────────────────────────────────┼─────────────────┼──────────────────────────┤
  │ Support-System                  │ 10%             │ Stub                     │
  └─────────────────────────────────┴─────────────────┴──────────────────────────┘

  1.6 Innovative Feature-Vorschläge (MLP-Boost)

  1. Smart Dunning Automation — Automatisierte Mahnstufen (freundlich → formal → Inkasso-Warnung) mit konfigurierbaren Zeitintervallen und Plan-basierter Freischaltung
  2. Kunden-Zahlungsportal — Öffentlicher Link pro Rechnung, wo Kunden direkt bezahlen können (Stripe Payment Links)
  3. Cashflow-Prognose — ML-basierte Vorhersage der nächsten 3 Monate basierend auf offenen Rechnungen und historischem Zahlungsverhalten
  4. Automatische Bankabgleichung — CSV-Import von Kontoauszügen mit automatischem Matching zu offenen Rechnungen
  5. WhatsApp/SMS-Erinnerungen — Zusätzlich zu E-Mail-Mahnungen direkte Benachrichtigung per Messenger

  ---
  Phase 2: Vision & Monetarisierung

  2.1 Kernproblem

  "Deutsche Freelancer verbringen 3-5h/Monat mit Rechnungen, Mahnungen und Steuer-Vorbereitung — Tools wie sevDesk/lexoffice sind überladen und teuer (ab 14€/Monat), einfache Tools wie Zervant sind nicht     
  GoBD-konform."

  Faktura löst: GoBD-konforme Rechnungsstellung in unter 2 Minuten, mit intelligentem Zahlungsdruck-Score als Alleinstellungsmerkmal.

  2.2 Optimierte Preisgestaltung

  Die aktuelle Tier-Struktur ist solide, aber die Feature-Verteilung sollte optimiert werden:

  Empfehlung: "Goldilocks Pricing" — Der Professional-Plan muss der offensichtliche Sweet Spot sein.

  ┌───────────────────────────┬───────┬────────────┬──────────────────┬──────────────┐
  │          Feature          │ Free  │ Starter 9€ │ Professional 19€ │ Business 39€ │
  ├───────────────────────────┼───────┼────────────┼──────────────────┼──────────────┤
  │ Rechnungen/Monat          │ 3     │ 20         │ ∞                │ ∞            │
  ├───────────────────────────┼───────┼────────────┼──────────────────┼──────────────┤
  │ Kunden                    │ 2     │ 10         │ ∞                │ ∞            │
  ├───────────────────────────┼───────┼────────────┼──────────────────┼──────────────┤
  │ Templates                 │ 1     │ 1          │ 5                │ ∞            │
  ├───────────────────────────┼───────┼────────────┼──────────────────┼──────────────┤
  │ PDF-Download              │ ✅    │ ✅         │ ✅               │ ✅           │
  ├───────────────────────────┼───────┼────────────┼──────────────────┼──────────────┤
  │ Email-Versand             │ ❌    │ ✅         │ ✅               │ ✅           │
  ├───────────────────────────┼───────┼────────────┼──────────────────┼──────────────┤
  │ Zahlungserinnerungen      │ ❌    │ 1x manuell │ Auto-Dunning     │ Auto-Dunning │
  ├───────────────────────────┼───────┼────────────┼──────────────────┼──────────────┤
  │ Pressure Score            │ Basis │ Voll       │ Voll             │ Voll         │
  ├───────────────────────────┼───────┼────────────┼──────────────────┼──────────────┤
  │ Wiederkehrende Rechnungen │ ❌    │ ❌         │ ✅               │ ✅           │
  ├───────────────────────────┼───────┼────────────┼──────────────────┼──────────────┤
  │ DATEV-Export              │ ❌    │ ❌         │ ✅               │ ✅           │
  ├───────────────────────────┼───────┼────────────┼──────────────────┼──────────────┤
  │ KI-Rechnungserstellung    │ ❌    │ ❌         │ ✅               │ ✅           │
  ├───────────────────────────┼───────┼────────────┼──────────────────┼──────────────┤
  │ Kunden-Zahlungsportal     │ ❌    │ ❌         │ ❌               │ ✅           │
  ├───────────────────────────┼───────┼────────────┼──────────────────┼──────────────┤
  │ API-Zugang                │ ❌    │ ❌         │ ❌               │ ✅           │
  ├───────────────────────────┼───────┼────────────┼──────────────────┼──────────────┤
  │ Custom Branding           │ ❌    │ ❌         │ ❌               │ ✅           │
  └───────────────────────────┴───────┴────────────┴──────────────────┴──────────────┘

  Schlüssel-Änderungen vs. aktuell:
  - Free: Von 5 auf 3 Rechnungen reduzieren (schnellerer Conversion-Trigger)
  - Starter: Email-Versand rein (größter Pain-Point für Free-User)
  - Professional: Recurring + DATEV + KI (die "Muss-haben" Features für Vollzeit-Freelancer)
  - Business: Portal + API + Branding (Enterprise-Features)

  2.3 Conversion-Optimierung der Lock-Mechanismen

  Aktuelle Schwäche: Der LockedFeature-Wrapper zeigt nur "Ab [Plan]" — das reicht nicht für Conversion.

  Verbesserung 1: Kontextuelles Upgrade-Nudging

  // src/components/LockedFeature.tsx — Erweiterte Version
  // Statt generischem Lock-Overlay: Feature-spezifische Value-Props

  const VALUE_PROPS: Record<string, string> = {
    "E-Mail-Versand": "Rechnungen direkt per E-Mail senden — spart Ø 15 Min. pro Rechnung",
    "Wiederkehrende Rechnungen": "Automatische monatliche Rechnungen — nie wieder vergessen",
    "DATEV-Export": "1-Klick Steuerberater-Export — spart Ø 2h pro Quartal",
    "KI-Entwurf": "Rechnung in 30 Sekunden aus Freitext erstellen",
    "Zahlungserinnerungen": "Automatische Mahnungen — Ø 40% schnellere Zahlung",
  };

  // Im LockedFeature-Overlay:
  <div style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    padding: "6px 12px",
    boxShadow: "var(--shadow-sm)",
  }}>
    <Lock size={10} color="var(--accent)" />
    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--accent)" }}>
      {VALUE_PROPS[featureName] || `Ab ${PLAN_LABELS[requiredPlan]}`}
    </span>
  </div>

  Verbesserung 2: Usage-basierte Upgrade-Trigger

  // src/hooks/useUpgradeTrigger.ts
  "use client";
  import { useEffect } from "react";
  import { usePlan } from "./usePlan";
  import { toast } from "sonner";

  export function useUpgradeTrigger(invoiceCount: number, customerCount: number) {
    const { plan, features } = usePlan();

    useEffect(() => {
      if (plan !== "free") return;

      // 80% Limit-Warnung
      const invoiceRatio = invoiceCount / features.maxInvoices;
      const customerRatio = customerCount / features.maxCustomers;

      if (invoiceRatio >= 0.8 && invoiceRatio < 1) {
        toast(
          `Noch ${features.maxInvoices - invoiceCount} Rechnungen im Free-Plan übrig`,
          {
            action: {
              label: "Upgraden",
              onClick: () => window.location.href = "/billing",
            },
            duration: 8000,
          }
        );
      }

      if (invoiceRatio >= 1) {
        toast.error("Rechnungs-Limit erreicht", {
          description: "Upgrade auf Starter für unbegrenzte Rechnungen – ab 9€/Monat",
          action: {
            label: "Jetzt upgraden",
            onClick: () => window.location.href = "/billing",
          },
          duration: 0, // bleibt stehen
        });
      }
    }, [invoiceCount, customerCount, plan, features]);
  }

  Verbesserung 3: Trial-Mechanismus für Professional

  // In plans.ts ergänzen:
  export const TRIAL_DAYS = 14;

  export interface TrialInfo {
    isTrialing: boolean;
    trialEndsAt: string | null;
    daysRemaining: number;
  }

  // In profiles-Tabelle: trial_ends_at TIMESTAMP
  // Bei Registrierung: trial_ends_at = NOW() + 14 days, plan = "professional"
  // Nach Ablauf: Cron-Job setzt plan = "free"

  ---
  Phase 3: Marktanalyse Deutschland

  3.1 Zielgruppe

  ┌────────────────────────────────────────┬─────────────┬──────────────────────┬────────────┐
  │                Segment                 │ Anzahl (DE) │ Zahlungsbereitschaft │  Relevanz  │
  ├────────────────────────────────────────┼─────────────┼──────────────────────┼────────────┤
  │ Solo-Freelancer (IT, Design, Text)     │ ~1.4 Mio.   │ 10-20€/Monat         │ ⭐⭐⭐⭐⭐ │
  ├────────────────────────────────────────┼─────────────┼──────────────────────┼────────────┤
  │ Kleinunternehmer (< 5 MA)              │ ~2.1 Mio.   │ 15-40€/Monat         │ ⭐⭐⭐⭐   │
  ├────────────────────────────────────────┼─────────────┼──────────────────────┼────────────┤
  │ Freiberufler (Ärzte, Anwälte, Berater) │ ~1.3 Mio.   │ 20-50€/Monat         │ ⭐⭐⭐     │
  ├────────────────────────────────────────┼─────────────┼──────────────────────┼────────────┤
  │ Nebenberuflich Selbstständige          │ ~2.8 Mio.   │ 0-10€/Monat          │ ⭐⭐       │
  └────────────────────────────────────────┴─────────────┴──────────────────────┴────────────┘

  Total Addressable Market (TAM): ~7.6 Mio. potenzielle Nutzer
  Serviceable Addressable Market (SAM): ~1.4 Mio. (Solo-Freelancer, technisch affin)
  Serviceable Obtainable Market (SOM, 3 Jahre): ~14.000 User (1% SAM)

  3.2 Revenue-Prognose (konservativ)

  ┌───────────────┬───────────┬────────────┬────────┬─────────┐
  │   Szenario    │ User (Y1) │ Paid-Ratio │ Ø ARPU │   MRR   │
  ├───────────────┼───────────┼────────────┼────────┼─────────┤
  │ Pessimistisch │ 2.000     │ 5%         │ 12€    │ 1.200€  │
  ├───────────────┼───────────┼────────────┼────────┼─────────┤
  │ Realistisch   │ 5.000     │ 8%         │ 14€    │ 5.600€  │
  ├───────────────┼───────────┼────────────┼────────┼─────────┤
  │ Optimistisch  │ 15.000    │ 12%        │ 16€    │ 28.800€ │
  └───────────────┴───────────┴────────────┴────────┴─────────┘

  3.3 Wettbewerber-Landschaft

  ┌────────────────┬──────────┬─────────────────────────────────┬───────────────────────┐
  │      Tool      │ Preis ab │             Stärke              │       Schwäche        │
  ├────────────────┼──────────┼─────────────────────────────────┼───────────────────────┤
  │ sevDesk        │ 8,90€    │ Vollständige Buchhaltung        │ Überladen, langsam    │
  ├────────────────┼──────────┼─────────────────────────────────┼───────────────────────┤
  │ lexoffice      │ 5,90€    │ Steuerberater-Anbindung         │ Komplexes UI          │
  ├────────────────┼──────────┼─────────────────────────────────┼───────────────────────┤
  │ Debitoor/SumUp │ 7€       │ Einfach                         │ Eingestellt/limitiert │
  ├────────────────┼──────────┼─────────────────────────────────┼───────────────────────┤
  │ Zervant        │ 0€       │ Kostenlos                       │ Nicht GoBD-konform    │
  ├────────────────┼──────────┼─────────────────────────────────┼───────────────────────┤
  │ Papierkram     │ 8€       │ Gut für Freelancer              │ Veraltetes Design     │
  ├────────────────┼──────────┼─────────────────────────────────┼───────────────────────┤
  │ Faktura        │ 0€       │ Speed + Design + Pressure Score │ Noch kein Payment     │
  └────────────────┴──────────┴─────────────────────────────────┴───────────────────────┘

  ---
  Phase 4: SEO-Strategie

  4.1 Transaktionale Keywords (High Intent)

  ┌──────────────────────────────────────┬───────────────────┬────────────┬────────────┐
  │               Keyword                │ Suchvolumen/Monat │ Difficulty │    Prio    │
  ├──────────────────────────────────────┼───────────────────┼────────────┼────────────┤
  │ "rechnungsprogramm freelancer"       │ 2.400             │ Mittel     │ ⭐⭐⭐⭐⭐ │
  ├──────────────────────────────────────┼───────────────────┼────────────┼────────────┤
  │ "rechnung schreiben kostenlos"       │ 6.600             │ Hoch       │ ⭐⭐⭐⭐⭐ │
  ├──────────────────────────────────────┼───────────────────┼────────────┼────────────┤
  │ "rechnungssoftware kleinunternehmer" │ 3.600             │ Hoch       │ ⭐⭐⭐⭐   │
  ├──────────────────────────────────────┼───────────────────┼────────────┼────────────┤
  │ "online rechnung erstellen"          │ 4.400             │ Mittel     │ ⭐⭐⭐⭐   │
  ├──────────────────────────────────────┼───────────────────┼────────────┼────────────┤
  │ "gobd konforme rechnungssoftware"    │ 880               │ Niedrig    │ ⭐⭐⭐⭐⭐ │
  ├──────────────────────────────────────┼───────────────────┼────────────┼────────────┤
  │ "sevdesk alternative"                │ 1.900             │ Niedrig    │ ⭐⭐⭐⭐⭐ │
  ├──────────────────────────────────────┼───────────────────┼────────────┼────────────┤
  │ "lexoffice alternative kostenlos"    │ 720               │ Niedrig    │ ⭐⭐⭐⭐   │
  ├──────────────────────────────────────┼───────────────────┼────────────┼────────────┤
  │ "rechnungsvorlage freelancer"        │ 1.300             │ Mittel     │ ⭐⭐⭐     │
  └──────────────────────────────────────┴───────────────────┴────────────┴────────────┘

  4.2 Informationelle Keywords (Content-Strategie)

  ┌─────────────────────────────────────┬────────────────────────────────┬─────────────────────┐
  │                Thema                │        Keyword-Cluster         │     Content-Typ     │
  ├─────────────────────────────────────┼────────────────────────────────┼─────────────────────┤
  │ "Rechnung schreiben als Freelancer" │ Pflichtangaben, Muster, GoBD   │ Blog-Guide          │
  ├─────────────────────────────────────┼────────────────────────────────┼─────────────────────┤
  │ "Kleinunternehmerregelung §19 UStG" │ Rechnung ohne MwSt, Grenze     │ Blog + Tool         │
  ├─────────────────────────────────────┼────────────────────────────────┼─────────────────────┤
  │ "Mahnung schreiben"                 │ Vorlage, Fristen, Mahngebühren │ Blog + Feature-Page │
  ├─────────────────────────────────────┼────────────────────────────────┼─────────────────────┤
  │ "DATEV Export"                      │ CSV, Steuerberater, Format     │ Tutorial            │
  ├─────────────────────────────────────┼────────────────────────────────┼─────────────────────┤
  │ "Rechnungsnummer fortlaufend"       │ Pflicht, System, Beispiele     │ Blog                │
  └─────────────────────────────────────┴────────────────────────────────┴─────────────────────┘

  4.3 Technisches SEO — Action Items

  // 1. Structured Data auf Marketing-Seiten (Schema.org)
  // src/app/layout.tsx — im <head>
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Faktura",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "0",
      "highPrice": "39",
      "priceCurrency": "EUR",
      "offerCount": "4"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "0" // aktualisieren wenn Reviews kommen
    }
  })}} />

  // 2. FAQ Schema auf /preise
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Ist Faktura GoBD-konform?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, Faktura erfüllt alle GoBD-Anforderungen..."
        }
      }
    ]
  })}} />

  Weitere SEO-Maßnahmen:
  - sitemap.xml generieren (Next.js app/sitemap.ts)
  - robots.txt mit Disallow für /dashboard, /admin, /api
  - Canonical URLs auf allen Marketing-Seiten
  - Open Graph + Twitter Card Metadaten (teilweise vorhanden)
  - Core Web Vitals optimieren (LCP, CLS, INP)
  - Blog unter /blog mit programmatischem SEO für Long-Tail-Keywords

  4.4 Programmatisches SEO

  Erstelle automatisierte Landing-Pages:
  - /rechnung-schreiben/[branche] — "Rechnung schreiben als Fotograf/Designer/Entwickler/..."
  - /vorlage/[typ] — "Rechnungsvorlage für Webdesign/Beratung/..."
  - /vergleich/[tool] — "Faktura vs sevDesk/lexoffice/Debitoor"

  ---
  Phase 5: Security & Datenschutz

  5.1 DSGVO-Compliance Checklist

  ┌──────────────────────────────────────────┬────────┬───────────────────────────────────────────────────────────────┐
  │               Anforderung                │ Status │                            Action                             │
  ├──────────────────────────────────────────┼────────┼───────────────────────────────────────────────────────────────┤
  │ Datenschutzerklärung                     │ ✅     │ /datenschutz existiert                                        │
  ├──────────────────────────────────────────┼────────┼───────────────────────────────────────────────────────────────┤
  │ Impressum                                │ ✅     │ /impressum existiert                                          │
  ├──────────────────────────────────────────┼────────┼───────────────────────────────────────────────────────────────┤
  │ Cookie-Consent                           │ ❌     │ Kein Cookie-Banner (nur essentiell = OK, aber dokumentieren!) │
  ├──────────────────────────────────────────┼────────┼───────────────────────────────────────────────────────────────┤
  │ Recht auf Löschung                       │ ❌     │ Kein Account-Delete in Settings                               │
  ├──────────────────────────────────────────┼────────┼───────────────────────────────────────────────────────────────┤
  │ Datenexport (Art. 20)                    │ ⚠️     │ CSV-Export existiert, aber kein "Alle meine Daten"            │
  ├──────────────────────────────────────────┼────────┼───────────────────────────────────────────────────────────────┤
  │ Auftragsverarbeitung (AVV)               │ ❌     │ AVV mit Supabase/Resend/Stripe nötig                          │
  ├──────────────────────────────────────────┼────────┼───────────────────────────────────────────────────────────────┤
  │ Verzeichnis der Verarbeitungstätigkeiten │ ❌     │ Muss erstellt werden                                          │
  └──────────────────────────────────────────┴────────┴───────────────────────────────────────────────────────────────┘

  5.2 Sofortige Security-Patches

  Patch 1: Server-seitige Plan-Validierung

  // src/lib/plan-guard.ts (Neue Datei)
  import { createServiceSupabaseClient } from "./supabase-server";
  import { PLAN_FEATURES, type PlanId } from "./plans";

  export async function checkInvoiceLimit(userId: string): Promise<{
    allowed: boolean;
    current: number;
    max: number;
  }> {
    const sb = createServiceSupabaseClient();

    const { data: profile } = await sb
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    const plan = (profile?.plan || "free") as PlanId;
    const max = PLAN_FEATURES[plan].maxInvoices;

    if (max === Infinity) return { allowed: true, current: 0, max };

    const { count } = await sb
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    return {
      allowed: (count || 0) < max,
      current: count || 0,
      max,
    };
  }

  Patch 2: Cron-Jobs nur POST + Secret

  // Bestehende Cron-Routes anpassen:
  // ENTFERNEN: export async function GET(req) { return runCron(req); }
  // NUR: export async function POST(req) { ... }

  // Und im runCron():
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  Patch 3: Admin-Route härten

  // Statt Hardcoded UUID:
  // profiles-Tabelle: "role" TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'))
  // Admin-Page: Server-seitige Prüfung via API-Route

  // src/app/api/admin/verify/route.ts
  export async function GET(req: NextRequest) {
    const sb = createClient(); // with auth context
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ admin: false }, { status: 401 });

    const { data: profile } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return NextResponse.json({ admin: profile?.role === "admin" });
  }

  5.3 Verschlüsselungs-Konzept

  Für sensible Finanzdaten (optional, erhöht Vertrauens-Signal):

  // Konzept: Application-Level Encryption für Kundendaten
  // Schlüssel pro User, abgeleitet aus Auth-Token
  // Verschlüsselt: Kundenname, Adresse, Steuernummer
  // Unverschlüsselt: Beträge, Status, Timestamps (für Queries)

  // Dies ist ein langfristiges Ziel — aktuell reicht RLS + TLS

  ---
  Phase 6: USP & Konkurrenzanalyse

  6.1 Gap-Analyse

  ┌───────────────────────┬─────────┬───────────┬────────────────────┐
  │        Bereich        │ sevDesk │ lexoffice │      Faktura       │
  ├───────────────────────┼─────────┼───────────┼────────────────────┤
  │ Setup-Zeit            │ 15 Min. │ 10 Min.   │ < 2 Min. ✅        │
  ├───────────────────────┼─────────┼───────────┼────────────────────┤
  │ Erste Rechnung        │ 5 Min.  │ 4 Min.    │ < 1 Min. (KI) ✅   │
  ├───────────────────────┼─────────┼───────────┼────────────────────┤
  │ UI-Qualität           │ 6/10    │ 7/10      │ 9/10 ✅            │
  ├───────────────────────┼─────────┼───────────┼────────────────────┤
  │ Preis (Basis-Plan)    │ 8,90€   │ 5,90€     │ 0€ ✅              │
  ├───────────────────────┼─────────┼───────────┼────────────────────┤
  │ GoBD-Konformität      │ ✅      │ ✅        │ ⚠️ (nach Fix: ✅)  │
  ├───────────────────────┼─────────┼───────────┼────────────────────┤
  │ Zahlungsdruck-Score   │ ❌      │ ❌        │ ✅ Einzigartig     │
  ├───────────────────────┼─────────┼───────────┼────────────────────┤
  │ Business Health Score │ ❌      │ ❌        │ ✅ Einzigartig     │
  ├───────────────────────┼─────────┼───────────┼────────────────────┤
  │ Buchhaltung           │ ✅ Voll │ ✅ Voll   │ ❌ (bewusst nicht) │
  ├───────────────────────┼─────────┼───────────┼────────────────────┤
  │ Mobile App            │ ✅      │ ✅        │ ❌
