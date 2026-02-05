export async function updateShopifyOrderNote(
  orderId: string,
  dppUrl: string
) {
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  const domain = process.env.SHOPIFY_SHOP_DOMAIN;
  if (!token || !domain) {
    return;
  }

  const endpoint = `https://${domain}/admin/api/2024-07/orders/${orderId}.json`;

  const existing = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token
    }
  });

  if (!existing.ok) {
    return;
  }

  const data = (await existing.json()) as { order?: { note?: string } };
  const currentNote = data.order?.note ?? "";
  const appendText = `\nDPP: ${dppUrl}`.trim();
  const nextNote = currentNote.includes(appendText)
    ? currentNote
    : `${currentNote}${currentNote ? "\n" : ""}${appendText}`;

  await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token
    },
    body: JSON.stringify({
      order: {
        id: orderId,
        note: nextNote
      }
    })
  });
}
