import { NextResponse } from "next/server";
import { z } from "zod";
import { estimateMissingDimensionsBatch } from "../../../../../src/compliance/batchEstimate";
import {
  requireSupabaseUser,
  SupabaseAuthError
} from "../../../../../src/auth/requireSupabaseUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  product_ids: z.array(z.string().min(1)).optional(),
  store_id: z.string().min(1).optional(),
  actor_id: z.string().min(1).optional(),
  batch_size: z.number().int().min(1).max(25).optional(),
  limit: z.number().int().min(1).max(5000).optional()
});

export async function POST(request: Request) {
  try {
    await requireSupabaseUser(request);
    const payload = schema.parse(await request.json());
    if (!payload.product_ids?.length && !payload.store_id) {
      return NextResponse.json(
        { message: "product_ids or store_id is required" },
        { status: 400 }
      );
    }

    const result = await estimateMissingDimensionsBatch({
      product_ids: payload.product_ids,
      store_id: payload.store_id,
      actor_id: payload.actor_id,
      batch_size: payload.batch_size,
      limit: payload.limit
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
