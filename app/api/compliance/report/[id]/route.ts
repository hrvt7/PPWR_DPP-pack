import crypto from "crypto";
import { NextResponse } from "next/server";
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

    if (includeProduct) {
      const product = await getProductById(report.product_id);
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ report, product: { id: product.id, title: product.title } });
    }

    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof ComplianceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
