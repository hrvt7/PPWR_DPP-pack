import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "../../../../../lib/supabase";
import { estimateProductDimensions } from "../../../../../src/compliance/estimateDimensions";
import { logComplianceAction } from "../../../../../src/compliance/auditLog";
import {
  requireSupabaseUser,
  SupabaseAuthError
} from "../../../../../src/auth/requireSupabaseUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  product_id: z.string().min(1).optional(),
  product_title: z.string().min(1),
  product_description: z.string().min(1),
  category: z.string().optional(),
  weight_grams: z.number().positive().optional(),
  actor_id: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    await requireSupabaseUser(request);
    const payload = schema.parse(await request.json());
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ message: "Supabase is not configured" }, { status: 500 });
    }

    const estimate = await estimateProductDimensions({
      product_title: payload.product_title,
      product_description: payload.product_description,
      category: payload.category,
      weight_grams: payload.weight_grams
    });

    if (payload.product_id) {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          length_cm: estimate.estimated_length_cm,
          width_cm: estimate.estimated_width_cm,
          height_cm: estimate.estimated_height_cm,
          packaging_status: "estimated",
          updated_at: new Date().toISOString()
        })
        .eq("id", payload.product_id);

      if (updateError) {
        return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
      }
    }

    await logComplianceAction({
      actor_id: payload.actor_id,
      action: "ai_estimation",
      source: "ai"
    });

    return NextResponse.json({
      ...estimate,
      persisted: Boolean(payload.product_id)
    });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Estimation failed" },
      { status: 500 }
    );
  }
}
