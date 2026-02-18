import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import * as XLSX from "xlsx";
import { getSupabaseServerClient } from "../../../../lib/supabase";
import { mapMaterialCategory } from "../../../../src/compliance/eprReportingService";
import { generateEprQuarterlyPdf } from "../../../../src/compliance/eprQuarterlyPdf";
import {
  requireSupabaseUser,
  SupabaseAuthError
} from "../../../../src/auth/requireSupabaseUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  period_start: z.string().optional(),
  period_end: z.string().optional(),
  country_code: z.string().min(2).max(2).optional()
});

function parseQuarter(period: string) {
  const match = period.match(/^(\d{4})-Q([1-4])$/);
  if (!match) return null;
  const year = Number(match[1]);
  const quarter = Number(match[2]);
  const startMonth = (quarter - 1) * 3;
  const start = new Date(Date.UTC(year, startMonth, 1));
  const end = new Date(Date.UTC(year, startMonth + 3, 0));
  return { start, end, label: period };
}

export async function POST(request: Request) {
  try {
    await requireSupabaseUser(request);
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
    }
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase is not configured" }, { status: 500 });
  }

  const url = new URL(request.url);
  const periodParam = url.searchParams.get("period");
  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  const countryCode = body.success ? body.data.country_code : undefined;

  const period = periodParam ? parseQuarter(periodParam) : null;
  const start =
    period?.start ??
    (body.success && body.data.period_start
      ? new Date(body.data.period_start)
      : null);
  const end =
    period?.end ??
    (body.success && body.data.period_end
      ? new Date(body.data.period_end)
      : null);

  if (!start || !end) {
    return NextResponse.json({ message: "Missing period or start/end dates" }, { status: 400 });
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("packaging_material_type, weight_g, created_at")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  if (error) {
    return NextResponse.json({ message: "Failed to load products" }, { status: 500 });
  }

  const totals = new Map<string, number>();
  for (const product of products ?? []) {
    const material = mapMaterialCategory(
      product.packaging_material_type ?? "other",
      countryCode
    );
    const weightKg =
      product.weight_g && Number.isFinite(Number(product.weight_g))
        ? Number(product.weight_g) / 1000
        : 0;
    totals.set(material, (totals.get(material) ?? 0) + weightKg);
  }

  const totalsArray = Array.from(totals.entries()).map(([material, weight_kg]) => ({
    material,
    weight_kg: Number(weight_kg.toFixed(6))
  }));

  const worksheet = XLSX.utils.json_to_sheet(totalsArray);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "EPR");
  const xlsxBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  const label = period?.label ?? `${start.toISOString()}_${end.toISOString()}`;
  const pdfBuffer = await generateEprQuarterlyPdf({
    periodLabel: label,
    totals: totalsArray
  });

  const bucket = process.env.COMPLIANCE_STORAGE_BUCKET ?? "compliance-assets";
  const xlsxPath = `epr/${label}.xlsx`;
  const pdfPath = `epr/${label}.pdf`;

  const { error: xlsxError } = await supabase.storage
    .from(bucket)
    .upload(xlsxPath, xlsxBuffer, {
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      upsert: true
    });
  if (xlsxError) {
    return NextResponse.json({ message: "Failed to upload XLSX" }, { status: 500 });
  }

  const { error: pdfError } = await supabase.storage
    .from(bucket)
    .upload(pdfPath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true
    });
  if (pdfError) {
    return NextResponse.json({ message: "Failed to upload PDF" }, { status: 500 });
  }

  const { data: xlsxUrl } = supabase.storage.from(bucket).getPublicUrl(xlsxPath);
  const { data: pdfUrl } = supabase.storage.from(bucket).getPublicUrl(pdfPath);

  const { error: insertError } = await supabase.from("epr_quarterly_exports").insert({
    id: crypto.randomUUID(),
    period_start: start.toISOString().slice(0, 10),
    period_end: end.toISOString().slice(0, 10),
    totals_json: totalsArray,
    xlsx_url: xlsxUrl.publicUrl,
    pdf_url: pdfUrl.publicUrl,
    created_at: new Date().toISOString()
  });
  if (insertError) {
    return NextResponse.json({ message: "Failed to persist export" }, { status: 500 });
  }

  return NextResponse.json({
    totals: totalsArray,
    xlsx_url: xlsxUrl.publicUrl,
    pdf_url: pdfUrl.publicUrl,
    period_start: start.toISOString().slice(0, 10),
    period_end: end.toISOString().slice(0, 10),
    period_label: label,
    country_code: countryCode ?? null,
    exported_at: new Date().toISOString()
  });
}
