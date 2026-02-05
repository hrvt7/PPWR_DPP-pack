import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { getSupabaseServerClient } from "./supabase";
import type {
  Analytics,
  Card,
  Consent,
  Followup,
  Lead,
  Profile,
  ProfileType,
  Tap
} from "./types";
import { seedCards, seedProfiles } from "../data/seed";

const storePath = path.join(process.cwd(), "data", "dev-store.json");

type DevStore = {
  cards: Card[];
  profiles: Profile[];
  taps: Tap[];
  leads: Lead[];
  consents: Consent[];
  followups: Followup[];
};

let memoryStore: DevStore | null = null;

function createSeedStore(): DevStore {
  return {
    cards: seedCards,
    profiles: seedProfiles,
    taps: [],
    leads: [],
    consents: [],
    followups: []
  };
}

function readStore(): DevStore {
  if (memoryStore) return memoryStore;
  try {
    const raw = fs.readFileSync(storePath, "utf8");
    memoryStore = JSON.parse(raw) as DevStore;
    return memoryStore;
  } catch {
    memoryStore = createSeedStore();
    return memoryStore;
  }
}

function writeStore(store: DevStore) {
  memoryStore = store;
  try {
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
  } catch {
    // On read-only deployments we silently fall back to memory.
  }
}

function mapProfile(row: Record<string, any>): Profile {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    type: row.type,
    title: row.title,
    bio: row.bio,
    company: row.company,
    role: row.role,
    location: row.location,
    countryCode: row.country_code ?? row.countryCode ?? undefined,
    links: row.links ?? [],
    ctas: row.ctas ?? [],
    isDefault: row.is_default ?? row.isDefault ?? false
  };
}

function mapCard(row: Record<string, any>): Card {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    slug: row.slug,
    label: row.label
  };
}

export async function getCardWithProfiles(slug: string) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data: cardRow } = await supabase
      .from("cards")
      .select("*")
      .eq("slug", slug)
      .single();
    if (!cardRow) return null;
    const card = mapCard(cardRow);
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", card.userId);
    return {
      card,
      profiles: (profileRows ?? []).map(mapProfile)
    };
  }

  const store = readStore();
  const card = store.cards.find((item) => item.slug === slug);
  if (!card) return null;
  const profiles = store.profiles.filter((item) => item.userId === card.userId);
  return { card, profiles };
}

export async function getProfileByType(userId: string, type: ProfileType) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .eq("type", type)
      .single();
    return data ? mapProfile(data) : null;
  }
  const store = readStore();
  return store.profiles.find(
    (item) => item.userId === userId && item.type === type
  );
}

export async function getDefaultProfile(userId: string) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .eq("is_default", true)
      .single();
    return data ? mapProfile(data) : null;
  }
  const store = readStore();
  return (
    store.profiles.find((item) => item.userId === userId && item.isDefault) ??
    store.profiles.find((item) => item.userId === userId)
  );
}

export async function logTap(payload: Omit<Tap, "id" | "createdAt">) {
  const supabase = getSupabaseServerClient();
  const tap: Tap = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...payload
  };
  if (supabase) {
    await supabase.from("taps").insert({
      id: tap.id,
      card_id: tap.cardId,
      profile_id: tap.profileId,
      source: tap.source,
      event: tap.event,
      location: tap.location,
      user_agent: tap.userAgent,
      ip: tap.ip,
      created_at: tap.createdAt
    });
    return tap;
  }
  const store = readStore();
  store.taps.push(tap);
  writeStore(store);
  return tap;
}

export async function createLead(payload: Omit<Lead, "id" | "createdAt">) {
  const supabase = getSupabaseServerClient();
  const lead: Lead = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...payload
  };
  if (supabase) {
    await supabase.from("leads").insert({
      id: lead.id,
      profile_id: lead.profileId,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      role: lead.role,
      notes: lead.notes,
      created_at: lead.createdAt
    });
    return lead;
  }
  const store = readStore();
  store.leads.push(lead);
  writeStore(store);
  return lead;
}

export async function createConsent(payload: Omit<Consent, "id" | "createdAt">) {
  const supabase = getSupabaseServerClient();
  const consent: Consent = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...payload
  };
  if (supabase) {
    await supabase.from("consents").insert({
      id: consent.id,
      lead_id: consent.leadId,
      scope: consent.scope,
      text: consent.text,
      ip: consent.ip,
      created_at: consent.createdAt
    });
    return consent;
  }
  const store = readStore();
  store.consents.push(consent);
  writeStore(store);
  return consent;
}

export async function createFollowup(
  payload: Omit<Followup, "id" | "createdAt">
) {
  const supabase = getSupabaseServerClient();
  const followup: Followup = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...payload
  };
  if (supabase) {
    await supabase.from("followups").insert({
      id: followup.id,
      lead_id: followup.leadId,
      status: followup.status,
      channel: followup.channel,
      payload: followup.payload,
      created_at: followup.createdAt
    });
    return followup;
  }
  const store = readStore();
  store.followups.push(followup);
  writeStore(store);
  return followup;
}

export async function getAnalyticsForCard(cardId: string): Promise<Analytics> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data: cardRow } = await supabase
      .from("cards")
      .select("user_id")
      .eq("id", cardId)
      .single();
    const userId = cardRow?.user_id;
    const { data: profileRows } = userId
      ? await supabase.from("profiles").select("id").eq("user_id", userId)
      : { data: [] };
    const profileIds = (profileRows ?? []).map((row: any) => row.id);
    const { count: tapsCount } = await supabase
      .from("taps")
      .select("id", { count: "exact", head: true })
      .eq("card_id", cardId);
    const { count: leadsCount } = profileIds.length
      ? await supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .in("profile_id", profileIds)
      : { count: 0 };
    const views = tapsCount ?? 0;
    const captures = leadsCount ?? 0;
    return {
      views,
      captures,
      conversionRate: views > 0 ? Number(((captures / views) * 100).toFixed(1)) : 0
    };
  }

  const store = readStore();
  const card = store.cards.find((item) => item.id === cardId);
  const profileIds = store.profiles
    .filter((profile) => profile.userId === card?.userId)
    .map((profile) => profile.id);
  const views = store.taps.filter((tap) => tap.cardId === cardId).length;
  const captures = store.leads.filter((lead) => profileIds.includes(lead.profileId))
    .length;
  return {
    views,
    captures,
    conversionRate: views > 0 ? Number(((captures / views) * 100).toFixed(1)) : 0
  };
}

export async function listProfiles(userId: string) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId);
    return (data ?? []).map(mapProfile);
  }
  const store = readStore();
  return store.profiles.filter((profile) => profile.userId === userId);
}

export async function getProfileById(profileId: string) {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single();
    return data ? mapProfile(data) : null;
  }
  const store = readStore();
  return store.profiles.find((profile) => profile.id === profileId) ?? null;
}
