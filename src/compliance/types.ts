export type Product = {
  id: string;
  merchant_id?: string | null;
  external_id?: string;
  sku?: string;
  source: "manual" | "csv" | "shopify";
  title: string;
  description?: string;
  product_url?: string | null;
  image_url?: string | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  weight_g?: number | null;
  weight_kg?: number | null;
  packaging_material_type?: PackagingMaterialType | null;
  packaging_status?: PackagingStatus;
  confirmed_at?: Date;
  confirmed_by?: string;
  updated_at?: Date;
  created_at: Date;
};

export type PackagingBox = {
  id: string;
  name: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
};

export type ComplianceReport = {
  id: string;
  product_id: string;
  ppwr_compliant: boolean | null;
  empty_space_percent: number | null;
  recommended_box_id: string | null;
  status: "draft" | "finalized";
  pdf_url?: string;
  qr_payload?: string;
  created_at: Date;
  finalized_at?: Date;
};

export type PackagingStatus = "confirmed" | "estimated" | "missing";
export type PackagingMaterialType =
  | "cardboard"
  | "virgin_plastic"
  | "recycled_plastic"
  | "paper"
  | "pla"
  | "glass";

export type PPWRResult = {
  compliant: boolean;
  empty_space_percent: number;
  recommended_box: PackagingBox;
  explanation_text: string;
};

export type StandardBox = {
  id: string;
  name: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
};

export type ReportKind = "ppwr" | "dpp" | "combined";
export type ReportStatus = "draft" | "final";

export type ComplianceReportRecord = {
  id: string;
  product_id: string;
  kind: ReportKind;
  status: ReportStatus;
  ppwr_result_json: unknown | null;
  dpp_json: unknown | null;
  carbon_json: unknown | null;
  qr_ppwr_url?: string | null;
  qr_dpp_url?: string | null;
  pdf_url?: string | null;
  finalized_at?: Date;
  created_at: Date;
};

export interface ProductImporter {
  import(): Promise<Product[]>;
}

export class ShopifyImporter implements ProductImporter {
  async import(): Promise<Product[]> {
    return [];
  }
}
