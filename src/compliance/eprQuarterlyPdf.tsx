import React from "react";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

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
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 6
  },
  cell: {
    flex: 1
  }
});

export async function generateEprQuarterlyPdf(params: {
  periodLabel: string;
  totals: Array<{ material: string; weight_kg: number }>;
}) {
  const document = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>EPR Quarterly Export</Text>
        <View style={styles.section}>
          <Text>Period: {params.periodLabel}</Text>
        </View>
        <View style={styles.section}>
          {params.totals.map((row) => (
            <View key={row.material} style={styles.row}>
              <Text style={styles.cell}>{row.material}</Text>
              <Text style={styles.cell}>
                {row.weight_kg.toFixed(3)} kg
              </Text>
            </View>
          ))}
        </View>
        <Text>
          Disclaimer: Totals are aggregated from merchant-provided data.
        </Text>
      </Page>
    </Document>
  );

  return renderToBuffer(document);
}
