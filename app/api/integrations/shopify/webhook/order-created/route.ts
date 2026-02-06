import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  ComplianceError,
  finalizeReport,
  generateDraftReport,
  getProductBySku
} from "../../../../../../src/compliance/reportService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifyShopifyHmac(rawBody: string, hmacHeader: string | null, secret: string) {
  if (!hmacHeader) return false;
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Webhook secret missing" },
        { status: 403 }
      );
    }

    const rawBody = await request.text();
    const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
    if (!verifyShopifyHmac(rawBody, hmacHeader, secret)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 403 }
      );
    }

    const payload = JSON.parse(rawBody) as {
      id: string | number;
      total_weight?: number;
      line_items?: Array<{ sku?: string; quantity?: number }>;
      shipping_address?: { country_code?: string };
    };

    const destinationCountry = payload.shipping_address?.country_code ?? null;
    const items = payload.line_items ?? [];
    const results: Array<{
      sku: string;
      report_id?: string;
      pdf_url?: string;
      qr_ppwr_url?: string;
      qr_dpp_url?: string;
      error?: string;
    }> = [];

    for (const item of items) {
      const sku = item.sku?.trim();
      if (!sku) {
        results.push({ sku: "", error: "Missing SKU" });
        continue;
      }
      const product = await getProductBySku(sku);
      if (!product) {
        results.push({ sku, error: "Product not found" });
        continue;
      }
      const report = await generateDraftReport({
        productId: product.id,
        destination_country: destinationCountry ?? undefined
      });

      if (product.packaging_status === "confirmed") {
        const finalized = await finalizeReport(report.id);
        results.push({
          sku,
          report_id: report.id,
          pdf_url: finalized.pdf_url,
          qr_ppwr_url: finalized.qr_ppwr_url,
          qr_dpp_url: finalized.qr_dpp_url
        });
      } else {
        results.push({
          sku,
          report_id: report.id,
          error: "Report generated in draft; packaging not confirmed."
        });
      }
    }

    return NextResponse.json({
      order_id: String(payload.id ?? ""),
      results
    });
  } catch (error) {
    if (error instanceof ComplianceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 500 }
    );
  }
}
