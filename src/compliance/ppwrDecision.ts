import type { PackagingStatus } from "./types";

export type PPWRDecision = {
  status: "pass" | "fail" | "warning";
  void_space_percentage: number;
  reason: string;
  action_required?: string;
};

export function decidePPWRCompliance(params: {
  packaging_status: PackagingStatus;
  void_space_percentage: number;
}): PPWRDecision {
  const { packaging_status, void_space_percentage } = params;

  if (packaging_status === "missing") {
    return {
      status: "fail",
      void_space_percentage,
      reason: "Packaging dimensions missing",
      action_required: "Add product dimensions and confirm packaging"
    };
  }

  if (void_space_percentage > 40) {
    return {
      status: "fail",
      void_space_percentage,
      reason: "Void space exceeds 40% limit",
      action_required: "Use smaller box or adjust packaging"
    };
  }

  if (packaging_status === "estimated") {
    return {
      status: "warning",
      void_space_percentage,
      reason: "Dimensions estimated, not legally confirmed",
      action_required: "Merchant must confirm packaging dimensions"
    };
  }

  return {
    status: "pass",
    void_space_percentage,
    reason: "Packaging compliant with PPWR Article 24"
  };
}
