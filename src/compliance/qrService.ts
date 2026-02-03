import crypto from "crypto";
import QRCode from "qrcode";
import sharp from "sharp";

export function hashReportId(reportId: string, secret: string) {
  return crypto.createHash("sha256").update(`${reportId}${secret}`).digest("hex");
}

export function buildQrPayload(reportId: string, domain: string, secret: string) {
  const normalized = domain.replace(/\/$/, "");
  const hash = hashReportId(reportId, secret);
  return `${normalized}/verify/${reportId}?hash=${hash}`;
}

export async function generateQrSvg(payload: string) {
  return QRCode.toString(payload, { type: "svg", margin: 1 });
}

export async function generateQrPng(payload: string) {
  const png = await QRCode.toBuffer(payload, {
    type: "png",
    width: 1000,
    margin: 1
  });
  return sharp(png).withMetadata({ density: 300 }).png().toBuffer();
}
