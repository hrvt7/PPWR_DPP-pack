import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
  renderToBuffer
} from "@react-pdf/renderer";
import type { Product } from "./types";
import type { BoxRecommendation } from "./boxRecommendation";
import type { PPWRDecision } from "./ppwrDecision";
import type { ReportEligibility } from "./reportEligibility";
import { generateQrPng } from "./qrService";

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
  },
  watermark: {
    position: "absolute",
    top: "40%",
    left: "8%",
    transform: "rotate(-30deg)",
    fontSize: 64,
    color: "#999",
    opacity: 0.2
  }
});

function formatUtc(date: Date) {
  return date.toISOString().replace("T", " ").replace("Z", " UTC");
}

function deriveReportId(verificationUrl: string) {
  try {
    const url = new URL(verificationUrl);
    const match = url.pathname.match(/\/verify\/([^/?#]+)/);
    return match?.[1] ?? "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}

export async function generatePPWRLegalPdf(params: {
  product: Product;
  boxRecommendation: BoxRecommendation;
  decision: PPWRDecision;
  eligibility: ReportEligibility;
  verificationUrl: string;
}) {
  const { product, boxRecommendation, decision, eligibility, verificationUrl } =
    params;

  if (eligibility.state === "blocked") {
    throw new Error("Report is blocked and cannot be generated.");
  }

  const qrPng = await generateQrPng(verificationUrl);
  const qrDataUrl = `data:image/png;base64,${qrPng.toString("base64")}`;
  const watermarkText =
    eligibility.state === "review" ? "DRAFT – NOT FINAL" : undefined;

  const reportId = deriveReportId(verificationUrl);
  const timestamp = formatUtc(new Date());
  const sku = product.external_id ?? "N/A";
  const productDims = `${product.length_cm} x ${product.width_cm} x ${product.height_cm} cm`;

  const box = boxRecommendation.recommended_box;
  const boxDims = box
    ? `${box.length_cm} x ${box.width_cm} x ${box.height_cm} cm`
    : "N/A";

  const voidSpace =
    typeof boxRecommendation.void_space_percentage === "number"
      ? `${boxRecommendation.void_space_percentage.toFixed(2)}%`
      : "N/A";

  const document = (
    <Document>
      <Page size="A4" style={styles.page}>
        {watermarkText ? (
          <Text style={styles.watermark}>{watermarkText}</Text>
        ) : null}
        <Text style={styles.title}>PPWR Packaging Compliance Report</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Report ID</Text>
          <Text style={styles.value}>{reportId}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Date (UTC)</Text>
          <Text style={styles.value}>{timestamp}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Product</Text>
          <Text style={styles.value}>{product.title}</Text>
          <Text style={styles.value}>SKU: {sku}</Text>
        </View>
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.label}>Product dimensions (cm)</Text>
            <Text style={styles.value}>{productDims}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Recommended box dimensions (cm)</Text>
            <Text style={styles.value}>{boxDims}</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Void space percentage</Text>
          <Text style={styles.value}>{voidSpace}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>PPWR status</Text>
          <Text style={styles.badge}>
            {decision.compliance_status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.footer}>
          This report is generated from merchant-provided data and is not legal
          advice. Carbon footprint uses a light estimate method.
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        {watermarkText ? (
          <Text style={styles.watermark}>{watermarkText}</Text>
        ) : null}
        <Text style={styles.title}>Verification &amp; Legal</Text>
        <Image style={styles.qr} src={qrDataUrl} />
        <Text style={styles.value}>Scan to verify this report</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Legal disclaimer</Text>
          <Text style={styles.value}>
            This report is generated based on merchant-provided data. It does
            not constitute legal advice.
          </Text>
        </View>
        <Text style={styles.footer}>Generated by CompliPack</Text>
      </Page>
    </Document>
  );

  return renderToBuffer(document);
}
