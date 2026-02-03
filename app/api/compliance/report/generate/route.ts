import { NextResponse } from "next/server";
import { z } from "zod";
import { ComplianceError, generateDraftReport } from "../../../../../src/compliance/reportService";

export const runtime = "nodejs";

const schema = z.object({
  product_id: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const report = await generateDraftReport(payload.product_id);
    return NextResponse.json({ report_id: report.id });
  } catch (error) {
    if (error instanceof ComplianceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
