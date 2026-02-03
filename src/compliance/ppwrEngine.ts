import type { PackagingBox, PPWRResult, Product } from "./types";

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
