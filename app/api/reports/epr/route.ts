import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSupabaseServerClient } from "../../../../lib/supabase";
import {
  mapMaterialCategory,
  resolveEprCountryConfig
} from "../../../../src/compliance/eprReportingService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeCsv(value: unknown) {
  const raw = String(value ?? "");
  if (raw.includes(",") || raw.includes("\"") || raw.includes("\n")) {
    return `"${raw.replace(/\"/g, "\"\"")}"`;
  }
  return raw;
}

function formatDate(date: Date) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function parseCountryFromLanguage(acceptLanguage: string | null) {
  if (!acceptLanguage) return null;
  const token = acceptLanguage.split(",")[0]?.trim().toLowerCase();
  if (token?.startsWith("hu")) return "HU";
  if (token?.startsWith("de")) return "DE";
  if (token?.startsWith("fr")) return "FR";
  if (token?.startsWith("at")) return "AT";
  return null;
}

export async function GET(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const profileId = url.searchParams.get("profile_id");
  const userId = url.searchParams.get("user_id");

  let countryCode: string | null = null;

  if (profileId) {
    const { data } = await supabase
      .from("profiles")
      .select("country_code, location")
      .eq("id", profileId)
      .maybeSingle();
    countryCode = data?.country_code ?? null;
  } else if (userId) {
    const { data } = await supabase
      .from("profiles")
      .select("country_code, location")
      .eq("user_id", userId)
      .eq("is_default", true)
      .maybeSingle();
    countryCode = data?.country_code ?? null;
  }

  if (!countryCode) {
    const headerList = headers();
    countryCode = parseCountryFromLanguage(headerList.get("accept-language"));
  }

  const config = resolveEprCountryConfig(countryCode ?? undefined);

  const baseQuery = supabase.from("dpp").select("*");
  const { data: dppRows, error } = countryCode
    ? await baseQuery.or(
        `destination_country.eq.${countryCode},destination_country.is.null`
      )
    : await baseQuery;

  if (error) {
    return NextResponse.json(
      { error: "Failed to load DPP records" },
      { status: 500 }
    );
  }

  const productIds = (dppRows ?? [])
    .map((row) => row.product_id)
    .filter((id): id is string => Boolean(id));

  let productsMap = new Map<
    string,
    { title: string; external_id: string; packaging_material_type?: string | null }
  >();
  if (productIds.length) {
    const { data: products } = await supabase
      .from("products")
      .select("id, title, external_id, packaging_material_type")
      .in("id", productIds);
    (products ?? []).forEach((product) => {
      productsMap.set(product.id, {
        title: product.title,
        external_id: product.external_id ?? "",
        packaging_material_type: product.packaging_material_type ?? null
      });
    });
  }

  const rows = (dppRows ?? []).map((row) => {
    const product = row.product_id ? productsMap.get(row.product_id) : null;
    const materialCategory = mapMaterialCategory(
      product?.packaging_material_type ?? "",
      config.countryCode
    );
    return {
      product_id: row.product_id ?? "",
      sku: product?.external_id ?? "",
      product_name: product?.title ?? "",
      destination_country: row.destination_country ?? config.countryCode,
      material_category: materialCategory,
      carbon_total_co2: row.carbon_total_co2 ?? 0,
      carbon_material_co2: row.carbon_material_co2 ?? 0,
      carbon_transport_co2: row.carbon_transport_co2 ?? 0,
      calculation_method: row.carbon_calculation_method ?? "",
      calculation_date: row.carbon_calculation_date ?? ""
    };
  });

  const header = config.columnOrder;
  const csvLines = [
    header.join(","),
    ...rows.map((row) =>
      header.map((key) => escapeCsv((row as Record<string, unknown>)[key])).join(",")
    )
  ];

  const filename = `EPR_Sustainability_Report_${config.countryCode}_${formatDate(
    new Date()
  )}.csv`;

  return new NextResponse(csvLines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"${filename}\"`
    }
  });
}
