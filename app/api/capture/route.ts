import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createConsent,
  createFollowup,
  createLead,
  getProfileById
} from "../../../lib/store";
import { sendFollowupEmail } from "../../../lib/email";
import { sendZapierWebhook } from "../../../lib/zapier";

const captureSchema = z.object({
  profileId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  role: z.string().optional(),
  notes: z.string().optional(),
  consent: z.boolean(),
  context: z
    .object({
      source: z.string().optional().nullable(),
      event: z.string().optional().nullable(),
      location: z.string().optional().nullable()
    })
    .optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = captureSchema.parse(body);

    if (!data.consent) {
      return NextResponse.json({ error: "Consent required" }, { status: 400 });
    }

    const profile = await getProfileById(data.profileId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const lead = await createLead({
      profileId: data.profileId,
      name: data.name,
      email: data.email,
      company: data.company,
      role: data.role,
      notes: data.notes
    });

    await createConsent({
      leadId: lead.id,
      scope: "followup",
      text: "Marketing & follow-up consent",
      ip: request.headers.get("x-forwarded-for") ?? undefined
    });

    let emailStatus: "sent" | "failed" = "sent";
    try {
      await sendFollowupEmail({ lead, profile });
    } catch {
      emailStatus = "failed";
    }

    await createFollowup({
      leadId: lead.id,
      status: emailStatus === "sent" ? "sent" : "failed",
      channel: "email",
      payload: { to: lead.email }
    });

    let webhookStatus: "sent" | "failed" = "sent";
    try {
      await sendZapierWebhook({
        lead,
        profile,
        context: data.context ?? null
      });
    } catch {
      webhookStatus = "failed";
    }

    await createFollowup({
      leadId: lead.id,
      status: webhookStatus === "sent" ? "sent" : "failed",
      channel: "webhook",
      payload: { provider: "zapier" }
    });

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
