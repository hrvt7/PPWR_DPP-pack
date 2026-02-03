import { describe, expect, it } from "vitest";
import { buildQrPayload, hashReportId } from "../qrService";

describe("QR hash", () => {
  it("is deterministic", () => {
    const hash1 = hashReportId("report_1", "secret");
    const hash2 = hashReportId("report_1", "secret");
    expect(hash1).toBe(hash2);
  });

  it("builds payload with hash", () => {
    const payload = buildQrPayload("report_1", "https://example.com", "secret");
    expect(payload).toContain("/verify/report_1?hash=");
  });
});
