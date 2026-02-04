import type { Profile, ProfileType } from "./types";
import { suggestProfileType } from "./ai";

const validTypes: ProfileType[] = ["sales", "tech", "investor"];

export async function resolveProfileType(params: {
  requestedType?: string | null;
  event?: string | null;
  context?: string | null;
}) {
  const { requestedType, event, context } = params;
  if (requestedType && validTypes.includes(requestedType as ProfileType)) {
    return requestedType as ProfileType;
  }
  if (event) {
    const normalized = event.toLowerCase();
    if (normalized.includes("tech")) return "tech";
    if (normalized.includes("invest")) return "investor";
  }
  if (context) {
    return suggestProfileType(context);
  }
  return "sales";
}

export async function resolveProfile(params: {
  profiles: Profile[];
  requestedType?: string | null;
  event?: string | null;
  context?: string | null;
}) {
  const { profiles } = params;
  const type = await resolveProfileType(params);
  const direct = profiles.find((profile) => profile.type === type);
  if (direct) return direct;
  const fallback = profiles.find((profile) => profile.isDefault);
  return fallback ?? profiles[0];
}
