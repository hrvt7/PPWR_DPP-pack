import { describe, expect, it } from "vitest";
import { generateCompliancePdf } from "../pdfGenerator";
import type { PackagingBox, Product } from "../types";

const product: Product = {
  id: "prod_pdf",
  source: "manual",
  title: "PDF Product",
  length_cm: 10,
  width_cm: 10,
  height_cm: 10,
  created_at: new Date()
};

const box: PackagingBox = {
  id: "box_pdf",
  name: "PDF Box",
  length_cm: 12,
  width_cm: 12,
  height_cm: 12
};

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y2ZrfcAAAAASUVORK5CYII=",
  "base64"
);

describe("PDF generation", () => {
  it("returns a non-empty buffer", async () => {
    const buffer = await generateCompliancePdf({
      product,
      box,
      emptySpacePercent: 10,
      compliant: true,
      explanation: "Empty space is 10%",
      dppSummary: {
        title: product.title,
        description: "Sample",
        dimensions: "10 x 10 x 10 cm"
      },
      qrPng: tinyPng,
      timestamp: new Date().toISOString()
    });
    expect(buffer.length).toBeGreaterThan(100);
  });
});
