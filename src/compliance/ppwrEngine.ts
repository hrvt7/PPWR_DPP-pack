import type { PackagingBox, PPWRResult, Product } from "./types";
import { recommendStandardBox } from "./boxRecommendation";
import { decidePPWRCompliance, type PPWRDecision } from "./ppwrDecision";

function volume(length: number, width: number, height: number) {
  return length * width * height;
}

function fitsBox(product: Product, box: PackagingBox) {
  return (
    box.length_cm >= product.length_cm &&
    box.width_cm >= product.width_cm &&
    box.height_cm >= product.height_cm
  );
}

export function calculatePPWRCompliance(params: {
  product: Product;
  boxes: PackagingBox[];
}): PPWRResult {
  const { product, boxes } = params;
  if (!boxes.length) {
    throw new Error("No packaging boxes available");
  }

  if (
    product.length_cm === null ||
    product.width_cm === null ||
    product.height_cm === null ||
    product.length_cm <= 0 ||
    product.width_cm <= 0 ||
    product.height_cm <= 0
  ) {
    throw new Error("Product dimensions missing or invalid");
  }

  const productVolume = volume(
    product.length_cm,
    product.width_cm,
    product.height_cm
  );

  const fittingBoxes = boxes.filter((box) => fitsBox(product, box));

  if (!fittingBoxes.length) {
    const smallest = [...boxes].sort(
      (a, b) => volume(a.length_cm, a.width_cm, a.height_cm) - volume(b.length_cm, b.width_cm, b.height_cm)
    )[0];
    return {
      compliant: false,
      empty_space_percent: 100,
      recommended_box: smallest,
      explanation_text:
        "No available box fits the product dimensions. Compliance cannot be achieved."
    };
  }

  const scored = fittingBoxes.map((box) => {
    const boxVolume = volume(box.length_cm, box.width_cm, box.height_cm);
    const emptySpacePercent = ((boxVolume - productVolume) / boxVolume) * 100;
    return { box, emptySpacePercent, boxVolume };
  });

  scored.sort((a, b) => {
    if (a.emptySpacePercent !== b.emptySpacePercent) {
      return a.emptySpacePercent - b.emptySpacePercent;
    }
    return a.boxVolume - b.boxVolume;
  });

  const best = scored[0];
  const compliant = best.emptySpacePercent < 40;

  return {
    compliant,
    empty_space_percent: Number(best.emptySpacePercent.toFixed(2)),
    recommended_box: best.box,
    explanation_text: compliant
      ? `Empty space is ${best.emptySpacePercent.toFixed(2)}%, below the 40% threshold.`
      : `Empty space is ${best.emptySpacePercent.toFixed(2)}%, above the 40% threshold.`
  };
}

export type PPWRDecisionResult = {
  recommended_box: PackagingBox;
  void_space_percentage: number;
  buffer_percent: number;
  compliance_status: PPWRDecision["compliance_status"];
  reasons: string[];
};

export function buildPPWRDecision(params: {
  product: Product;
  boxes: PackagingBox[];
  packaging_status?: "confirmed" | "estimated" | "missing";
  buffer_percent?: number;
}): PPWRDecisionResult {
  const recommendation = recommendStandardBox({
    product,
    boxes,
    packaging_status: params.packaging_status,
    buffer_percent: params.buffer_percent
  });

  if (recommendation.status === "error" || !recommendation.recommended_box) {
    throw new Error(recommendation.message || "Failed to recommend box");
  }

  const voidSpace = recommendation.void_space_percentage ?? 0;
  const decision = decidePPWRCompliance({
    packaging_status: params.packaging_status ?? product.packaging_status ?? "missing",
    void_space_percentage: voidSpace
  });

  return {
    recommended_box: recommendation.recommended_box as PackagingBox,
    void_space_percentage: voidSpace,
    buffer_percent: recommendation.buffer_percent,
    compliance_status: decision.compliance_status,
    reasons: decision.reasons
  };
}
