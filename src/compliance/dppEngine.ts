import type { Product } from "./types";

export function buildDppSummary(product: Product) {
  const dimensions = `${product.length_cm} x ${product.width_cm} x ${product.height_cm} cm`;
  const description = product.description
    ? product.description
    : "No description provided.";
  return {
    title: product.title,
    description,
    dimensions
  };
}
