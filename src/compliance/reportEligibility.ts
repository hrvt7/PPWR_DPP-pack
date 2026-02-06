import type { PPWRDecision } from "./ppwrDecision";

export type ReportEligibility = {
  state: "blocked" | "review" | "final";
  can_generate_pdf: boolean;
  can_publish_qr: boolean;
  reason: string;
};

export function decideReportEligibility(
  decision: PPWRDecision
): ReportEligibility {
  if (decision.compliance_status === "fail") {
    return {
      state: "blocked",
      can_generate_pdf: false,
      can_publish_qr: false,
      reason: "PPWR non-compliant: report blocked"
    };
  }

  if (decision.compliance_status === "unknown") {
    return {
      state: "review",
      can_generate_pdf: true,
      can_publish_qr: false,
      reason: "Estimated data: merchant confirmation required"
    };
  }

  return {
    state: "final",
    can_generate_pdf: true,
    can_publish_qr: true,
    reason: "PPWR compliant: report finalized"
  };
}
