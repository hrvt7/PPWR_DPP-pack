import { nanoid } from "nanoid";
import { parse } from "csv-parse/sync";
import { getSupabaseServerClient } from "../../lib/supabase";
import type { ComplianceReport, PackagingBox, Product } from "./types";
import { calculatePPWRCompliance } from "./ppwrEngine";
import { buildDppSummary } from "./dppEngine";
import { buildQrPayload, generateQrPng, generateQrSvg } from "./qrService";
import { generateCompliancePdf } from "./pdfGenerator";

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
  return {
    id: row.id,
    external_id: row.external_id ?? undefined,
    source: row.source,
    title: row.title,
    description: row.description ?? undefined,
    length_cm: Number(row.length_cm),
    width_cm: Number(row.width_cm),
    height_cm: Number(row.height_cm),
    packaging_status: row.packaging_status ?? undefined,
    confirmed_at: row.confirmed_at ? new Date(row.confirmed_at) : undefined,
    confirmed_by: row.confirmed_by ?? undefined,
    created_at: new Date(row.created_at)
  };
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

function mapReport(row: any): ComplianceReport {
  return {
    id: row.id,
    product_id: row.product_id,
    ppwr_compliant:
      row.ppwr_compliant === null || row.ppwr_compliant === undefined
        ? null
        : row.ppwr_compliant,
    empty_space_percent:
      row.empty_space_percent === null || row.empty_space_percent === undefined
        ? null
        : Number(row.empty_space_percent),
    recommended_box_id: row.recommended_box_id ?? null,
    status: row.status,
    pdf_url: row.pdf_url ?? undefined,
    qr_payload: row.qr_payload ?? undefined,
    created_at: new Date(row.created_at),
    finalized_at: row.finalized_at ? new Date(row.finalized_at) : undefined
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

export async function listPackagingBoxes() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("packaging_boxes").select("*");
  if (error) {
    throw new ComplianceError("Failed to fetch packaging boxes", 500);
  }
  return (data ?? []).map(mapBox);
}

export async function getPackagingBoxById(boxId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("packaging_boxes")
    .select("*")
    .eq("id", boxId)
    .maybeSingle();
  if (error) {
    throw new ComplianceError("Failed to fetch packaging box", 500);
  }
  return data ? mapBox(data) : null;
}

export async function createProductManual(payload: {
  title: string;
  description?: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  source?: "manual" | "csv" | "shopify";
  external_id?: string;
}) {
  const supabase = getSupabaseClient();
  const product: Product = {
    id: nanoid(),
    external_id: payload.external_id,
    source: payload.source ?? "manual",
    title: payload.title,
    description: payload.description,
    length_cm: payload.length_cm,
    width_cm: payload.width_cm,
    height_cm: payload.height_cm,
    created_at: new Date()
  };

  const { error } = await supabase.from("products").insert({
    id: product.id,
    external_id: product.external_id ?? null,
    source: product.source,
    title: product.title,
    description: product.description ?? null,
    length_cm: product.length_cm,
    width_cm: product.width_cm,
    height_cm: product.height_cm,
    created_at: product.created_at.toISOString()
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
  const products: Array<{
    id: string;
    external_id: string;
    source: "csv" | "shopify";
    title: string;
    description?: string;
    length_cm: number | null;
    width_cm: number | null;
    height_cm: number | null;
    packaging_status: "missing" | "confirmed";
    created_at: Date;
  }> = [];

  const addWarning = (sku: string, reason: string) => {
    warnings.push({ sku, reason });
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
        source: "shopify" as const,
        title,
        description:
          row["Body (HTML)"] || row["Body"] || row["Description"] || undefined,
        length_cm: null,
        width_cm: null,
        height_cm: null,
        packaging_status: "missing" as const,
        created_at: new Date()
      }
    };
  };

  const pickTitle = (row: Record<string, string>) =>
    (row.name || row.title || row.product_name || row.product_title || "").trim();
  const pickSku = (row: Record<string, string>) =>
    (
      row.sku ||
      row.SKU ||
      row["Variant SKU"] ||
      row.external_id ||
      ""
    ).trim();

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

    const length = parseNumber(row.length_cm);
    const width = parseNumber(row.width_cm);
    const height = parseNumber(row.height_cm);
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
      source: "csv" as const,
      title,
      description: row.description || undefined,
      length_cm: length,
      width_cm: width,
      height_cm: height,
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
      length_cm: product.length_cm,
      width_cm: product.width_cm,
      height_cm: product.height_cm,
      packaging_status: product.packaging_status ?? "missing",
      created_at: product.created_at.toISOString()
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
    .from("compliance_reports")
    .select("*")
    .eq("id", reportId)
    .maybeSingle();
  if (error) {
    throw new ComplianceError("Failed to fetch report", 500);
  }
  return data ? mapReport(data) : null;
}

export async function generateDraftReport(productId: string) {
  const product = await getProductById(productId);
  if (!product) {
    throw new ComplianceError("Product not found", 404);
  }

  const report: ComplianceReport = {
    id: nanoid(),
    product_id: product.id,
    ppwr_compliant: null,
    empty_space_percent: null,
    recommended_box_id: null,
    status: "draft",
    created_at: new Date()
  };

  if (product.packaging_status !== "missing") {
    const boxes = await listPackagingBoxes();
    if (!boxes.length) {
      throw new ComplianceError("No packaging boxes available", 400);
    }
    const result = calculatePPWRCompliance({ product, boxes });
    report.ppwr_compliant = result.compliant;
    report.empty_space_percent = result.empty_space_percent;
    report.recommended_box_id = result.recommended_box.id;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("compliance_reports").insert({
    id: report.id,
    product_id: report.product_id,
    ppwr_compliant: report.ppwr_compliant,
    empty_space_percent: report.empty_space_percent,
    recommended_box_id: report.recommended_box_id,
    status: report.status,
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
  if (report.status === "finalized") {
    throw new ComplianceError("Report already finalized", 409);
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
  if (
    report.empty_space_percent === null ||
    report.ppwr_compliant === null ||
    report.recommended_box_id === null
  ) {
    throw new ComplianceError(
      "Draft report missing compliance data; regenerate draft report.",
      400
    );
  }

  const box = await getPackagingBoxById(report.recommended_box_id);
  if (!box) {
    throw new ComplianceError("Packaging box not found", 500);
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

  const timestamp = new Date().toISOString();
  const dppSummary = buildDppSummary(product);
  const explanation =
    report.empty_space_percent >= 100
      ? "No available box fits the product dimensions. Compliance cannot be achieved."
      : report.ppwr_compliant
        ? `Empty space is ${report.empty_space_percent.toFixed(2)}%, below the 40% threshold.`
        : `Empty space is ${report.empty_space_percent.toFixed(2)}%, above the 40% threshold.`;
  const pdfBuffer = await generateCompliancePdf({
    product,
    box,
    emptySpacePercent: report.empty_space_percent,
    compliant: report.ppwr_compliant,
    explanation,
    dppSummary,
    qrPng,
    timestamp
  });

  const pdfPath = `reports/${report.id}.pdf`;
  const svgPath = `qr/${report.id}.svg`;
  const pngPath = `qr/${report.id}.png`;

  const { error: svgError } = await supabase.storage
    .from(bucket)
    .upload(svgPath, Buffer.from(qrSvg), {
      contentType: "image/svg+xml",
      upsert: true
    });
  if (svgError) {
    throw new ComplianceError("Failed to upload QR SVG", 500);
  }

  const { error: pngError } = await supabase.storage
    .from(bucket)
    .upload(pngPath, qrPng, {
      contentType: "image/png",
      upsert: true
    });
  if (pngError) {
    throw new ComplianceError("Failed to upload QR PNG", 500);
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

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(pdfPath);

  const finalizedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("compliance_reports")
    .update({
      status: "finalized",
      pdf_url: publicUrl.publicUrl,
      qr_payload: qrPayload,
      finalized_at: finalizedAt
    })
    .eq("id", report.id);

  if (updateError) {
    throw new ComplianceError("Failed to finalize report", 500);
  }

  return { pdf_url: publicUrl.publicUrl };
}
