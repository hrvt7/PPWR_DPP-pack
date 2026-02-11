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
 * - Frontend (complipack-pro.vercel.app) hívja a backendet (ppwr-dpp-pack.vercel.app) böngészőből
 * - Kell OPTIONS + Access-Control-Allow-* headerek
 *
 * Biztonságosabb: csak engedélyezett origin(ek)nek adunk vissza CORS-t.
 */
const ALLOWED_ORIGINS = new Set<string>([
  "https://complipack-pro.vercel.app",
  // preview deploymentek vercel-en (ha kell). Ha nem akarod, töröld.
  // "https://complipack-pro-git-fix-mvp-stabilize-hrvt7s-projects.vercel.app",
  // "https://complipack-c95vab9e3-hrvt7s-projects.vercel.app",
]);

function getCorsOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return null;

  // Engedélyezett lista
  if (ALLOWED_ORIGINS.has(origin)) return origin;

  // Opció: minden vercel preview (csak hrvt7s-projects alatt) — ha akarod, hagyd bent
  // Ezzel nem kell kézzel felvenni minden preview domaint.
  if (/^https:\/\/complipack-[a-z0-9-]+-hrvt7s-projects\.vercel\.app$/i.test(origin)) {
    return origin;
  }

  return null;
}

function corsHeaders(req: Request) {
  const corsOrigin = getCorsOrigin(req);
  return {
    // ha nem engedélyezett origin, inkább ne adjunk CORS-t
    ...(corsOrigin ? { "Access-Control-Allow-Origin": corsOrigin } : {}),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    // cache-ek miatt jó jelölni
    "Vary": "Origin",
  };
}

const schema = z.object({
  csv: z.string().min(1),
});

export async function OPTIONS(request: Request) {
  // Preflight requestre 200 + CORS headerek
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(request),
  });
}

export async function POST(request: Request) {
  try {
    await requireSupabaseUser(request);

    const payload = schema.parse(await request.json());
    const result = await importProductsFromCSV(payload.csv);

    return NextResponse.json(result, {
      headers: corsHeaders(request),
    });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        {
          status: error.status,
          headers: corsHeaders(request),
        }
      );
    }

    if (error instanceof ComplianceError) {
      return NextResponse.json(
        { message: error.message },
        {
          status: error.status,
          headers: corsHeaders(request),
        }
      );
    }

    return NextResponse.json(
      { message: "Invalid request" },
      {
        status: 400,
        headers: corsHeaders(request),
      }
    );
  }
}
