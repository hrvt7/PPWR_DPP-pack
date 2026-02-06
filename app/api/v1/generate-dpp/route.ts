import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiKeyError, requireApiKey } from "../../../../src/auth/requireApiKey";
import {
  ComplianceError,
  finalizeReport,
  generateDraftReport,
  getProductBySku
} from "../../../../src/compliance/reportService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  order_id: z.string().min(1),
  customer_country: z.string().min(2).max(2).optional(),
  distance_km: z.number().positive().optional(),
  items: z.array(
    z.object({
      sku: z.string().min(1),
      qty: z.number().int().min(1)
    })
  )
});

// Third-party usage:
// - Provide X-API-KEY from the shops.public_api_key column.
// - Generate an API key by creating a random token and storing it on the shop row.
export async function POST(request: Request) {
  try {
    await requireApiKey(request);

    const payload = schema.parse(await request.json());
    const domain = process.env.APP_DOMAIN ?? "";

    const results: Array<{
      sku: string;
      report_id?: string;
      dpp_url?: string | null;
      qr_url?: string | null;
      error?: string;
    }> = [];

    for (const item of payload.items) {
      const product = await getProductBySku(item.sku);
      if (!product) {
        results.push({ sku: item.sku, error: "Product not found" });
        continue;
      }

      const report = await generateDraftReport({
        productId: product.id,
        destination_country: payload.customer_country ?? null,
        distance_km: payload.distance_km ?? null
      });

      if (product.packaging_status === "confirmed") {
        const finalized = await finalizeReport(report.id);
        const dppUrl =
          finalized.dpp_id && domain
            ? `${domain.replace(/\/$/, "")}/dpp/${finalized.dpp_id}`
            : null;
        results.push({
          sku: item.sku,
          report_id: report.id,
          dpp_url: dppUrl,
          qr_url: finalized.qr_dpp_url ?? null
        });
      } else {
        results.push({
          sku: item.sku,
          report_id: report.id,
          error: "Report generated in draft; packaging not confirmed."
        });
      }
    }

    return NextResponse.json({
      success: true,
      order_id: payload.order_id,
      results
    });
  } catch (error) {
    if (error instanceof ApiKeyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof ComplianceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
