import { NextResponse } from "next/server";
import { z } from "zod";

import { ComplianceError, importProductsFromCSV } from "../../../../../src/compliance/reportService";
import { requireSupabaseUser, SupabaseAuthError } from "../../../../../src/auth/requireSupabaseUser";

export const runtime = "nodejs";

/**
 * Allowed frontend origins (production + previews if needed)
 * Add more if you use other domains.
 */
const ALLOWED_ORIGINS = new Set<string>([
  "https://complipack-pro.vercel.app",
  "https://complipack-pro-c95vab9e3-hrvt7s-projects.vercel.app",
  // If you still have another prod domain, add it here:
  // "https://complipack.vercel.app",
]);

function getCorsHeaders(origin: string | null) {
  const allowOrigin =
    origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://complipack-pro.vercel.app";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "authorization,content-type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  } as Record<string, string>;
}

const schema = z.object({
  csv: z.string().min(1),
});

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    await requireSupabaseUser(request);

    const payload = schema.parse(await request.json());
    const result = await importProductsFromCSV(payload.csv);

    return NextResponse.json(result, { status: 200, headers: corsHeaders });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status, headers: corsHeaders }
      );
    }

    if (error instanceof ComplianceError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400, headers: corsHeaders }
    );
  }
}
