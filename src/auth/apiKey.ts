import crypto from "crypto";

const PREFIX = "cpk_live_";

export function generateApiKey() {
  const token = crypto.randomBytes(24).toString("hex");
  return `${PREFIX}${token}`;
}

export function constantTimeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}
