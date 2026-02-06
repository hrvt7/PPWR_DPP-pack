import { headers } from "next/headers";

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

  if (!hash) {
    return (
      <main className="shell">
        <section className="card">
          <h2>Invalid verification link</h2>
          <p>The verification link is missing a valid signature.</p>
        </section>
      </main>
    );
  }

  try {
    const headerList = headers();
    const host = headerList.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";
    const baseUrl = host ? `${protocol}://${host}` : "";
    const response = await fetch(
      `${baseUrl}/api/compliance/report/${params.report_id}?verify=1&include=product&hash=${encodeURIComponent(
        hash
      )}`,
      { cache: "no-store" }
    );

    if (response.status === 403) {
      return (
        <main className="shell">
          <section className="card">
            <h2>Invalid verification link</h2>
            <p>The verification link signature does not match.</p>
          </section>
        </main>
      );
    }

    if (response.status === 404) {
      return (
        <main className="shell">
          <section className="card">
            <h2>Report not found</h2>
          </section>
        </main>
      );
    }

    if (!response.ok) {
      return (
        <main className="shell">
          <section className="card">
            <h2>Unable to load verification data</h2>
          </section>
        </main>
      );
    }

    const data = (await response.json()) as {
      report: {
        id: string;
        ppwr_result_json?: {
          compliance_status?: string;
          void_space_percentage?: number | null;
        };
        created_at: string;
      };
      product: { title: string };
    };
    const complianceStatus =
      data.report.ppwr_result_json?.compliance_status ?? "unknown";
    const voidSpace =
      data.report.ppwr_result_json?.void_space_percentage ?? null;

    return (
      <main className="shell">
        <section className="card">
          <h2>Compliance Verification</h2>
          <p>
            <strong>Report ID:</strong> {data.report.id}
          </p>
          <p>
            <strong>Product:</strong> {data.product.title}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {complianceStatus}
          </p>
          <p>
            <strong>Empty space:</strong>{" "}
            {typeof voidSpace === "number" ? `${voidSpace.toFixed(2)}%` : "N/A"}
          </p>
          <p>
            <strong>Timestamp:</strong> {new Date(data.report.created_at).toISOString()}
          </p>
          <p style={{ marginTop: 16 }}>
            Generated via CompliPack. Not a legal certification.
          </p>
        </section>
      </main>
    );
  } catch (error) {
    return (
      <main className="shell">
        <section className="card">
          <h2>Unable to load verification data</h2>
        </section>
      </main>
    );
  }
}
