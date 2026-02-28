import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Invoice } from "@/types";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#0A0F1E",
    backgroundColor: "#FFFFFF",
    padding: "40px 48px",
  },

  // Header
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
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: "#1B3A6B",
    // borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  companyName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#0A0F1E",
    letterSpacing: -0.3,
  },
  companyDetails: {
    fontSize: 8.5,
    color: "#6B7A90",
    lineHeight: 1.6,
    marginTop: 4,
  },
  invoiceMeta: {
    alignItems: "flex-end",
  },
  invoiceLabel: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#1B3A6B",
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
    color: "#6B7A90",
    width: 80,
    textAlign: "right",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 8.5,
    color: "#0A0F1E",
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },

  // Bill To
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
    color: "#6B7A90",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
  },
  billName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0A0F1E",
    marginBottom: 3,
  },
  billDetails: {
    fontSize: 8.5,
    color: "#3D4A5C",
    lineHeight: 1.6,
  },

  // Table
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F5F7FA",
    paddingVertical: 8,
    paddingHorizontal: 12,
    // borderRadius: 3,
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
    fontFamily: "Helvetica-Bold",
    color: "#6B7A90",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  tableCellText: {
    fontSize: 8.5,
    color: "#0A0F1E",
  },
  tableCellMuted: {
    fontSize: 8.5,
    color: "#6B7A90",
  },

  // Totals
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
    color: "#6B7A90",
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
    backgroundColor: "#1B3A6B",
    // borderRadius: 3,
    marginTop: 4,
  },
  totalFinalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },
  totalFinalValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
  },

  // Notes
  notesBlock: {
    backgroundColor: "#F5F7FA",
    // borderRadius: 3,
    padding: 14,
    marginBottom: 36,
  },
  notesLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6B7A90",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 8.5,
    color: "#3D4A5C",
    lineHeight: 1.6,
  },

  // Footer
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
    color: "#6B7A90",
  },
  footerBrand: {
    fontSize: 8,
    color: "#1B3A6B",
    fontFamily: "Helvetica-Bold",
  },
});

function formatEur(amount: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("de-DE").format(new Date(dateStr));
}

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
}

export default function InvoicePDF({ invoice, profile }: Props) {
  const customer = invoice.customer;
  const companyLine =
    profile.company_name || profile.full_name || "Mein Unternehmen";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.logoBox}>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontFamily: "Helvetica-Bold",
                }}
              >
                F
              </Text>
            </View>
            <Text style={styles.companyName}>{companyLine}</Text>
            <Text style={styles.companyDetails}>
              {[
                profile.company_address,
                profile.company_zip && profile.company_city
                  ? `${profile.company_zip} ${profile.company_city}`
                  : profile.company_city,
                profile.email,
                profile.company_tax_id
                  ? `St.-Nr.: ${profile.company_tax_id}`
                  : null,
              ]
                .filter(Boolean)
                .join("\n")}
            </Text>
          </View>

          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceLabel}>RECHNUNG</Text>
            {[
              ["Rechnungs-Nr.", invoice.invoice_number],
              ["Datum", formatDate(invoice.issue_date)],
              ["Fällig am", formatDate(invoice.due_date)],
            ].map(([key, val]) => (
              <View key={key} style={styles.metaRow}>
                <Text style={styles.metaKey}>{key}</Text>
                <Text style={styles.metaValue}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bill To */}
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

        {/* Table */}
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

        {/* Totals */}
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

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>Anmerkungen</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Vielen Dank für Ihren Auftrag. · {invoice.invoice_number}
          </Text>
          <Text style={styles.footerBrand}>Faktura</Text>
        </View>
      </Page>
    </Document>
  );
}
