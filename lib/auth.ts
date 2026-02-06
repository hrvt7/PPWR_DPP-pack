import { getSupabaseServerClient } from "./supabase";

export async function validatePublicApiKey(apiKey: string | null) {
  if (!apiKey) return null;
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("shops")
    .select("id, public_api_key")
    .eq("public_api_key", apiKey)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}
