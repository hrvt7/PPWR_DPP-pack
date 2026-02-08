import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "../../../../../lib/supabase";
import { generatePPWRLegalPdf } from "../../../../../src/compliance/ppwrLegalPdf";
import { decideReportEligibility } from "../../../../../src/compliance/reportEligibility";
import { getProductById, getReportById } from "../../../../../src/compliance/reportService";
import {
  requireSupabaseUser,
  SupabaseAuthError
} from "../../../../../src/auth/requireSupabaseUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  report_id: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    await requireSupabaseUser(request);
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

    const ppwrResult = report.ppwr_result_json as
      | {
          compliance_status?: "pass" | "fail" | "unknown";
          void_space_percentage?: number | null;
          reasons?: string[];
          recommended_box?: {
            id?: string;
            name: string;
            length_cm: number;
            width_cm: number;
            height_cm: number;
          } | null;
          buffer_percent?: number;
        }
      | null;

    const decision = {
      compliance_status: ppwrResult?.compliance_status ?? "unknown",
      void_space_percentage: ppwrResult?.void_space_percentage ?? 0,
      reasons: ppwrResult?.reasons ?? ["Compliance pending; dimensions missing."]
    };
    const eligibility = decideReportEligibility(decision);

    const box = ppwrResult?.recommended_box
      ? {
          id: ppwrResult.recommended_box.id ?? "pending",
          name: ppwrResult.recommended_box.name,
          length_cm: ppwrResult.recommended_box.length_cm,
          width_cm: ppwrResult.recommended_box.width_cm,
          height_cm: ppwrResult.recommended_box.height_cm
        }
      : {
          id: "pending",
          name: "Pending",
          length_cm: 0,
          width_cm: 0,
          height_cm: 0
        };

    const pdfBuffer = await generatePPWRLegalPdf({
      product,
      boxRecommendation: {
        status: "warning",
        message: decision.reasons.join(" "),
        buffer_percent: ppwrResult?.buffer_percent ?? 0.12,
        void_space_percentage: ppwrResult?.void_space_percentage ?? undefined,
        recommended_box: box
      },
      decision,
      eligibility,
      verificationUrl: `https://draft.local/verify/${report.id}`
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
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json(
        { message: error.message, code: error.code, details: error.details },
        { status: error.status }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Draft PDF failed",
        code: "DRAFT_PDF_FAILED"
      },
      { status: 500 }
    );
  }
}
