import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "../../../../../lib/supabase";
import { buildDppSummary } from "../../../../../src/compliance/dppEngine";
import { generateCompliancePdf } from "../../../../../src/compliance/pdfGenerator";
import { generateQrPng } from "../../../../../src/compliance/qrService";
import { getPackagingBoxById, getProductById, getReportById } from "../../../../../src/compliance/reportService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  report_id: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 500 }
      );
    }

    const report = await getReportById(payload.report_id);
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    if (report.status !== "draft") {
      return NextResponse.json(
        { error: "Draft PDF is only available for draft reports" },
        { status: 400 }
      );
    }

    const product = await getProductById(report.product_id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const bucket = process.env.COMPLIANCE_STORAGE_BUCKET ?? "compliance-assets";
    const qrPng = await generateQrPng(`draft:${report.id}`);

    const hasCompliance =
      report.empty_space_percent !== null && report.ppwr_compliant !== null;
    const emptySpace = report.empty_space_percent ?? 0;
    const compliant = report.ppwr_compliant ?? false;

    const box = report.recommended_box_id
      ? await getPackagingBoxById(report.recommended_box_id)
      : {
          name: "Pending",
          length_cm: 0,
          width_cm: 0,
          height_cm: 0
        };

    const dppSummary = buildDppSummary(product);
    const explanation = hasCompliance
      ? compliant
        ? `Empty space is ${emptySpace.toFixed(2)}%, below the 40% threshold.`
        : `Empty space is ${emptySpace.toFixed(2)}%, above the 40% threshold.`
      : "Compliance pending; dimensions missing.";

    if (!box) {
      return NextResponse.json(
        { error: "Packaging box not available for draft PDF" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const pdfBuffer = await generateCompliancePdf({
      product,
      box,
      emptySpacePercent: emptySpace,
      compliant,
      explanation,
      dppSummary,
      qrPng,
      timestamp,
      watermarkText: "DRAFT"
    });

    const pdfPath = `reports/${report.id}-draft.pdf`;
    const { error: pdfError } = await supabase.storage
      .from(bucket)
      .upload(pdfPath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true
      });
    if (pdfError) {
      return NextResponse.json(
        { error: "Failed to upload draft PDF" },
        { status: 500 }
      );
    }

    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(pdfPath);

    return NextResponse.json({ pdf_url: publicUrl.publicUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Draft PDF failed" },
      { status: 500 }
    );
  }
}
