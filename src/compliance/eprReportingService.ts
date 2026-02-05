export type EprCountryCode = "HU" | "DE" | "FR" | "AT";

export type EprCountryConfig = {
  countryCode: EprCountryCode;
  label: string;
  materialCategories: string[];
  columnOrder: string[];
};

const COUNTRY_CONFIGS: Record<EprCountryCode, EprCountryConfig> = {
  HU: {
    countryCode: "HU",
    label: "MOHU",
    materialCategories: ["paper", "plastic", "composite", "glass", "metal", "other"],
    columnOrder: [
      "product_id",
      "sku",
      "product_name",
      "destination_country",
      "material_category",
      "carbon_total_co2",
      "carbon_material_co2",
      "carbon_transport_co2",
      "calculation_date"
    ]
  },
  DE: {
    countryCode: "DE",
    label: "EPR",
    materialCategories: ["paper", "plastic", "composite", "glass", "metal", "other"],
    columnOrder: [
      "product_id",
      "sku",
      "product_name",
      "destination_country",
      "material_category",
      "carbon_total_co2",
      "carbon_material_co2",
      "carbon_transport_co2",
      "calculation_date"
    ]
  },
  FR: {
    countryCode: "FR",
    label: "EPR",
    materialCategories: ["paper", "plastic", "composite", "glass", "metal", "other"],
    columnOrder: [
      "product_id",
      "sku",
      "product_name",
      "destination_country",
      "material_category",
      "carbon_total_co2",
      "calculation_date"
    ]
  },
  AT: {
    countryCode: "AT",
    label: "EPR",
    materialCategories: ["paper", "plastic", "composite", "glass", "metal", "other"],
    columnOrder: [
      "product_id",
      "sku",
      "product_name",
      "destination_country",
      "material_category",
      "carbon_total_co2",
      "carbon_transport_co2",
      "calculation_date"
    ]
  }
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function resolveEprCountryConfig(countryCode?: string): EprCountryConfig {
  const normalized = normalize(countryCode ?? "");
  if (normalized === "de") return COUNTRY_CONFIGS.DE;
  if (normalized === "fr") return COUNTRY_CONFIGS.FR;
  if (normalized === "at") return COUNTRY_CONFIGS.AT;
  return COUNTRY_CONFIGS.HU;
}

export function mapMaterialCategory(
  materialType: string,
  countryCode?: string
): string {
  const config = resolveEprCountryConfig(countryCode);
  const normalized = normalize(materialType || "");

  if (normalized.includes("paper") || normalized.includes("cardboard")) {
    return config.materialCategories.includes("paper") ? "paper" : "other";
  }
  if (normalized.includes("plastic") || normalized.includes("ldpe")) {
    return config.materialCategories.includes("plastic") ? "plastic" : "other";
  }
  if (normalized.includes("glass")) {
    return config.materialCategories.includes("glass") ? "glass" : "other";
  }
  if (normalized.includes("metal") || normalized.includes("aluminum")) {
    return config.materialCategories.includes("metal") ? "metal" : "other";
  }
  if (normalized.includes("composite")) {
    return config.materialCategories.includes("composite") ? "composite" : "other";
  }

  return "other";
}
