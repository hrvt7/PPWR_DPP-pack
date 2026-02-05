export type ProfileType = "sales" | "tech" | "investor";

export type LinkItem = {
  label: string;
  url: string;
  priority: number;
};

export type Profile = {
  id: string;
  userId: string;
  type: ProfileType;
  title: string;
  bio: string;
  company: string;
  role: string;
  location: string;
  countryCode?: string;
  links: LinkItem[];
  ctas: string[];
  isDefault: boolean;
};

export type Card = {
  id: string;
  userId: string;
  slug: string;
  label: string;
};

export type Tap = {
  id: string;
  cardId: string;
  profileId: string;
  source?: string | null;
  event?: string | null;
  location?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: string;
};

export type Lead = {
  id: string;
  profileId: string;
  name: string;
  email: string;
  company?: string | null;
  role?: string | null;
  notes?: string | null;
  createdAt: string;
};

export type Consent = {
  id: string;
  leadId: string;
  scope: string;
  text: string;
  ip?: string | null;
  createdAt: string;
};

export type Followup = {
  id: string;
  leadId: string;
  status: "queued" | "sent" | "failed";
  channel: "email" | "webhook";
  payload: Record<string, unknown>;
  createdAt: string;
};

export type Analytics = {
  views: number;
  captures: number;
  conversionRate: number;
};
