import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Invoice, TemplateConfig, DEFAULT_TEMPLATE_CONFIG } from "@/types";

/* ── Style factory ────────────────────────────────── */

function createStyles(config: TemplateConfig) {
  const { colors } = config;
  const fontFamily = config.font;
  const fontBold =
    config.font === "Courier"
      ? "Courier-Bold"
      : config.font === "Times-Roman"
        ? "Times-Bold"
        : "Helvetica-Bold";

  return StyleSheet.create({
    page: {
      fontFamily,
      fontSize: 9,
      color: "#0A0F1E",
      backgroundColor: "#FFFFFF",
      padding: "40px 48px",
    },

    /* ── Classic header (split) ── */
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 40,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: "#DDE2EA",
      borderBottomStyle: "solid",
    },

    /* ── Modern header (centered) ── */
    headerModern: {
      alignItems: "center",
      marginBottom: 40,
      paddingBottom: 24,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
      borderBottomStyle: "solid",
    },
    headerModernMeta: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 32,
      marginTop: 16,
    },

    /* ── Minimal header ── */
    headerMinimal: {
      marginBottom: 40,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: "#EEF0F4",
      borderBottomStyle: "solid",
    },
    headerMinimalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },

    logoBox: {
      width: 32,
      height: 32,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    logoLetter: {
      color: "#FFFFFF",
      fontSize: 11,
      fontFamily: fontBold,
    },
    logoImage: {
      width: 40,
      height: 40,
      objectFit: "contain" as const,
      marginBottom: 6,
    },
    companyName: {
      fontSize: 13,
      fontFamily: fontBold,
      color: "#0A0F1E",
      letterSpacing: -0.3,
    },
    companyDetails: {
      fontSize: 8.5,
      color: colors.secondary,
      lineHeight: 1.6,
      marginTop: 4,
    },
    invoiceMeta: {
      alignItems: "flex-end",
    },
    invoiceLabel: {
      fontSize: 18,
      fontFamily: fontBold,
      color: colors.primary,
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    metaRow: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 3,
    },
    metaKey: {
      fontSize: 8,
      color: colors.secondary,
      width: 80,
      textAlign: "right",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    metaValue: {
      fontSize: 8.5,
      color: "#0A0F1E",
      fontFamily: fontBold,
      textAlign: "right",
    },

    /* ── Bill To ── */
    billSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 36,
    },
    billBlock: {
      flex: 1,
    },
    billLabel: {
      fontSize: 8,
      color: colors.secondary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
      fontFamily: fontBold,
    },
    billName: {
      fontSize: 11,
      fontFamily: fontBold,
      color: "#0A0F1E",
      marginBottom: 3,
    },
    billDetails: {
      fontSize: 8.5,
      color: "#3D4A5C",
      lineHeight: 1.6,
    },

    /* ── Table ── */
    table: {
      marginBottom: 24,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#F5F7FA",
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 1,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#F0F3F7",
      borderBottomStyle: "solid",
    },
    tableRowAlt: {
      backgroundColor: "#FAFBFC",
    },
    colDescription: { flex: 1 },
    colQty: { width: 48, textAlign: "right" },
    colPrice: { width: 72, textAlign: "right" },
    colTotal: { width: 80, textAlign: "right" },
    tableHeaderText: {
      fontSize: 7.5,
      fontFamily: fontBold,
      color: colors.secondary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    tableCellText: {
      fontSize: 8.5,
      color: "#0A0F1E",
    },
    tableCellMuted: {
      fontSize: 8.5,
      color: colors.secondary,
    },

    /* ── Totals ── */
    totalsBlock: {
      alignSelf: "flex-end",
      width: 220,
      marginBottom: 36,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 5,
      paddingHorizontal: 12,
    },
    totalLabel: {
      fontSize: 8.5,
      color: colors.secondary,
    },
    totalValue: {
      fontSize: 8.5,
      color: "#0A0F1E",
    },
    totalFinalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.primary,
      marginTop: 4,
    },
    totalFinalLabel: {
      fontSize: 10,
      fontFamily: fontBold,
      color: "#FFFFFF",
    },
    totalFinalValue: {
      fontSize: 10,
      fontFamily: fontBold,
      color: "#FFFFFF",
    },

    /* ── Notes ── */
    notesBlock: {
      backgroundColor: "#F5F7FA",
      padding: 14,
      marginBottom: 36,
    },
    notesLabel: {
      fontSize: 8,
      fontFamily: fontBold,
      color: colors.secondary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 5,
    },
    notesText: {
      fontSize: 8.5,
      color: "#3D4A5C",
      lineHeight: 1.6,
    },

    /* ── Footer ── */
    footer: {
      borderTopWidth: 1,
      borderTopColor: "#DDE2EA",
      borderTopStyle: "solid",
      paddingTop: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerText: {
      fontSize: 8,
      color: colors.secondary,
    },
    footerBrand: {
      fontSize: 8,
      color: colors.primary,
      fontFamily: fontBold,
    },
  });
}

/* ── Helpers ──────────────────────────────────────── */

function formatEur(amount: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("de-DE").format(new Date(dateStr));
}

/* ── Props ────────────────────────────────────────── */

interface Props {
  invoice: Invoice & {
    customer?: {
      name?: string;
      company?: string;
      address?: string;
      zip?: string;
      city?: string;
      email?: string;
    } | null;
  };
  profile: {
    full_name?: string;
    company_name?: string;
    company_address?: string;
    company_city?: string;
    company_zip?: string;
    company_tax_id?: string;
    email: string;
  };
  templateConfig?: TemplateConfig;
}

/* ── Logo ─────────────────────────────────────────── */

function LogoElement({
  config,
  styles,
}: {
  config: TemplateConfig;
  styles: ReturnType<typeof createStyles>;
}) {
  if (config.logoUrl) {
    return <Image src={config.logoUrl} style={styles.logoImage} />;
  }
  return (
    <View style={styles.logoBox}>
      <Text style={styles.logoLetter}>F</Text>
    </View>
  );
}

/* ── Company details text ─────────────────────────── */

function companyDetailsText(
  profile: Props["profile"],
  config: TemplateConfig,
) {
  return [
    profile.company_address,
    profile.company_zip && profile.company_city
      ? `${profile.company_zip} ${profile.company_city}`
      : profile.company_city,
    profile.email,
    config.showTaxId && profile.company_tax_id
      ? `St.-Nr.: ${profile.company_tax_id}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/* ── Meta rows ────────────────────────────────────── */

function MetaRows({
  invoice,
  styles,
}: {
  invoice: Props["invoice"];
  styles: ReturnType<typeof createStyles>;
}) {
  const rows = [
    ["Rechnungs-Nr.", invoice.invoice_number],
    ["Datum", formatDate(invoice.issue_date)],
    ["Fällig am", formatDate(invoice.due_date)],
  ];
  return (
    <>
      {rows.map(([key, val]) => (
        <View key={key} style={styles.metaRow}>
          <Text style={styles.metaKey}>{key}</Text>
          <Text style={styles.metaValue}>{val}</Text>
        </View>
      ))}
    </>
  );
}

/* ── Component ────────────────────────────────────── */

export default function InvoicePDF({
  invoice,
  profile,
  templateConfig,
}: Props) {
  const config = templateConfig ?? DEFAULT_TEMPLATE_CONFIG;
  const styles = createStyles(config);
  const customer = invoice.customer;
  const companyLine =
    profile.company_name || profile.full_name || "Mein Unternehmen";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header: Classic (split) ── */}
        {config.layout === "classic" && (
          <View style={styles.header}>
            <View>
              <LogoElement config={config} styles={styles} />
              <Text style={styles.companyName}>{companyLine}</Text>
              <Text style={styles.companyDetails}>
                {companyDetailsText(profile, config)}
              </Text>
            </View>
            <View style={styles.invoiceMeta}>
              <Text style={styles.invoiceLabel}>RECHNUNG</Text>
              <MetaRows invoice={invoice} styles={styles} />
            </View>
          </View>
        )}

        {/* ── Header: Modern (centered) ── */}
        {config.layout === "modern" && (
          <View style={styles.headerModern}>
            <LogoElement config={config} styles={styles} />
            <Text style={[styles.companyName, { fontSize: 16, marginBottom: 4 }]}>
              {companyLine}
            </Text>
            <Text style={[styles.companyDetails, { textAlign: "center" }]}>
              {companyDetailsText(profile, config)}
            </Text>
            <Text style={[styles.invoiceLabel, { marginTop: 16, alignSelf: "center" }]}>
              RECHNUNG
            </Text>
            <View style={styles.headerModernMeta}>
              {[
                ["Nr.", invoice.invoice_number],
                ["Datum", formatDate(invoice.issue_date)],
                ["Fällig", formatDate(invoice.due_date)],
              ].map(([key, val]) => (
                <View key={key} style={{ alignItems: "center" }}>
                  <Text style={[styles.metaKey, { textAlign: "center", width: "auto" }]}>
                    {key}
                  </Text>
                  <Text style={[styles.metaValue, { textAlign: "center" }]}>{val}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Header: Minimal ── */}
        {config.layout === "minimal" && (
          <View style={styles.headerMinimal}>
            <View style={styles.headerMinimalRow}>
              <View>
                <Text style={[styles.companyName, { fontSize: 14 }]}>
                  {companyLine}
                </Text>
                <Text style={styles.companyDetails}>
                  {companyDetailsText(profile, config)}
                </Text>
              </View>
              <View style={styles.invoiceMeta}>
                <Text style={[styles.invoiceLabel, { fontSize: 14 }]}>
                  RECHNUNG
                </Text>
                <MetaRows invoice={invoice} styles={styles} />
              </View>
            </View>
          </View>
        )}

        {/* ── Bill To ── */}
        <View style={styles.billSection}>
          <View style={styles.billBlock}>
            <Text style={styles.billLabel}>Rechnungsempfänger</Text>
            <Text style={styles.billName}>{customer?.name ?? "–"}</Text>
            <Text style={styles.billDetails}>
              {[
                customer?.company,
                customer?.address,
                customer?.zip && customer?.city
                  ? `${customer.zip} ${customer.city}`
                  : customer?.city,
                customer?.email,
              ]
                .filter(Boolean)
                .join("\n")}
            </Text>
          </View>
        </View>

        {/* ── Table ── */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>
              Leistung / Beschreibung
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Menge</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>
              Einzelpreis
            </Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>
              Gesamt
            </Text>
          </View>

          {invoice.items.map((item, i) => (
            <View
              key={item.id}
              style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.tableCellText, styles.colDescription]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCellMuted, styles.colQty]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCellMuted, styles.colPrice]}>
                {formatEur(item.unit_price)}
              </Text>
              <Text style={[styles.tableCellText, styles.colTotal]}>
                {formatEur(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Totals ── */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Nettobetrag</Text>
            <Text style={styles.totalValue}>{formatEur(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>MwSt. {invoice.tax_rate}%</Text>
            <Text style={styles.totalValue}>
              {formatEur(invoice.tax_amount)}
            </Text>
          </View>
          <View style={styles.totalFinalRow}>
            <Text style={styles.totalFinalLabel}>Gesamtbetrag</Text>
            <Text style={styles.totalFinalValue}>
              {formatEur(invoice.total)}
            </Text>
          </View>
        </View>

        {/* ── Notes ── */}
        {invoice.notes && (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>Anmerkungen</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {config.footerText} · {invoice.invoice_number}
          </Text>
          <Text style={styles.footerBrand}>Faktura</Text>
        </View>
      </Page>
    </Document>
  );
}
