import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ComplianceError,
  importProductsFromCSV,
} from "../../../../../src/compliance/reportService";
import {
  requireSupabaseUser,
  SupabaseAuthError,
} from "../../../../../src/auth/requireSupabaseUser";

export const runtime = "nodejs";

/**
 * CORS
 * - prod frontend: https://complipack-pro.vercel.app
 * - local dev: http://localhost:5173, http://localhost:3000 (ha kell)
 *
 * Ha több preview domained van, tedd be ide.
 */
const ALLOWED_ORIGINS = new Set([
  "https://complipack-pro.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://complipack-pro.vercel.app"; // fallback

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "authorization,content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/**
 * Payload: vagy CSV string, vagy rows lista
 */
const rowSchema = z.object({
  product_name: z.string().min(1),
  length_cm: z.coerce.number(),
  width_cm: z.coerce.number(),
  height_cm: z.coerce.number(),
  weight_kg: z.coerce.number().optional().nullable(),
  materials: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  external_id: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
});

const payloadSchema = z.union([
  z.object({ csv: z.string().min(1) }),
  z.object({ rows: z.array(rowSchema).min(1) }),
]);

function escapeCsv(value: unknown) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToCsv(rows: Array<z.infer<typeof rowSchema>>) {
  // Ez a header sorrend legyen stabil (a reportService ezt várhatja).
  const headers = [
    "product_name",
    "length_cm",
    "width_cm",
    "height_cm",
    "weight_kg",
    "materials",
    "description",
    "external_id",
    "source",
  ];

  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => escapeCsv((r as any)[h]))
        .join(",")
    ),
  ];

  return lines.join("\n");
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function POST(request: Request) {
  const cors = getCorsHeaders(request);

  try {
    // 1) Auth
    await requireSupabaseUser(request);

    // 2) Parse payload
    const json = await request.json().catch(() => null);
    const parsed = payloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid request",
          details: parsed.error.flatten(),
          expected: "Send { csv: string } OR { rows: ParsedRow[] }",
        },
        { status: 400, headers: cors }
      );
    }

    // 3) Normalize -> CSV
    const csv =
      "csv" in parsed.data ? parsed.data.csv : rowsToCsv(parsed.data.rows);

    // 4) Import
    const result = await importProductsFromCSV(csv);

    return NextResponse.json(result, { headers: cors });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status, headers: cors }
      );
    }
    if (error instanceof ComplianceError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status, headers: cors }
      );
    }

    // fallback
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ message }, { status: 400, headers: cors });
  }
}
