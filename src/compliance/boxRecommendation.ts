import type { PackagingStatus, Product, StandardBox } from "./types";

export type BoxRecommendation = {
  status: "error" | "warning" | "final";
  message: string;
  buffer_percent: number;
  product_volume_cm3?: number;
  buffered_volume_cm3?: number;
  void_space_percentage?: number;
  recommended_box?: StandardBox;
};

const DEFAULT_BUFFER_PERCENT = 0.12; // Configurable, not final.

function volume(length: number, width: number, height: number) {
  return length * width * height;
}

function fitsBox(product: Product, box: StandardBox) {
  return (
    box.length_cm >= product.length_cm &&
    box.width_cm >= product.width_cm &&
    box.height_cm >= product.height_cm
  );
}

export function recommendStandardBox(params: {
  product: Product;
  packaging_status?: PackagingStatus;
  boxes: StandardBox[];
  buffer_percent?: number;
}): BoxRecommendation {
  const { product, boxes } = params;
  const packagingStatus = params.packaging_status ?? product.packaging_status ?? "confirmed";
  const bufferPercent = params.buffer_percent ?? DEFAULT_BUFFER_PERCENT;

  if (packagingStatus === "missing") {
    return {
      status: "error",
      message: "Product dimensions missing. Cannot recommend a packaging box.",
      buffer_percent: bufferPercent
    };
  }

  if (!boxes.length) {
    return {
      status: "error",
      message: "No standard boxes available for recommendation.",
      buffer_percent: bufferPercent
    };
  }

  if (product.length_cm <= 0 || product.width_cm <= 0 || product.height_cm <= 0) {
    return {
      status: "error",
      message: "Invalid product dimensions. Cannot recommend a packaging box.",
      buffer_percent: bufferPercent
    };
  }

  const productVolume = volume(
    product.length_cm,
    product.width_cm,
    product.height_cm
  );
  const bufferedVolume = productVolume * (1 + bufferPercent);

  const fittingBoxes = boxes.filter((box) => fitsBox(product, box));
  if (!fittingBoxes.length) {
    return {
      status: "error",
      message: "No standard box fits the product dimensions.",
      buffer_percent: bufferPercent,
      product_volume_cm3: Number(productVolume.toFixed(2)),
      buffered_volume_cm3: Number(bufferedVolume.toFixed(2))
    };
  }

  const scored = fittingBoxes
    .map((box) => ({
      box,
      boxVolume: volume(box.length_cm, box.width_cm, box.height_cm)
    }))
    .sort((a, b) => a.boxVolume - b.boxVolume);

  const boxedWithBuffer = scored.filter((item) => item.boxVolume >= bufferedVolume);
  const best = boxedWithBuffer.length ? boxedWithBuffer[0] : scored[0];

  const voidSpacePercent =
    ((best.boxVolume - productVolume) / best.boxVolume) * 100;

  const status: BoxRecommendation["status"] =
    packagingStatus === "estimated" ? "warning" : "final";

  const message =
    boxedWithBuffer.length === 0
      ? "No box meets the buffer requirement; closest fitting box selected."
      : packagingStatus === "estimated"
        ? "Recommendation based on estimated dimensions; merchant confirmation required."
        : "Recommendation based on confirmed dimensions.";

  return {
    status,
    message,
    buffer_percent: bufferPercent,
    product_volume_cm3: Number(productVolume.toFixed(2)),
    buffered_volume_cm3: Number(bufferedVolume.toFixed(2)),
    void_space_percentage: Number(voidSpacePercent.toFixed(2)),
    recommended_box: best.box
  };
}
