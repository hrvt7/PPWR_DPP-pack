export type Product = {
  id: string;
  external_id?: string;
  source: "manual" | "csv" | "shopify";
  title: string;
  description?: string;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  weight_kg?: number | null;
  packaging_status?: PackagingStatus;
  confirmed_at?: Date;
  confirmed_by?: string;
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

export type PPWRResult = {
  compliant: boolean;
  empty_space_percent: number;
  recommended_box: PackagingBox;
  explanation_text: string;
};

export type StandardBox = {
  id?: string;
  name: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
};

export interface ProductImporter {
  import(): Promise<Product[]>;
}

export class ShopifyImporter implements ProductImporter {
  async import(): Promise<Product[]> {
    return [];
  }
}
