import crypto from "crypto";
import { constantTimeEqual } from "../../auth/apiKey";

export function verifyShopifyWebhook(
  rawBody: string,
  hmacHeader: string | null,
  secret: string
) {
  if (!hmacHeader) return false;
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");
  return constantTimeEqual(digest, hmacHeader);
}
