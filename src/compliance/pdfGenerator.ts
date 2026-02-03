import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
  renderToBuffer
} from "@react-pdf/renderer";
import type { PackagingBox, Product } from "./types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111"
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 700
  },
  section: {
    marginBottom: 12
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
    color: "#333"
  },
  value: {
    fontSize: 11,
    marginBottom: 2
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 10
  },
  grid: {
    flexDirection: "row"
  },
  col: {
    flex: 1,
    paddingRight: 12
  },
  badge: {
    fontSize: 11,
    fontWeight: 700,
    padding: 6,
    borderWidth: 1,
    borderColor: "#111",
    alignSelf: "flex-start",
    marginBottom: 8
  },
  qr: {
    width: 220,
    height: 220,
    marginTop: 12,
    marginBottom: 12
  },
  footer: {
    marginTop: 12,
    fontSize: 9,
    color: "#555"
  }
});

export async function generateCompliancePdf(params: {
  product: Product;
  box: PackagingBox;
  emptySpacePercent: number;
  compliant: boolean;
  explanation: string;
  dppSummary: { title: string; description: string; dimensions: string };
  qrPng: Buffer;
  timestamp: string;
}) {
  const {
    product,
    box,
    emptySpacePercent,
    compliant,
    explanation,
    dppSummary,
    qrPng,
    timestamp
  } = params;

  const qrDataUrl = `data:image/png;base64,${qrPng.toString("base64")}`;

  const document = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>PPWR Compliance Report</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Product</Text>
          <Text style={styles.value}>{product.title}</Text>
          <Text style={styles.value}>ID: {product.id}</Text>
        </View>
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.label}>Product dimensions</Text>
            <Text style={styles.value}>
              {product.length_cm} x {product.width_cm} x {product.height_cm} cm
            </Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Selected packaging box</Text>
            <Text style={styles.value}>{box.name}</Text>
            <Text style={styles.value}>
              {box.length_cm} x {box.width_cm} x {box.height_cm} cm
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.label}>Empty space</Text>
          <Text style={styles.value}>{emptySpacePercent.toFixed(2)}%</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Compliance status</Text>
          <Text style={styles.badge}>
            {compliant ? "COMPLIANT" : "NON-COMPLIANT"}
          </Text>
          <Text style={styles.value}>{explanation}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Legal reference</Text>
          <Text style={styles.value}>EU PPWR Article 24</Text>
        </View>
        <Text style={styles.footer}>Generated at {timestamp}</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Digital Product Passport</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Product</Text>
          <Text style={styles.value}>{dppSummary.title}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{dppSummary.description}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Dimensions</Text>
          <Text style={styles.value}>{dppSummary.dimensions}</Text>
        </View>
        <Image style={styles.qr} src={qrDataUrl} />
        <Text style={styles.footer}>
          Generated via CompliPack. Not a legal certification.
        </Text>
      </Page>
    </Document>
  );

  return renderToBuffer(document);
}
