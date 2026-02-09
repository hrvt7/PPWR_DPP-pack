import { getSupabaseServerClient } from "../../lib/supabase";

export class SupabaseAuthError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 401, code = "unauthorized") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export type AuthenticatedUser = {
  id: string;
  email?: string | null;
};

export async function requireSupabaseUser(request: Request): Promise<AuthenticatedUser> {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new SupabaseAuthError("Unauthorized", 401, "unauthorized");
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new SupabaseAuthError("Unauthorized", 401, "unauthorized");
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new SupabaseAuthError("Unauthorized", 401, "unauthorized");
  }

  return {
    id: data.user.id,
    email: data.user.email
  };
}
