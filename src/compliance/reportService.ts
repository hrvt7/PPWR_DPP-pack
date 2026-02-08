import { nanoid } from "nanoid";
import { parse } from "csv-parse/sync";
import { getSupabaseServerClient } from "../../lib/supabase";
import type {
  ComplianceReportRecord,
  PackagingBox,
  Product,
  PackagingMaterialType
} from "./types";
import { recommendStandardBox } from "./boxRecommendation";
import {
  buildDppQrPayload,
  buildQrPayload,
  generateQrPng,
  generateQrSvg
} from "./qrService";
import { generatePPWRLegalPdf } from "./ppwrLegalPdf";
import { calculateCarbonFootprint } from "../../lib/carbon-calculator";
import { decideReportEligibility } from "./reportEligibility";
import { decidePPWRCompliance } from "./ppwrDecision";

export class ComplianceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function getSupabaseClient() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new ComplianceError("Supabase is not configured", 500);
  }
  return supabase;
}

function mapProduct(row: any): Product {
  const weightKg =
    row.weight_kg === null || row.weight_kg === undefined
      ? null
      : Number(row.weight_kg);
  const weightG =
    row.weight_g === null || row.weight_g === undefined
      ? null
      : Number(row.weight_g);
  return {
    id: row.id,
    merchant_id: row.merchant_id ?? null,
    external_id: row.external_id ?? undefined,
    sku: row.sku ?? row.external_id ?? undefined,
    source: row.source,
    title: row.title,
    description: row.description ?? undefined,
    product_url: row.product_url ?? null,
    image_url: row.image_url ?? null,
    length_cm: row.length_cm === null ? null : Number(row.length_cm),
    width_cm: row.width_cm === null ? null : Number(row.width_cm),
    height_cm: row.height_cm === null ? null : Number(row.height_cm),
    weight_g: weightG ?? (weightKg !== null ? Math.round(weightKg * 1000) : null),
    weight_kg: weightKg,
    packaging_material_type: row.packaging_material_type ?? null,
    packaging_status: row.packaging_status ?? undefined,
    confirmed_at: row.confirmed_at ? new Date(row.confirmed_at) : undefined,
    confirmed_by: row.confirmed_by ?? undefined,
    updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
    created_at: new Date(row.created_at)
  };
}

function normalizePackagingMaterialType(
  value?: string | null
): PackagingMaterialType | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  const allowed: PackagingMaterialType[] = [
    "cardboard",
    "virgin_plastic",
    "recycled_plastic",
    "paper",
    "pla",
    "glass"
  ];
  const match = allowed.find((item) => item === normalized);
  return match ?? null;
}

function mapBox(row: any): PackagingBox {
  return {
    id: row.id,
    name: row.name,
    length_cm: Number(row.length_cm),
    width_cm: Number(row.width_cm),
    height_cm: Number(row.height_cm)
  };
}

function mapReport(row: any): ComplianceReportRecord {
  return {
    id: row.id,
    product_id: row.product_id,
    kind: row.kind,
    status: row.status,
    ppwr_result_json: row.ppwr_result_json ?? null,
    dpp_json: row.dpp_json ?? null,
    carbon_json: row.carbon_json ?? null,
    qr_ppwr_url: row.qr_ppwr_url ?? null,
    qr_dpp_url: row.qr_dpp_url ?? null,
    pdf_url: row.pdf_url ?? null,
    finalized_at: row.finalized_at ? new Date(row.finalized_at) : undefined,
    created_at: new Date(row.created_at)
  };
}

export async function getProductById(productId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();
  if (error) {
    throw new ComplianceError("Failed to fetch product", 500);
  }
  return data ? mapProduct(data) : null;
}

export async function getProductBySku(sku: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(`sku.eq.${sku},external_id.eq.${sku}`)
    .maybeSingle();
  if (error) {
    throw new ComplianceError("Failed to fetch product by SKU", 500);
  }
  return data ? mapProduct(data) : null;
}

export async function listPackagingBoxes() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("standard_boxes").select("*");
  if (error) {
    throw new ComplianceError("Failed to fetch standard boxes", 500);
  }
  if (data && data.length) {
    return (data ?? []).map(mapBox);
  }
  const legacy = await supabase.from("packaging_boxes").select("*");
  if (legacy.error) {
    throw new ComplianceError("Failed to fetch packaging boxes", 500);
  }
  return (legacy.data ?? []).map(mapBox);
}

export async function getPackagingBoxById(boxId: string) {
  const supabase = getSupabaseClient();
  const standard = await supabase
    .from("standard_boxes")
    .select("*")
    .eq("id", boxId)
    .maybeSingle();
  if (standard.error) {
    throw new ComplianceError("Failed to fetch standard box", 500);
  }
  if (standard.data) return mapBox(standard.data);
  const legacy = await supabase
    .from("packaging_boxes")
    .select("*")
    .eq("id", boxId)
    .maybeSingle();
  if (legacy.error) {
    throw new ComplianceError("Failed to fetch packaging box", 500);
  }
  return legacy.data ? mapBox(legacy.data) : null;
}

export async function createProductManual(payload: {
  merchant_id?: string | null;
  title: string;
  description?: string;
  sku?: string;
  product_url?: string | null;
  image_url?: string | null;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  weight_g?: number | null;
  weight_kg?: number | null;
  packaging_material_type?: string | null;
  source?: "manual" | "csv" | "shopify";
  external_id?: string;
  packaging_status?: "confirmed" | "estimated" | "missing";
}) {
  const supabase = getSupabaseClient();
  const hasDimensions =
    payload.length_cm !== null &&
    payload.length_cm !== undefined &&
    payload.width_cm !== null &&
    payload.width_cm !== undefined &&
    payload.height_cm !== null &&
    payload.height_cm !== undefined;
  const packagingStatus = payload.packaging_status ?? (hasDimensions ? "confirmed" : "missing");
  if (packagingStatus === "confirmed" && !hasDimensions) {
    throw new ComplianceError(
      "Packaging status confirmed requires dimensions",
      400
    );
  }
  const weightG =
    payload.weight_g !== undefined && payload.weight_g !== null
      ? payload.weight_g
      : payload.weight_kg !== undefined && payload.weight_kg !== null
        ? Math.round(payload.weight_kg * 1000)
        : null;
  const product: Product = {
    id: nanoid(),
    merchant_id: payload.merchant_id ?? null,
    external_id: payload.external_id,
    sku: payload.sku ?? payload.external_id,
    source: payload.source ?? "manual",
    title: payload.title,
    description: payload.description,
    product_url: payload.product_url ?? null,
    image_url: payload.image_url ?? null,
    length_cm: payload.length_cm ?? null,
    width_cm: payload.width_cm ?? null,
    height_cm: payload.height_cm ?? null,
    weight_g: weightG,
    weight_kg: payload.weight_kg ?? null,
    packaging_material_type: normalizePackagingMaterialType(
      payload.packaging_material_type
    ),
    packaging_status: packagingStatus,
    created_at: new Date()
  };

  const { error } = await supabase.from("products").insert({
    id: product.id,
    merchant_id: product.merchant_id ?? null,
    external_id: product.external_id ?? null,
    sku: product.sku ?? product.external_id ?? null,
    source: product.source,
    title: product.title,
    description: product.description ?? null,
    product_url: product.product_url ?? null,
    image_url: product.image_url ?? null,
    length_cm: product.length_cm,
    width_cm: product.width_cm,
    height_cm: product.height_cm,
    weight_g: product.weight_g ?? null,
    weight_kg: product.weight_kg ?? null,
    packaging_material_type: product.packaging_material_type ?? null,
    packaging_status: product.packaging_status ?? "missing",
    created_at: product.created_at.toISOString(),
    updated_at: product.created_at.toISOString()
  });

  if (error) {
    throw new ComplianceError("Failed to create product", 500);
  }

  return product;
}

export async function importProductsFromCSV(csv: string) {
  const supabase = getSupabaseClient();
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Record<string, string>[];

  const total_rows = records.length;
  if (!total_rows) {
    return {
      total_rows: 0,
      imported: 0,
      rejected: 0,
      warnings: [] as { sku: string; reason: string }[]
    };
  }

  const headers = Object.keys(records[0] ?? {});
  const isShopify =
    headers.includes("Title") || headers.includes("Variant SKU");

  const warnings: { sku: string; reason: string }[] = [];
  const products: Product[] = [];

  const addWarning = (sku: string, reason: string) => {
    warnings.push({ sku, reason });
  };

  const pick = (row: Record<string, string>, keys: string[]) => {
    for (const key of keys) {
      const value = row[key];
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return String(value).trim();
      }
    }
    return "";
  };

  const parseNumber = (value?: string) => {
    if (!value) return null;
    const parsed = Number(String(value).trim());
    if (Number.isNaN(parsed) || parsed <= 0) return null;
    return parsed;
  };

  const normalizeShopifyProduct = (row: Record<string, string>) => {
    const title = (row["Title"] || row["Handle"] || "").trim();
    const sku = (row["Variant SKU"] || "").trim();
    if (!title) {
      return { ok: false as const, reason: "Missing Title/Handle" };
    }
    if (!sku) {
      return { ok: false as const, reason: "Missing Variant SKU" };
    }

    const weight =
      parseNumber(row["Variant Grams"]) ?? parseNumber(row["Variant Weight"]);
    if (weight === null) {
      addWarning(sku, "Missing weight; import allowed.");
    }

    addWarning(
      sku,
      "Missing packaging dimensions; set packaging_status=missing."
    );

    return {
      ok: true as const,
      product: {
        id: nanoid(),
        external_id: sku,
        sku,
        source: "shopify" as const,
        title,
        description:
          row["Body (HTML)"] || row["Body"] || row["Description"] || undefined,
        length_cm: null,
        width_cm: null,
        height_cm: null,
        weight_g: weight === null ? null : Math.round(weight),
        weight_kg: weight === null ? null : Number((weight / 1000).toFixed(4)),
        packaging_status: "missing" as const,
        created_at: new Date()
      }
    };
  };

  const pickTitle = (row: Record<string, string>) =>
    pick(row, ["name", "Name", "item_name", "Item Name", "product_name"]);
  const pickSku = (row: Record<string, string>) =>
    pick(row, ["sku", "SKU", "Variant SKU", "external_id", "Listing ID"]);

  let rejected = 0;

  for (const row of records) {
    if (isShopify) {
      const normalized = normalizeShopifyProduct(row);
      if (!normalized.ok) {
        rejected += 1;
        continue;
      }
      products.push(normalized.product);
      continue;
    }

    const title = pickTitle(row);
    const sku = pickSku(row);
    if (!title || !sku) {
      rejected += 1;
      continue;
    }

    const length = parseNumber(
      pick(row, ["length_cm", "Length", "Length (cm)"])
    );
    const width = parseNumber(
      pick(row, ["width_cm", "Width", "Width (cm)"])
    );
    const height = parseNumber(
      pick(row, ["height_cm", "Height", "Height (cm)"])
    );
    const weightGFromGram = parseNumber(
      pick(row, ["weight_g", "weight", "Weight", "net_weight_g", "Net Weight (g)"])
    );
    const weightKgFromKg = parseNumber(
      pick(row, ["weight_kg", "Weight (kg)", "net_weight_kg"])
    );
    const weightG =
      weightGFromGram !== null
        ? weightGFromGram
        : weightKgFromKg !== null
          ? Math.round(weightKgFromKg * 1000)
          : null;
    const weightKg =
      weightKgFromKg !== null
        ? Number(weightKgFromKg.toFixed(4))
        : weightG !== null
          ? Number((weightG / 1000).toFixed(4))
          : null;
    const hasDimensions = length !== null && width !== null && height !== null;
    if (!hasDimensions) {
      addWarning(
        sku,
        "Missing packaging dimensions; set packaging_status=missing."
      );
    }

    products.push({
      id: nanoid(),
      external_id: sku,
      sku,
      source: "csv" as const,
      title,
      description: row.description || undefined,
      length_cm: length,
      width_cm: width,
      height_cm: height,
      weight_g: weightG,
      weight_kg: weightKg,
      packaging_status: hasDimensions ? "confirmed" : "missing",
      created_at: new Date()
    });
  }

  if (!products.length) {
    return { total_rows, imported: 0, rejected, warnings };
  }

  const { error } = await supabase.from("products").insert(
    products.map((product) => ({
      id: product.id,
      external_id: product.external_id ?? null,
      source: product.source,
      title: product.title,
      description: product.description ?? null,
      product_url: product.product_url ?? null,
      image_url: product.image_url ?? null,
      length_cm: product.length_cm,
      width_cm: product.width_cm,
      height_cm: product.height_cm,
      weight_g: product.weight_g ?? null,
      weight_kg: product.weight_kg ?? null,
      packaging_material_type: product.packaging_material_type ?? null,
      packaging_status: product.packaging_status ?? "missing",
      created_at: product.created_at.toISOString(),
      updated_at: product.created_at.toISOString()
    }))
  );

  if (error) {
    throw new ComplianceError("Failed to import products", 500);
  }

  return { total_rows, imported: products.length, rejected, warnings };
}

export async function getReportById(reportId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .maybeSingle();
  if (error) {
    throw new ComplianceError("Failed to fetch report", 500);
  }
  return data ? mapReport(data) : null;
}

export async function generateDraftReport(params: {
  productId: string;
  buffer_percent?: number;
  distance_km?: number | null;
  destination_country?: string | null;
}) {
  const product = await getProductById(params.productId);
  if (!product) {
    throw new ComplianceError("Product not found", 404);
  }

  const report: ComplianceReportRecord = {
    id: nanoid(),
    product_id: product.id,
    kind: "combined",
    status: "draft",
    ppwr_result_json: null,
    dpp_json: null,
    carbon_json: null,
    created_at: new Date()
  };

  const bufferPercent = Number.isFinite(params.buffer_percent)
    ? Number(params.buffer_percent)
    : Number(process.env.PPWR_BUFFER_PERCENT ?? 0.12);
  const ppwrResult = await buildPpwrResult({
    product,
    buffer_percent: Number.isFinite(bufferPercent) ? bufferPercent : 0.12
  });
  const dppJson = buildDppJson(product, params.destination_country ?? null);
  const carbonJson = buildCarbonJson(product, params.distance_km ?? null);

  report.ppwr_result_json = ppwrResult;
  report.dpp_json = dppJson;
  report.carbon_json = carbonJson;

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("reports").insert({
    id: report.id,
    product_id: report.product_id,
    kind: report.kind,
    status: report.status,
    ppwr_result_json: report.ppwr_result_json,
    dpp_json: report.dpp_json,
    carbon_json: report.carbon_json,
    created_at: report.created_at.toISOString()
  });

  if (error) {
    throw new ComplianceError("Failed to create report", 500);
  }

  return report;
}

export async function finalizeReport(reportId: string) {
  const supabase = getSupabaseClient();
  const report = await getReportById(reportId);
  if (!report) {
    throw new ComplianceError("Report not found", 404);
  }
  if (report.status === "final") {
    return {
      pdf_url: report.pdf_url ?? "",
      qr_ppwr_url: report.qr_ppwr_url ?? "",
      qr_dpp_url: report.qr_dpp_url ?? ""
    };
  }

  const product = await getProductById(report.product_id);
  if (!product) {
    throw new ComplianceError("Product not found", 404);
  }
  if (product.packaging_status !== "confirmed") {
    throw new ComplianceError(
      "Packaging dimensions must be confirmed before finalization.",
      400
    );
  }
  const bufferPercent = Number(process.env.PPWR_BUFFER_PERCENT ?? 0.12);
  const ppwrResult = await buildPpwrResult({
    product,
    buffer_percent: Number.isFinite(bufferPercent) ? bufferPercent : 0.12
  });
  if (!ppwrResult.recommended_box) {
    throw new ComplianceError(
      "No recommended box available for finalization.",
      400
    );
  }

  const domain = process.env.APP_DOMAIN;
  const secret = process.env.COMPLIANCE_QR_SECRET;
  if (!domain || !secret) {
    throw new ComplianceError("Missing APP_DOMAIN or COMPLIANCE_QR_SECRET", 500);
  }

  const bucket = process.env.COMPLIANCE_STORAGE_BUCKET ?? "compliance-assets";
  const qrPayload = buildQrPayload(report.id, domain, secret);
  const qrSvg = await generateQrSvg(qrPayload);
  const qrPng = await generateQrPng(qrPayload);

  const destinationCountry =
    (report.dpp_json as { destination_country?: string | null } | null)
      ?.destination_country ?? null;
  const dppRecord = await createDppRecord({
    product,
    reportId: report.id,
    destinationCountry,
    distanceKm: null
  });
  const dppPayload = buildDppQrPayload(dppRecord.id, domain, secret);
  const dppSvg = await generateQrSvg(dppPayload);
  const dppPng = await generateQrPng(dppPayload);

  const verificationUrl = qrPayload;
  const dppJson = {
    ...buildDppJson(product, destinationCountry),
    dpp_id: dppRecord.id
  };
  const carbonJson = buildCarbonJson(product, null);
  const decision = decidePPWRCompliance({
    packaging_status: product.packaging_status ?? "missing",
    void_space_percentage: ppwrResult.void_space_percentage ?? 0
  });
  const eligibility = decideReportEligibility({
    compliance_status: decision.compliance_status,
    void_space_percentage: decision.void_space_percentage,
    reasons: decision.reasons
  });
  const pdfBuffer = await generatePPWRLegalPdf({
    product,
    boxRecommendation: {
      status: "final",
      message: ppwrResult.reasons.join(" "),
      buffer_percent: ppwrResult.buffer_percent,
      void_space_percentage: ppwrResult.void_space_percentage ?? undefined,
      recommended_box: ppwrResult.recommended_box
    },
    decision: {
      compliance_status: decision.compliance_status,
      void_space_percentage: decision.void_space_percentage,
      reasons: decision.reasons
    },
    eligibility,
    verificationUrl,
    dppUrl: dppPayload,
    carbonSummary: carbonJson
  });

  const pdfPath = `reports/${report.id}.pdf`;
  const ppwrSvgPath = `qr/ppwr/${report.id}.svg`;
  const ppwrPngPath = `qr/ppwr/${report.id}.png`;
  const dppSvgPath = `qr/dpp/${dppRecord.id}.svg`;
  const dppPngPath = `qr/dpp/${dppRecord.id}.png`;

  const { error: svgError } = await supabase.storage
    .from(bucket)
    .upload(ppwrSvgPath, Buffer.from(qrSvg), {
      contentType: "image/svg+xml",
      upsert: true
    });
  if (svgError) {
    throw new ComplianceError("Failed to upload QR SVG", 500);
  }

  const { error: pngError } = await supabase.storage
    .from(bucket)
    .upload(ppwrPngPath, qrPng, {
      contentType: "image/png",
      upsert: true
    });
  if (pngError) {
    throw new ComplianceError("Failed to upload QR PNG", 500);
  }

  const { error: dppSvgError } = await supabase.storage
    .from(bucket)
    .upload(dppSvgPath, Buffer.from(dppSvg), {
      contentType: "image/svg+xml",
      upsert: true
    });
  if (dppSvgError) {
    throw new ComplianceError("Failed to upload DPP QR SVG", 500);
  }

  const { error: dppPngError } = await supabase.storage
    .from(bucket)
    .upload(dppPngPath, dppPng, {
      contentType: "image/png",
      upsert: true
    });
  if (dppPngError) {
    throw new ComplianceError("Failed to upload DPP QR PNG", 500);
  }

  const { error: pdfError } = await supabase.storage
    .from(bucket)
    .upload(pdfPath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true
    });
  if (pdfError) {
    throw new ComplianceError("Failed to upload PDF", 500);
  }

  const { data: publicPdfUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(pdfPath);
  const { data: publicPpwrQrUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(ppwrPngPath);
  const { data: publicDppQrUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(dppPngPath);

  const finalizedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("reports")
    .update({
      status: "final",
      pdf_url: publicPdfUrl.publicUrl,
      qr_ppwr_url: publicPpwrQrUrl.publicUrl,
      qr_dpp_url: publicDppQrUrl.publicUrl,
      ppwr_result_json: ppwrResult,
      dpp_json: dppJson,
      carbon_json: carbonJson,
      finalized_at: finalizedAt
    })
    .eq("id", report.id);

  if (updateError) {
    throw new ComplianceError("Failed to finalize report", 500);
  }

  return {
    pdf_url: publicPdfUrl.publicUrl,
    qr_ppwr_url: publicPpwrQrUrl.publicUrl,
    qr_dpp_url: publicDppQrUrl.publicUrl,
    dpp_id: dppRecord.id
  };
}

function buildDppJson(product: Product, destinationCountry: string | null) {
  return {
    product_id: product.id,
    sku: product.sku ?? product.external_id ?? null,
    title: product.title,
    description: product.description ?? null,
    dimensions_cm: {
      length: product.length_cm,
      width: product.width_cm,
      height: product.height_cm
    },
    destination_country: destinationCountry
  };
}

function buildCarbonJson(product: Product, distanceKm: number | null) {
  if (!product.weight_g && !product.weight_kg) {
    return null;
  }
  const weightG =
    product.weight_g ??
    (product.weight_kg != null ? Math.round(product.weight_kg * 1000) : 0);
  const material = product.packaging_material_type ?? "cardboard";
  return calculateCarbonFootprint(weightG, material, distanceKm ?? undefined);
}

async function buildPpwrResult(params: {
  product: Product;
  buffer_percent: number;
}) {
  const { product, buffer_percent } = params;
  if (product.packaging_status === "missing") {
    return {
      compliance_status: "unknown",
      reasons: [
        "Packaging dimensions missing",
        "Add product dimensions and confirm packaging"
      ],
      buffer_percent,
      recommended_box: null,
      void_space_percentage: null,
      product_volume_cm3: null,
      chosen_box_volume_cm3: null
    };
  }

  const boxes = await listPackagingBoxes();
  if (!boxes.length) {
    return {
      compliance_status: "unknown",
      reasons: ["No standard boxes available"],
      buffer_percent,
      recommended_box: null,
      void_space_percentage: null,
      product_volume_cm3: null,
      chosen_box_volume_cm3: null
    };
  }

  const recommendation = recommendStandardBox({
    product,
    boxes,
    packaging_status: product.packaging_status ?? "missing",
    buffer_percent
  });

  if (recommendation.status === "error" || !recommendation.recommended_box) {
    return {
      compliance_status: "unknown",
      reasons: [recommendation.message],
      buffer_percent,
      recommended_box: null,
      void_space_percentage: null,
      product_volume_cm3: recommendation.product_volume_cm3 ?? null,
      chosen_box_volume_cm3: null
    };
  }

  const productVolume = recommendation.product_volume_cm3 ?? null;
  const boxVolume =
    recommendation.recommended_box.length_cm *
    recommendation.recommended_box.width_cm *
    recommendation.recommended_box.height_cm;
  const voidSpace =
    recommendation.void_space_percentage ?? null;

  const decision = decidePPWRCompliance({
    packaging_status: product.packaging_status ?? "missing",
    void_space_percentage: voidSpace ?? 0
  });

  return {
    compliance_status: decision.compliance_status,
    reasons: decision.reasons,
    buffer_percent,
    recommended_box: recommendation.recommended_box,
    void_space_percentage: voidSpace,
    product_volume_cm3: productVolume,
    chosen_box_volume_cm3: Number(boxVolume.toFixed(2))
  };
}

async function createDppRecord(params: {
  product: Product;
  reportId: string;
  destinationCountry: string | null;
  distanceKm: number | null;
}) {
  const supabase = getSupabaseClient();
  const weightG =
    params.product.weight_g ??
    (params.product.weight_kg != null
      ? Math.round(params.product.weight_kg * 1000)
      : 0);
  const materialType = params.product.packaging_material_type ?? "cardboard";
  const carbon = calculateCarbonFootprint(weightG, materialType, params.distanceKm ?? undefined);
  const id = nanoid();

  const { error } = await supabase.from("dpp").insert({
    id,
    product_id: params.product.id,
    report_id: params.reportId,
    destination_country: params.destinationCountry,
    carbon_material_co2: carbon.material_kg_co2e,
    carbon_transport_co2: carbon.transport_kg_co2e,
    carbon_total_co2: carbon.total_kg_co2e,
    carbon_calculation_date: new Date().toISOString(),
    carbon_calculation_method: carbon.methodology_id,
    created_at: new Date().toISOString()
  });

  if (error) {
    throw new ComplianceError("Failed to create DPP record", 500);
  }

  return { id, carbon };
}
