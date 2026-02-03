import { hashReportId } from "../../../src/compliance/qrService";
import {
  ComplianceError,
  getProductById,
  getReportById
} from "../../../src/compliance/reportService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value ?? null;
}

export default async function VerifyPage({
  params,
  searchParams
}: {
  params: { report_id: string };
  searchParams: SearchParams;
}) {
  const hash = getParam(searchParams, "hash");
  const secret = process.env.COMPLIANCE_QR_SECRET;

  if (!hash || !secret) {
    return (
      <main className="shell">
        <section className="card">
          <h2>Invalid verification link</h2>
          <p>The verification link is missing a valid signature.</p>
        </section>
      </main>
    );
  }

  const expected = hashReportId(params.report_id, secret);
  if (expected !== hash) {
    return (
      <main className="shell">
        <section className="card">
          <h2>Invalid verification link</h2>
          <p>The verification link signature does not match.</p>
        </section>
      </main>
    );
  }

  try {
    const report = await getReportById(params.report_id);
    if (!report) {
      return (
        <main className="shell">
          <section className="card">
            <h2>Report not found</h2>
          </section>
        </main>
      );
    }
    const product = await getProductById(report.product_id);
    if (!product) {
      return (
        <main className="shell">
          <section className="card">
            <h2>Product not found</h2>
          </section>
        </main>
      );
    }

    return (
      <main className="shell">
        <section className="card">
          <h2>Compliance Verification</h2>
          <p>
            <strong>Report ID:</strong> {report.id}
          </p>
          <p>
            <strong>Product:</strong> {product.title}
          </p>
          <p>
            <strong>Status:</strong> {report.ppwr_compliant ? "Compliant" : "Non-compliant"}
          </p>
          <p>
            <strong>Empty space:</strong> {report.empty_space_percent.toFixed(2)}%
          </p>
          <p>
            <strong>Timestamp:</strong> {report.created_at.toISOString()}
          </p>
          <p style={{ marginTop: 16 }}>
            Generated via CompliPack. Not a legal certification.
          </p>
        </section>
      </main>
    );
  } catch (error) {
    const message =
      error instanceof ComplianceError
        ? error.message
        : "Unable to load verification data";
    return (
      <main className="shell">
        <section className="card">
          <h2>{message}</h2>
        </section>
      </main>
    );
  }
}
