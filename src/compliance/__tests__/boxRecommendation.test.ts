import { describe, expect, it } from "vitest";
import { recommendStandardBox } from "../boxRecommendation";
import type { Product, StandardBox } from "../types";

const baseProduct: Product = {
  id: "prod_box",
  source: "manual",
  title: "Boxed Product",
  length_cm: 10,
  width_cm: 10,
  height_cm: 10,
  created_at: new Date()
};

const boxes: StandardBox[] = [
  { id: "box_small", name: "Small", length_cm: 11, width_cm: 11, height_cm: 11 },
  { id: "box_large", name: "Large", length_cm: 20, width_cm: 20, height_cm: 20 }
];

describe("Box recommendation", () => {
  it("recommends the smallest fitting box with buffer", () => {
    const result = recommendStandardBox({
      product: baseProduct,
      boxes,
      buffer_percent: 0.12
    });
    expect(result.status).toBe("final");
    expect(result.recommended_box?.id).toBe("box_small");
    expect(result.void_space_percentage).toBeGreaterThan(0);
  });

  it("returns warning for estimated packaging", () => {
    const result = recommendStandardBox({
      product: baseProduct,
      boxes,
      packaging_status: "estimated"
    });
    expect(result.status).toBe("warning");
  });

  it("returns error when dimensions missing", () => {
    const result = recommendStandardBox({
      product: {
        ...baseProduct,
        length_cm: null,
        width_cm: null,
        height_cm: null
      },
      boxes
    });
    expect(result.status).toBe("error");
  });
});
