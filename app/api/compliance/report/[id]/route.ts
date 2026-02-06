import crypto from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../../../lib/supabase";
import {
  ComplianceError,
  getProductById,
  getReportById
} from "../../../../../src/compliance/reportService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const includeProduct = url.searchParams.get("include") === "product";
    const verify = url.searchParams.get("verify") === "1";
    const hash = url.searchParams.get("hash");

    if (verify) {
      const secret = process.env.COMPLIANCE_QR_SECRET;
      if (!hash || !secret) {
        return NextResponse.json(
          { error: "Missing verification signature" },
          { status: 403 }
        );
      }
      const expected = crypto
        .createHash("sha256")
        .update(`${params.id}${secret}`)
        .digest("hex");
      if (expected !== hash) {
        return NextResponse.json(
          { error: "Invalid verification signature" },
          { status: 403 }
        );
      }
    }

    const report = await getReportById(params.id);
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const signed = url.searchParams.get("signed") === "1";
    let assets: { pdf_signed_url: string | null; qr_png_signed_url: string | null } | null =
      null;
    if (signed) {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        const bucket = process.env.COMPLIANCE_STORAGE_BUCKET ?? "compliance-assets";
        const pdfPath = `reports/${report.id}.pdf`;
        const pngPath = `qr/${report.id}.png`;
        const pdfSigned = await supabase.storage
          .from(bucket)
          .createSignedUrl(pdfPath, 3600);
        const pngSigned = await supabase.storage
          .from(bucket)
          .createSignedUrl(pngPath, 3600);
        assets = {
          pdf_signed_url: pdfSigned.data?.signedUrl ?? null,
          qr_png_signed_url: pngSigned.data?.signedUrl ?? null
        };
      }
    }

    if (includeProduct) {
      const product = await getProductById(report.product_id);
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({
        report,
        product: { id: product.id, title: product.title },
        assets
      });
    }

    return NextResponse.json({ report, assets });
  } catch (error) {
    if (error instanceof ComplianceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
