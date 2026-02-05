import { headers } from "next/headers";
import { getSupabaseServerClient } from "../../../lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SearchParams = Record<string, string | string[] | undefined>;

type Language = "en" | "hu" | "de";

const translations: Record<Language, Record<string, string>> = {
  en: {
    title: "Digital Product Passport",
    carbonTitle: "Packaging Carbon Footprint",
    material: "Material CO2",
    transport: "Transport CO2",
    total: "Total CO2",
    method: "Method",
    destination: "Destination Country",
    labelEpr: "EPR",
    labelMohu: "MOHU",
    disclaimer:
      "This information is based on merchant-provided data and light estimations."
  },
  hu: {
    title: "Digitális Termékútlevél",
    carbonTitle: "Csomagolási karbonlábnyom",
    material: "Anyag CO2",
    transport: "Szállítás CO2",
    total: "Összes CO2",
    method: "Módszertan",
    destination: "Célország",
    labelEpr: "EPR",
    labelMohu: "MOHU",
    disclaimer:
      "Az információ a kereskedő által megadott adatokon és könnyített becslésen alapul."
  },
  de: {
    title: "Digitaler Produktpass",
    carbonTitle: "CO2-Fußabdruck der Verpackung",
    material: "Material CO2",
    transport: "Transport CO2",
    total: "Gesamt CO2",
    method: "Methode",
    destination: "Bestimmungsland",
    labelEpr: "EPR",
    labelMohu: "MOHU",
    disclaimer:
      "Diese Informationen basieren auf Händlerangaben und einer vereinfachten Schätzung."
  }
};

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value ?? null;
}

function parseLanguage(acceptLanguage: string | null): Language {
  if (!acceptLanguage) return "en";
  const token = acceptLanguage.split(",")[0]?.trim().toLowerCase();
  if (token?.startsWith("hu")) return "hu";
  if (token?.startsWith("de")) return "de";
  return "en";
}

export default async function DppPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: SearchParams;
}) {
  const headerList = headers();
  const fallbackLanguage = parseLanguage(headerList.get("accept-language"));
  const explicitLang = getParam(searchParams, "lang") as Language | null;
  const language: Language =
    explicitLang && translations[explicitLang] ? explicitLang : fallbackLanguage;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return (
      <main className="shell">
        <section className="card">
          <h2>Unable to load DPP</h2>
        </section>
      </main>
    );
  }

  const { data: dpp } = await supabase
    .from("dpp")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!dpp) {
    return (
      <main className="shell">
        <section className="card">
          <h2>DPP not found</h2>
        </section>
      </main>
    );
  }

  const { data: product } = dpp.product_id
    ? await supabase
        .from("products")
        .select("title, external_id")
        .eq("id", dpp.product_id)
        .maybeSingle()
    : { data: null };

  const destinationCountry = dpp.destination_country ?? "EU";
  const label =
    destinationCountry.toUpperCase() === "HU"
      ? translations[language].labelMohu
      : translations[language].labelEpr;

  const t = translations[language];

  return (
    <main className="shell">
      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2>{t.title}</h2>
            <p style={{ color: "var(--muted)" }}>{label}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a className="btn btn-ghost" href={`?lang=en`}>
              EN
            </a>
            <a className="btn btn-ghost" href={`?lang=hu`}>
              HU
            </a>
            <a className="btn btn-ghost" href={`?lang=de`}>
              DE
            </a>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <p>
            <strong>{product?.title ?? "Product"}:</strong>{" "}
            {product?.external_id ?? "SKU N/A"}
          </p>
          <p>
            <strong>{t.destination}:</strong> {destinationCountry}
          </p>
        </div>

        <div style={{ marginTop: 16 }}>
          <h3>{t.carbonTitle}</h3>
          <p>
            <strong>{t.material}:</strong>{" "}
            {dpp.carbon_material_co2 ?? 0}
          </p>
          <p>
            <strong>{t.transport}:</strong>{" "}
            {dpp.carbon_transport_co2 ?? 0}
          </p>
          <p>
            <strong>{t.total}:</strong> {dpp.carbon_total_co2 ?? 0}
          </p>
          <p>
            <strong>{t.method}:</strong>{" "}
            {dpp.carbon_calculation_method ?? "EU_AVERAGE_LIGHT_V1"}
          </p>
        </div>

        <p style={{ marginTop: 16, color: "var(--muted)" }}>{t.disclaimer}</p>
      </section>
    </main>
  );
}
