import type { PackagingStatus } from "./types";

export type PPWRDecision = {
  compliance_status: "pass" | "fail" | "warning";
  void_space_percentage: number;
  explanation: string;
};

export function decidePPWRCompliance(params: {
  packaging_status: PackagingStatus;
  void_space_percentage: number | null | undefined;
}): PPWRDecision {
  const { packaging_status, void_space_percentage } = params;

  if (packaging_status === "missing") {
    throw new Error("Packaging status is missing; cannot determine compliance.");
  }

  if (
    void_space_percentage === null ||
    void_space_percentage === undefined ||
    !Number.isFinite(void_space_percentage)
  ) {
    throw new Error("Void space percentage is missing or invalid.");
  }

  if (void_space_percentage > 40) {
    return {
      compliance_status: "fail",
      void_space_percentage,
      explanation: "Void space exceeds 40% limit."
    };
  }

  if (packaging_status === "estimated") {
    return {
      compliance_status: "warning",
      void_space_percentage,
      explanation:
        "Estimated dimensions; void space is within 40%. Merchant confirmation required."
    };
  }

  return {
    compliance_status: "pass",
    void_space_percentage,
    explanation: "Confirmed dimensions; void space is within 40%."
  };
}
