import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getSupabaseServerClient } from "../../../../lib/supabase";
import { calculateCarbonFootprint } from "../../../../lib/carbon-calculator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ShopifyLineItem = {
  grams?: number;
  quantity?: number;
  material?: string;
};

type ShopifyOrderPayload = {
  id?: number | string;
  total_weight?: number;
  line_items?: ShopifyLineItem[];
  shipping_address?: {
    country_code?: string;
  };
};

function sumLineItemGrams(items: ShopifyLineItem[] = []) {
  return items.reduce((total, item) => {
    const grams = Number(item.grams ?? 0);
    const quantity = Number(item.quantity ?? 1);
    if (!Number.isFinite(grams) || !Number.isFinite(quantity)) {
      return total;
    }
    return total + grams * quantity;
  }, 0);
}

function resolveMaterial(items: ShopifyLineItem[] = []) {
  for (const item of items) {
    if (item.material && item.material.trim()) {
      return item.material.trim();
    }
  }
  return "corrugated_cardboard";
}

export async function POST(request: Request) {
  try {
    // TODO: Add HMAC verification for Shopify webhook requests.
    const payload = (await request.json()) as ShopifyOrderPayload;
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const lineItems = payload.line_items ?? [];
    const totalWeight = Number(payload.total_weight ?? 0);
    const weightInGrams = totalWeight > 0 ? totalWeight : sumLineItemGrams(lineItems);
    const materialType = resolveMaterial(lineItems);
    const carbon = calculateCarbonFootprint(weightInGrams, materialType);
    const destinationCountry =
      payload.shipping_address?.country_code?.toUpperCase() ?? null;

    const { error } = await supabase.from("dpp").insert({
      id: nanoid(),
      product_id: null,
      report_id: null,
      destination_country: destinationCountry,
      carbon_material_co2: carbon.carbonMaterialCo2,
      carbon_transport_co2: carbon.carbonTransportCo2,
      carbon_total_co2: carbon.carbonTotalCo2,
      carbon_calculation_date: carbon.carbonCalculationDate.toISOString(),
      carbon_calculation_method: carbon.carbonCalculationMethod,
      created_at: new Date().toISOString()
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to store DPP record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
