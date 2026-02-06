import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ComplianceError,
  createProductManual
} from "../../../../../src/compliance/reportService";

export const runtime = "nodejs";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  length_cm: z.number().positive().optional().nullable(),
  width_cm: z.number().positive().optional().nullable(),
  height_cm: z.number().positive().optional().nullable(),
  weight_kg: z.number().positive().optional().nullable(),
  source: z.enum(["manual", "csv", "shopify"]).optional(),
  external_id: z.string().min(1),
  packaging_status: z.enum(["confirmed", "estimated", "missing"]).optional()
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const product = await createProductManual(payload);
    return NextResponse.json({ product_id: product.id });
  } catch (error) {
    if (error instanceof ComplianceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
