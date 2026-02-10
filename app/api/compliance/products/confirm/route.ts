import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "../../../../../lib/supabase";
import { logComplianceAction } from "../../../../../src/compliance/auditLog";
import {
  requireSupabaseUser,
  SupabaseAuthError
} from "../../../../../src/auth/requireSupabaseUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  product_id: z.string().min(1),
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

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("id, length_cm, width_cm, height_cm")
      .eq("id", payload.product_id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
    }

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const length = Number(product.length_cm);
    const width = Number(product.width_cm);
    const height = Number(product.height_cm);

    if (
      !Number.isFinite(length) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      length <= 0 ||
      width <= 0 ||
      height <= 0
    ) {
      return NextResponse.json({ message: "Product dimensions missing" }, { status: 400 });
    }

    const confirmedAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("products")
      .update({
        packaging_status: "confirmed",
        confirmed_at: confirmedAt,
        confirmed_by: payload.actor_id
      })
      .eq("id", payload.product_id);

    if (updateError) {
      return NextResponse.json({ message: "Failed to confirm packaging" }, { status: 500 });
    }

    await logComplianceAction({
      actor_id: payload.actor_id,
      action: "packaging_confirmation",
      source: "manual"
    });

    return NextResponse.json({
      product_id: payload.product_id,
      packaging_status: "confirmed",
      confirmed_at: confirmedAt,
      confirmed_by: payload.actor_id
    });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Confirmation failed" },
      { status: 500 }
    );
  }
}
