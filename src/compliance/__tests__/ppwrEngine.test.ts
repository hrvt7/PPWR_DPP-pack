import { describe, expect, it } from "vitest";
import { calculatePPWRCompliance } from "../ppwrEngine";
import type { PackagingBox, Product } from "../types";

const baseProduct: Product = {
  id: "prod_1",
  source: "manual",
  title: "Sample",
  length_cm: 10,
  width_cm: 10,
  height_cm: 10,
  created_at: new Date()
};

const boxes: PackagingBox[] = [
  { id: "box_1", name: "Small", length_cm: 11, width_cm: 11, height_cm: 11 },
  { id: "box_2", name: "Medium", length_cm: 15, width_cm: 15, height_cm: 15 }
];

describe("PPWR compliance", () => {
  it("marks compliant when empty space below 40", () => {
    const result = calculatePPWRCompliance({ product: baseProduct, boxes });
    expect(result.compliant).toBe(true);
    expect(result.empty_space_percent).toBeLessThan(40);
  });

  it("marks non-compliant at exactly 40", () => {
    const product: Product = {
      ...baseProduct,
      length_cm: 10,
      width_cm: 10,
      height_cm: 6
    };
    const box: PackagingBox = {
      id: "box_exact",
      name: "Exact40",
      length_cm: 10,
      width_cm: 10,
      height_cm: 10
    };
    const result = calculatePPWRCompliance({ product, boxes: [box] });
    expect(result.empty_space_percent).toBeCloseTo(40, 1);
    expect(result.compliant).toBe(false);
  });

  it("returns non-compliant when no box fits", () => {
    const product: Product = {
      ...baseProduct,
      length_cm: 50,
      width_cm: 50,
      height_cm: 50
    };
    const result = calculatePPWRCompliance({ product, boxes });
    expect(result.compliant).toBe(false);
    expect(result.empty_space_percent).toBe(100);
  });
});
