import { getSupabaseServerClient } from "../../lib/supabase";

export class ApiKeyError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type ShopAuth = {
  id: string;
  merchant_id: string | null;
  status: string;
  api_key: string;
};

async function lookupShopByApiKey(apiKey: string): Promise<ShopAuth | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("shops")
    .select("id, merchant_id, status, api_key")
    .eq("api_key", apiKey)
    .maybeSingle();
  if (error || !data) return null;
  return data as ShopAuth;
}

export async function requireApiKey(
  request: Request,
  lookup: (apiKey: string) => Promise<ShopAuth | null> = lookupShopByApiKey
) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    throw new ApiKeyError("Missing API key", 401);
  }
  const shop = await lookup(apiKey);
  if (!shop) {
    throw new ApiKeyError("Invalid API key", 403);
  }
  if (shop.status !== "active") {
    throw new ApiKeyError("API key disabled", 403);
  }
  return shop;
}
