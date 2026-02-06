export type CarbonFootprintResult = {
  total_kg_co2e: number;
  material_kg_co2e: number;
  transport_kg_co2e: number;
  unit: "kg_co2e";
  methodology_id: "LIGHT-v1";
  disclaimer_text: string;
};

export const DEFAULT_DISTANCE_KM = 500;
export const DEFAULT_TRANSPORT_FACTOR = 0.000105;
export const CARBON_DISCLAIMER =
  "This footprint is a light estimate based on merchant-provided data and default transport assumptions.";

const MATERIAL_FACTORS: Record<string, number> = {
  cardboard: 0.94,
  corrugated_cardboard: 0.94,
  virgin_plastic: 2.5,
  paper: 1.05,
  recycled_plastic: 0.85,
  pla: 0.9,
  glass: 0.85
};

function normalizeMaterial(materialType: string) {
  return materialType.trim().toLowerCase().replace(/\s+/g, "_");
}

export function calculateCarbonFootprint(
  weightInGrams: number,
  materialType: string,
  customDistance?: number
): CarbonFootprintResult {
  if (!Number.isFinite(weightInGrams) || weightInGrams <= 0) {
    return {
      total_kg_co2e: 0,
      material_kg_co2e: 0,
      transport_kg_co2e: 0,
      unit: "kg_co2e",
      methodology_id: "LIGHT-v1",
      disclaimer_text: CARBON_DISCLAIMER
    };
  }

  const weightKg = weightInGrams / 1000;
  const distanceKm =
    typeof customDistance === "number" && customDistance > 0
      ? customDistance
      : DEFAULT_DISTANCE_KM;

  const normalized = normalizeMaterial(materialType || "");
  const materialFactor = MATERIAL_FACTORS[normalized];
  if (!materialFactor) {
    return {
      total_kg_co2e: 0,
      material_kg_co2e: 0,
      transport_kg_co2e: 0,
      unit: "kg_co2e",
      methodology_id: "LIGHT-v1",
      disclaimer_text: CARBON_DISCLAIMER
    };
  }

  const material_kg_co2e = weightKg * materialFactor;
  const transport_kg_co2e = weightKg * distanceKm * DEFAULT_TRANSPORT_FACTOR;
  const total_kg_co2e = material_kg_co2e + transport_kg_co2e;

  return {
    total_kg_co2e,
    material_kg_co2e,
    transport_kg_co2e,
    unit: "kg_co2e",
    methodology_id: "LIGHT-v1",
    disclaimer_text: CARBON_DISCLAIMER
  };
}
