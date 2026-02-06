import { describe, expect, it } from "vitest";
import { decidePPWRCompliance } from "../ppwrDecision";

describe("PPWR decision format", () => {
  it("returns unknown for missing packaging", () => {
    const result = decidePPWRCompliance({
      packaging_status: "missing",
      void_space_percentage: 10
    });
    expect(result.compliance_status).toBe("unknown");
    expect(Array.isArray(result.reasons)).toBe(true);
  });

  it("returns fail when void space exceeds 40", () => {
    const result = decidePPWRCompliance({
      packaging_status: "confirmed",
      void_space_percentage: 45
    });
    expect(result.compliance_status).toBe("fail");
  });
});
