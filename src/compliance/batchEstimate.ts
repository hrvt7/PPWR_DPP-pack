import { getSupabaseServerClient } from "../../lib/supabase";
import { estimateProductDimensions } from "./estimateDimensions";
import { logComplianceAction } from "./auditLog";

type BatchEstimateParams = {
  product_ids?: string[];
  store_id?: string;
  actor_id?: string;
  batch_size?: number;
  limit?: number;
};

export type BatchEstimateResult = {
  requested: number;
  processed: number;
  estimated: number;
  skipped: number;
  failed: { product_id: string; reason: string }[];
};

const DEFAULT_BATCH_SIZE = 10;
const MAX_BATCH_SIZE = 25;

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function toReason(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

export async function estimateMissingDimensionsBatch(
  params: BatchEstimateParams
): Promise<BatchEstimateResult> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const productIds = (params.product_ids ?? []).filter((id) => id.trim());
  const storeId = params.store_id?.trim();
  if (!productIds.length && !storeId) {
    throw new Error("Either product_ids or store_id is required");
  }

  const batchSize = Math.min(
    Math.max(params.batch_size ?? DEFAULT_BATCH_SIZE, 1),
    MAX_BATCH_SIZE
  );
  const limit = params.limit ?? (productIds.length ? productIds.length : 1000);

  let products: Array<{
    id: string;
    title?: string | null;
    description?: string | null;
    packaging_status?: string | null;
  }> = [];

  if (productIds.length) {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, description, packaging_status")
      .in("id", productIds);
    if (error) {
      throw new Error("Failed to load products for estimation");
    }
    products = data ?? [];
  } else if (storeId) {
    const baseQuery = await supabase
      .from("products")
      .select("id, title, description, packaging_status")
      .eq("merchant_id", storeId)
      .limit(limit);
    if (baseQuery.error) {
      throw new Error("Failed to load products for estimation");
    }
    products = baseQuery.data ?? [];
  }

  const foundIds = new Set(products.map((product) => product.id));
  const failed: { product_id: string; reason: string }[] = [];
  if (productIds.length) {
    for (const id of productIds) {
      if (!foundIds.has(id)) {
        failed.push({ product_id: id, reason: "Not found" });
      }
    }
  }

  let skipped = 0;
  let processed = 0;
  let estimated = 0;

  for (const product of products) {
    if (product.packaging_status !== "missing") {
      skipped += 1;
    }
  }

  const missingProducts = products.filter(
    (product) => product.packaging_status === "missing"
  );

  const chunks = chunk(missingProducts, batchSize);
  for (const group of chunks) {
    for (const product of group) {
      processed += 1;
      if (!product.title) {
        failed.push({
          product_id: product.id,
          reason: "Missing title"
        });
        continue;
      }

      try {
        const estimate = await estimateProductDimensions({
          product_title: product.title,
          product_description: product.description ?? ""
        });

        const updateResult = await supabase
          .from("products")
          .update({
            length_cm: estimate.estimated_length_cm,
            width_cm: estimate.estimated_width_cm,
            height_cm: estimate.estimated_height_cm,
            packaging_status: "estimated",
            updated_at: new Date().toISOString()
          })
          .eq("id", product.id);

        if (updateResult.error) {
          throw new Error(`Failed to update product ${product.id}`);
        }

        estimated += 1;

        const actorId = params.actor_id ?? "system";
        try {
          await logComplianceAction({
            actor_id: actorId,
            action: `ai_estimation:${product.id}`,
            source: "ai"
          });
        } catch (error) {
          failed.push({
            product_id: product.id,
            reason: `Audit log failed: ${toReason(error)}`
          });
        }
      } catch (error) {
        failed.push({
          product_id: product.id,
          reason: toReason(error)
        });
      }
    }
  }

  return {
    requested: productIds.length ? productIds.length : products.length,
    processed,
    estimated,
    skipped,
    failed
  };
}
