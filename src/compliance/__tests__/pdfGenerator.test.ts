import { describe, expect, it } from "vitest";
import { generatePPWRLegalPdf } from "../ppwrLegalPdf";
import type { PackagingBox, Product } from "../types";
import type { BoxRecommendation } from "../boxRecommendation";
import type { PPWRDecision } from "../ppwrDecision";
import type { ReportEligibility } from "../reportEligibility";

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

describe("PDF generation", () => {
  it("returns a non-empty buffer", async () => {
    const recommendation: BoxRecommendation = {
      status: "final",
      message: "Ok",
      buffer_percent: 0.12,
      void_space_percentage: 10,
      recommended_box: box
    };
    const decision: PPWRDecision = {
      compliance_status: "pass",
      void_space_percentage: 10,
      reasons: ["Ok"]
    };
    const eligibility: ReportEligibility = {
      state: "final",
      can_generate_pdf: true,
      can_publish_qr: true,
      reason: "ok"
    };
    const buffer = await generatePPWRLegalPdf({
      product,
      boxRecommendation: recommendation,
      decision,
      eligibility,
      verificationUrl: "https://example.com/verify/report_1?hash=abc"
    });
    expect(buffer.length).toBeGreaterThan(100);
  });
});
