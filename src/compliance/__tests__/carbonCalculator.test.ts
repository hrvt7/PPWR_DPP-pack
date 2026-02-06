import { describe, expect, it } from "vitest";
import { calculateCarbonFootprint } from "../../../lib/carbon-calculator";

describe("Carbon calculator", () => {
  it("calculates material + transport footprint", () => {
    const result = calculateCarbonFootprint(1000, "cardboard", 500);
    expect(result.material_kg_co2e).toBeCloseTo(0.94, 3);
    expect(result.transport_kg_co2e).toBeCloseTo(0.0525, 4);
    expect(result.total_kg_co2e).toBeCloseTo(0.9925, 3);
    expect(result.methodology_id).toBe("LIGHT-v1");
  });
});
