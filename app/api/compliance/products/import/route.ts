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
 * - Prod FE: https://complipack-pro.vercel.app
 * - Local dev FE: http://localhost:5173 (ha kell)
 */
const ALLOWED_ORIGINS = new Set<string>([
  "https://complipack-pro.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "authorization,content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

const RowSchema = z.object({
  product_name: z.string().min(1),
  length_cm: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  width_cm: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  height_cm: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  weight_kg: z.union([z.number(), z.string()]).optional().transform((v) => (v === undefined ? undefined : Number(v))),
  materials: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const PayloadSchema = z.union([
  z.object({
    csv: z.string().min(1),
  }),
  z.object({
    // frontend-ek gyakran így küldik
    rows: z.array(RowSchema).min(1),
  }),
  z.object({
    // másik gyakori név
    products: z.array(RowSchema).min(1),
  }),
]);

function escapeCsv(value: unknown) {
  const s = value === null || value === undefined ? "" : String(value);
  // CSV escape: ha tartalmaz " , \n akkor idézőjelezni kell, és a " duplázódik
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToCsv(rows: Array<z.infer<typeof RowSchema>>) {
  const header = [
    "product_name",
    "length_cm",
    "width_cm",
    "height_cm",
    "weight_kg",
    "materials",
    "description",
  ].join(",");

  const lines = rows.map((r) =>
    [
      escapeCsv(r.product_name),
      escapeCsv(r.length_cm),
      escapeCsv(r.width_cm),
      escapeCsv(r.height_cm),
      escapeCsv(r.weight_kg ?? ""),
      escapeCsv(r.materials ?? ""),
      escapeCsv(r.description ?? ""),
    ].join(",")
  );

  return [header, ...lines].join("\n");
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  try {
    await requireSupabaseUser(request);

    const raw = await request.json();
    const payload = PayloadSchema.parse(raw);

    let csv: string;

    if ("csv" in payload) {
      csv = payload.csv;
    } else if ("rows" in payload) {
      csv = rowsToCsv(payload.rows);
    } else {
      csv = rowsToCsv(payload.products);
    }

    const result = await importProductsFromCSV(csv);
    return NextResponse.json(result, { headers: corsHeaders(origin) });
  } catch (error) {
    // Fontos: ERROR-ra is tegyük rá a CORS headert, különben a böngésző “Failed to fetch”-et dob.
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status, headers: corsHeaders(origin) }
      );
    }
    if (error instanceof ComplianceError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status, headers: corsHeaders(origin) }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request", details: error.flatten() },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400, headers: corsHeaders(origin) }
    );
  }
}
