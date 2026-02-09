import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "../../../../../../lib/supabase";
import { logComplianceAction } from "../../../../../../src/compliance/auditLog";
import {
  requireSupabaseUser,
  SupabaseAuthError
} from "../../../../../../src/auth/requireSupabaseUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z
  .object({
    actor_id: z.string().min(1).optional()
  })
  .optional();

type RouteParams = {
  params: {
    product_id?: string;
  };
};

export async function POST(request: Request, context: RouteParams) {
  try {
    await requireSupabaseUser(request);
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const productId = context.params.product_id;
  if (!productId) {
    return NextResponse.json({ message: "Product id is required" }, { status: 400 });
  }

  let payload: z.infer<typeof schema> = undefined;
  try {
    const body = await request.json();
    payload = schema.parse(body);
  } catch {
    payload = undefined;
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase is not configured" }, { status: 500 });
  }

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select(
      "id, length_cm, width_cm, height_cm, packaging_status, confirmed_at, confirmed_source"
    )
    .eq("id", productId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
  }

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  if (product.packaging_status === "confirmed") {
    return NextResponse.json({
      product_id: productId,
      packaging_status: "confirmed",
      confirmed_at: product.confirmed_at ?? null,
      confirmed_source: product.confirmed_source ?? "manual",
      message: "Packaging already confirmed"
    });
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
    return NextResponse.json(
      { message: "Packaging dimensions are required for confirmation" },
      { status: 400 }
    );
  }

  const confirmedAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("products")
    .update({
      packaging_status: "confirmed",
      confirmed_at: confirmedAt,
      confirmed_source: "manual"
    })
    .eq("id", productId);

  if (updateError) {
    return NextResponse.json({ message: "Failed to confirm packaging" }, { status: 500 });
  }

  await logComplianceAction({
    actor_id: payload?.actor_id ?? "system",
    product_id: productId,
    action: "confirm_packaging",
    source: "manual"
  });

  return NextResponse.json({
    product_id: productId,
    packaging_status: "confirmed",
    confirmed_at: confirmedAt,
    confirmed_source: "manual"
  });
}
