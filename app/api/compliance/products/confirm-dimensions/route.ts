import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "../../../../../lib/supabase";
import {
  requireSupabaseUser,
  SupabaseAuthError
} from "../../../../../src/auth/requireSupabaseUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  product_id: z.string().min(1),
  length_cm: z.number().positive(),
  width_cm: z.number().positive(),
  height_cm: z.number().positive(),
  confirmed_by: z.string().min(1).optional()
});

async function resolveMerchantIdsForUser(userId: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { data: shops, error } = await supabase
    .from("shops")
    .select("id")
    .eq("merchant_id", userId);

  if (error) {
    throw new Error("Failed to load shops");
  }

  return [userId, ...(shops ?? []).map((shop) => shop.id)].filter(Boolean);
}

function buildOwnershipFilter(merchantIds: string[]) {
  if (merchantIds.length === 1) {
    return `merchant_id.eq.${merchantIds[0]}`;
  }
  return `merchant_id.in.(${merchantIds.join(",")})`;
}

export async function POST(request: Request) {
  try {
    const user = await requireSupabaseUser(request);
    const payload = schema.parse(await request.json());

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ message: "Supabase is not configured" }, { status: 500 });
    }

    const merchantIds = await resolveMerchantIdsForUser(user.id);
    const ownershipFilter = buildOwnershipFilter(merchantIds);

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("id, merchant_id")
      .eq("id", payload.product_id)
      .or(ownershipFilter)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
    }

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const confirmedAt = new Date().toISOString();

    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({
        length_cm: payload.length_cm,
        width_cm: payload.width_cm,
        height_cm: payload.height_cm,
        packaging_status: "confirmed",
        confirmed_at: confirmedAt,
        confirmed_by: payload.confirmed_by ?? user.id,
        updated_at: confirmedAt
      })
      .eq("id", payload.product_id)
      .select(
        "id, title, sku, description, length_cm, width_cm, height_cm, weight_g, weight_kg, packaging_status, confirmed_at, confirmed_by, created_at, updated_at"
      )
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ message: "Failed to confirm dimensions" }, { status: 500 });
    }

    if (!updatedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct
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
