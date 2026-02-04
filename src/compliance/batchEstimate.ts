import { getSupabaseServerClient } from "../../lib/supabase";
import { estimateProductDimensions } from "./estimateDimensions";

export type BatchEstimateResult = {
  total_processed: number;
  total_estimated: number;
  skipped: number;
};

export async function estimateMissingDimensionsBatch(params: {
  product_ids?: string[];
  limit?: number;
}): Promise<BatchEstimateResult> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const requestedIds = params.product_ids ?? [];
  const hasExplicitIds = requestedIds.length > 0;

  const query = supabase
    .from("products")
    .select("id, title, description, packaging_status")
    .limit(params.limit ?? 100);

  const { data, error } = hasExplicitIds
    ? await query.in("id", requestedIds)
    : await query.eq("packaging_status", "missing");

  if (error) {
    throw new Error("Failed to load products for estimation");
  }

  const products = data ?? [];
  const foundIds = new Set(products.map((product) => product.id));

  let skipped = 0;
  if (hasExplicitIds) {
    skipped += requestedIds.filter((id) => !foundIds.has(id)).length;
  }

  let totalEstimated = 0;

  for (const product of products) {
    if (product.packaging_status !== "missing") {
      skipped += 1;
      continue;
    }

    const title = product.title ?? "";
    const description = product.description ?? "";
    if (!title) {
      skipped += 1;
      continue;
    }

    const estimate = await estimateProductDimensions({
      product_title: title,
      product_description: description
    });

    const { error: updateError } = await supabase
      .from("products")
      .update({
        length_cm: estimate.estimated_length_cm,
        width_cm: estimate.estimated_width_cm,
        height_cm: estimate.estimated_height_cm,
        packaging_status: "estimated"
      })
      .eq("id", product.id);

    if (updateError) {
      throw new Error(`Failed to update product ${product.id}`);
    }

    totalEstimated += 1;
  }

  return {
    total_processed: products.length,
    total_estimated: totalEstimated,
    skipped
  };
}
