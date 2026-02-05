export type CarbonFootprintResult = {
  carbonMaterialCo2: number;
  carbonTransportCo2: number;
  carbonTotalCo2: number;
  carbonCalculationDate: Date;
  carbonCalculationMethod: "EU_AVERAGE_LIGHT_V1";
};

const DEFAULT_DISTANCE_KM = 500;
const DEFAULT_TRANSPORT_FACTOR = 0.000105;

const MATERIAL_FACTORS: Record<string, number> = {
  corrugated_cardboard: 0.94,
  virgin_plastic: 2.5,
  paper: 1.05,
  recycled_plastic: 0.85
};

function normalizeMaterial(materialType: string) {
  return materialType.trim().toLowerCase().replace(/\s+/g, "_");
}

export function calculateCarbonFootprint(
  weightInGrams: number,
  materialType: string,
  customDistance?: number
): CarbonFootprintResult {
  const method: CarbonFootprintResult["carbonCalculationMethod"] =
    "EU_AVERAGE_LIGHT_V1";

  if (!Number.isFinite(weightInGrams) || weightInGrams <= 0) {
    return {
      carbonMaterialCo2: 0,
      carbonTransportCo2: 0,
      carbonTotalCo2: 0,
      carbonCalculationDate: new Date(),
      carbonCalculationMethod: method
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
      carbonMaterialCo2: 0,
      carbonTransportCo2: 0,
      carbonTotalCo2: 0,
      carbonCalculationDate: new Date(),
      carbonCalculationMethod: method
    };
  }

  const carbonMaterialCo2 = weightKg * materialFactor;
  const carbonTransportCo2 = weightKg * distanceKm * DEFAULT_TRANSPORT_FACTOR;
  const carbonTotalCo2 = carbonMaterialCo2 + carbonTransportCo2;

  return {
    carbonMaterialCo2,
    carbonTransportCo2,
    carbonTotalCo2,
    carbonCalculationDate: new Date(),
    carbonCalculationMethod: method
  };
}
