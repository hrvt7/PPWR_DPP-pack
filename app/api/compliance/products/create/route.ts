import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ComplianceError,
  createProductManual
} from "../../../../../src/compliance/reportService";
import {
  requireSupabaseUser,
  SupabaseAuthError
} from "../../../../../src/auth/requireSupabaseUser";

export const runtime = "nodejs";

const schema = z
  .object({
    merchant_id: z.string().uuid().optional().nullable(),
    title: z.string().min(1),
    sku: z.string().min(1).optional(),
  product_url: z.string().url().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  description: z.string().optional(),
  length_cm: z.number().positive().optional().nullable(),
  width_cm: z.number().positive().optional().nullable(),
  height_cm: z.number().positive().optional().nullable(),
  weight_g: z.number().positive().optional().nullable(),
  weight_kg: z.number().positive().optional().nullable(),
  packaging_material_type: z
    .enum([
      "cardboard",
      "virgin_plastic",
      "recycled_plastic",
      "paper",
      "pla",
      "glass"
    ])
    .optional()
    .nullable(),
    source: z.enum(["manual", "csv", "shopify"]).optional(),
    external_id: z.string().min(1).optional(),
    packaging_status: z.enum(["confirmed", "estimated", "missing"]).optional()
  })
  .refine((data) => Boolean(data.sku || data.external_id), {
    message: "sku or external_id is required"
  });

export async function POST(request: Request) {
  try {
    await requireSupabaseUser(request);
    const payload = schema.parse(await request.json());
    const product = await createProductManual(payload);
    return NextResponse.json({ product_id: product.id });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    if (error instanceof ComplianceError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
