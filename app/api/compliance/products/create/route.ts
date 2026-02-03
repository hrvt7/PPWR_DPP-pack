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
  length_cm: z.number().positive(),
  width_cm: z.number().positive(),
  height_cm: z.number().positive(),
  source: z.enum(["manual", "csv", "shopify"]).optional(),
  external_id: z.string().optional()
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
