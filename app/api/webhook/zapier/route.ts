import { NextResponse } from "next/server";
import { sendZapierWebhook } from "../../../../lib/zapier";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    await sendZapierWebhook(payload);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
