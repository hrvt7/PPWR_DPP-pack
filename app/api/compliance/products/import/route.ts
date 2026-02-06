import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ComplianceError,
  importProductsFromCSV
} from "../../../../../src/compliance/reportService";
import { ApiKeyError, requireApiKey } from "../../../../../src/auth/requireApiKey";

export const runtime = "nodejs";

const schema = z.object({
  csv: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    await requireApiKey(request);
    const payload = schema.parse(await request.json());
    const result = await importProductsFromCSV(payload.csv);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiKeyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof ComplianceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
