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

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, title, sku, description, length_cm, width_cm, height_cm, weight_g, weight_kg, packaging_status, created_at, updated_at"
      )
      .or(ownershipFilter)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ message: "Failed to load products" }, { status: 500 });
    }

    return NextResponse.json({ products: data ?? [] });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
    }
    return NextResponse.json({ message: "Failed to load products" }, { status: 500 });
  }
}
