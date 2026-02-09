import { getSupabaseServerClient } from "../../lib/supabase";

export class SupabaseAuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
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
    throw new SupabaseAuthError("Unauthorized", 401);
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new SupabaseAuthError("Unauthorized", 401);
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new SupabaseAuthError("Unauthorized", 401);
  }

  return {
    id: data.user.id,
    email: data.user.email
  };
}
