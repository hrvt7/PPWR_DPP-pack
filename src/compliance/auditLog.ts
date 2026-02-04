import { nanoid } from "nanoid";
import { getSupabaseServerClient } from "../../lib/supabase";

export async function logComplianceAction(params: {
  actor_id?: string;
  product_id?: string;
  action: string;
  source: "ai" | "manual";
}) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const actorId = params.actor_id ?? "system";
  const payload: Record<string, string> = {
    actor_id: actorId,
    action: params.action,
    source: params.source,
    created_at: new Date().toISOString()
  };

  if (params.product_id) {
    payload.product_id = params.product_id;
  }

  const { error } = await supabase.from("compliance_audit_log").insert({
    id: nanoid(),
    ...payload
  });

  if (error) {
    throw new Error("Failed to write audit log");
  }
}
