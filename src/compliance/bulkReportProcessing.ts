import type { Product } from "./types";
import type { BoxRecommendation } from "./boxRecommendation";
import type { PPWRDecision } from "./ppwrDecision";
import type { ReportEligibility } from "./reportEligibility";
import { decidePPWRCompliance } from "./ppwrDecision";
import { decideReportEligibility } from "./reportEligibility";
import { generatePPWRLegalPdf } from "./ppwrLegalPdf";

export type BulkReportInput = {
  product: Product;
  boxRecommendation: BoxRecommendation;
  verificationUrl: string;
};

export type BulkReportItem = {
  product_id: string;
  decision: PPWRDecision;
  eligibility: ReportEligibility;
  pdf?: Buffer;
  error?: string;
};

export type BulkReportSummary = {
  total: number;
  pass: number;
  warning: number;
  fail: number;
  reports_generated: number;
  blocked: number;
};

export type BulkReportResult = {
  summary: BulkReportSummary;
  results: BulkReportItem[];
};

export async function processBulkPPWRReports(
  inputs: BulkReportInput[]
): Promise<BulkReportResult> {
  const summary: BulkReportSummary = {
    total: inputs.length,
    pass: 0,
    warning: 0,
    fail: 0,
    reports_generated: 0,
    blocked: 0
  };

  const results: BulkReportItem[] = [];

  for (const input of inputs) {
    const voidSpace = input.boxRecommendation.void_space_percentage;
    if (!Number.isFinite(voidSpace)) {
    const decision: PPWRDecision = {
      compliance_status: "fail",
      void_space_percentage: 0,
      reasons: [
        "Void space percentage missing",
        "Compute box recommendation with void space percentage"
      ]
    };
      const eligibility = decideReportEligibility(decision);
      summary.fail += 1;
      summary.blocked += 1;
      results.push({
        product_id: input.product.id,
        decision,
        eligibility,
        error: "Void space percentage missing"
      });
      continue;
    }

    const decision = decidePPWRCompliance({
      packaging_status:
        input.product.packaging_status ?? "missing",
      void_space_percentage: voidSpace
    });

    if (decision.compliance_status === "pass") summary.pass += 1;
    if (decision.compliance_status === "unknown") summary.warning += 1;
    if (decision.compliance_status === "fail") summary.fail += 1;

    const eligibility = decideReportEligibility(decision);
    if (eligibility.state === "blocked") {
      summary.blocked += 1;
      results.push({
        product_id: input.product.id,
        decision,
        eligibility
      });
      continue;
    }

    const pdf = await generatePPWRLegalPdf({
      product: input.product,
      boxRecommendation: input.boxRecommendation,
      decision,
      eligibility,
      verificationUrl: input.verificationUrl
    });

    summary.reports_generated += 1;
    results.push({
      product_id: input.product.id,
      decision,
      eligibility,
      pdf
    });
  }

  return { summary, results };
}
