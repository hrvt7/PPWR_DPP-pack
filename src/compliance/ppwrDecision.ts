import type { PackagingStatus } from "./types";

export type PPWRDecision = {
  compliance_status: "pass" | "fail" | "unknown";
  void_space_percentage: number;
  reasons: string[];
};

export function decidePPWRCompliance(params: {
  packaging_status: PackagingStatus;
  void_space_percentage: number;
}): PPWRDecision {
  const { packaging_status, void_space_percentage } = params;

  if (void_space_percentage > 40) {
    return {
      compliance_status: "fail",
      void_space_percentage,
      reasons: [
        "Void space exceeds 40% limit",
        "Use smaller box or adjust packaging"
      ]
    };
  }

  if (packaging_status === "missing") {
    return {
      compliance_status: "fail",
      void_space_percentage,
      reasons: [
        "Packaging dimensions missing",
        "Add product dimensions and confirm packaging"
      ]
    };
  }

  if (packaging_status === "estimated") {
    return {
      compliance_status: "unknown",
      void_space_percentage,
      reasons: [
        "Dimensions estimated, not legally confirmed",
        "Merchant must confirm packaging dimensions"
      ]
    };
  }

  return {
    compliance_status: "pass",
    void_space_percentage,
    reasons: ["Packaging compliant with PPWR Article 24"]
  };
}
