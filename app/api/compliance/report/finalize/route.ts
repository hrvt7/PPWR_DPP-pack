import { NextResponse } from "next/server";
import { z } from "zod";
import { ComplianceError, finalizeReport } from "../../../../../src/compliance/reportService";
import { logComplianceAction } from "../../../../../src/compliance/auditLog";
import {
  requireSupabaseUser,
  SupabaseAuthError
} from "../../../../../src/auth/requireSupabaseUser";

export const runtime = "nodejs";

const schema = z.object({
  report_id: z.string().min(1),
  actor_id: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    await requireSupabaseUser(request);
    const payload = schema.parse(await request.json());
    const result = await finalizeReport(payload.report_id);
    await logComplianceAction({
      actor_id: payload.actor_id,
      action: "report_finalization",
      source: "manual"
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json(
        { message: error.message, code: error.code, details: error.details },
        { status: error.status }
      );
    }
    if (error instanceof ComplianceError) {
      return NextResponse.json(
        { message: error.message, code: "COMPLIANCE_ERROR" },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { message: "Invalid request", code: "INVALID_REQUEST" },
      { status: 400 }
    );
  }
}
