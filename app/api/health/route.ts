import { NextResponse } from "next/server";
import packageJson from "../../../package.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: packageJson.version,
    time: new Date().toISOString()
  });
}
