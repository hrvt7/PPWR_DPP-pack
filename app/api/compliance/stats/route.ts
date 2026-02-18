import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../../lib/supabase";
import {
  requireSupabaseUser,
  SupabaseAuthError
} from "../../../../src/auth/requireSupabaseUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET(request: Request) {
  try {
    const user = await requireSupabaseUser(request);
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ message: "Supabase is not configured" }, { status: 500 });
    }

    const merchantIds = await resolveMerchantIdsForUser(user.id);
    const ownershipFilter = buildOwnershipFilter(merchantIds);

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, packaging_status")
      .or(ownershipFilter);

    if (productsError) {
      return NextResponse.json({ message: "Failed to load stats" }, { status: 500 });
    }

    const productIds = (products ?? []).map((product) => product.id);
    const totalProducts = productIds.length;
    const confirmedPackagingProducts = (products ?? []).filter(
      (product) => product.packaging_status === "confirmed"
    ).length;

    let reportsGenerated = 0;
    if (productIds.length > 0) {
      const { count, error: reportsError } = await supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .in("product_id", productIds);

      if (!reportsError) {
        reportsGenerated = count ?? 0;
      }
    }

    return NextResponse.json({
      total_products: totalProducts,
      confirmed_packaging_products: confirmedPackagingProducts,
      reports_generated: reportsGenerated
    });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
    }
    return NextResponse.json({ message: "Failed to load stats" }, { status: 500 });
  }
}
