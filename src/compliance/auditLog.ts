import { nanoid } from "nanoid";
import { getSupabaseServerClient } from "../../lib/supabase";

export async function logComplianceAction(params: {
  actor_id: string;
  action: string;
  source: "ai" | "manual";
}) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { error } = await supabase.from("compliance_audit_log").insert({
    id: nanoid(),
    actor_id: params.actor_id,
    action: params.action,
    source: params.source,
    created_at: new Date().toISOString()
  });

  if (error) {
    throw new Error("Failed to write audit log");
  }
}
