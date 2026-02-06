import { NextResponse } from "next/server";
import { z } from "zod";
import { ComplianceError, generateDraftReport } from "../../../../../src/compliance/reportService";

export const runtime = "nodejs";

const schema = z.object({
  product_id: z.string().min(1),
  buffer_percent: z.number().min(0).max(1).optional(),
  distance_km: z.number().positive().optional(),
  destination_country: z.string().min(2).max(2).optional()
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const report = await generateDraftReport({
      productId: payload.product_id,
      buffer_percent: payload.buffer_percent,
      distance_km: payload.distance_km ?? null,
      destination_country: payload.destination_country ?? null
    });
    return NextResponse.json({ report });
  } catch (error) {
    if (error instanceof ComplianceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
