export async function sendZapierWebhook(payload: Record<string, unknown>) {
  const url = process.env.ZAPIER_WEBHOOK_URL;
  if (!url) {
    return { status: "skipped", reason: "Missing ZAPIER_WEBHOOK_URL" };
  }
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Zapier webhook failed: ${response.status}`);
  }
  return { status: "sent" };
}
