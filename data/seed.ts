import { Card, Profile } from "../lib/types";

export const seedUserId = "user_demo";

export const seedProfiles: Profile[] = [
  {
    id: "profile_sales",
    userId: seedUserId,
    type: "sales",
    title: "Tamara Kovács",
    bio: "B2B growth partner. Segítek sales csapatoknak gyorsabban konvertálni, kevesebb adminnal.",
    company: "SignalCard",
    role: "Head of Sales",
    location: "Budapest",
    links: [
      { label: "Foglalj 15 percet", url: "https://cal.com/signalcard", priority: 1 },
      { label: "Case study", url: "https://signalcard.ai/case", priority: 2 },
      { label: "LinkedIn", url: "https://linkedin.com", priority: 3 }
    ],
    ctas: ["Nézzük meg, működik‑e nálatok", "Kérj pilot access-t"],
    isDefault: true
  },
  {
    id: "profile_tech",
    userId: seedUserId,
    type: "tech",
    title: "Tamara Kovács",
    bio: "Tech partner sales & marketing csapatoknak. API-first CRM sync, privacy by design.",
    company: "SignalCard",
    role: "Technical Lead",
    location: "Budapest",
    links: [
      { label: "API dokumentáció", url: "https://signalcard.ai/docs", priority: 1 },
      { label: "GitHub", url: "https://github.com", priority: 2 },
      { label: "Status", url: "https://status.signalcard.ai", priority: 3 }
    ],
    ctas: ["Kérj technikai demót", "Kapcsoljuk be a webhookot"],
    isDefault: false
  },
  {
    id: "profile_investor",
    userId: seedUserId,
    type: "investor",
    title: "Tamara Kovács",
    bio: "Building the contact intelligence layer for B2B revenue teams.",
    company: "SignalCard",
    role: "Co-founder",
    location: "Budapest",
    links: [
      { label: "Investor deck", url: "https://signalcard.ai/deck", priority: 1 },
      { label: "Traction", url: "https://signalcard.ai/traction", priority: 2 },
      { label: "LinkedIn", url: "https://linkedin.com", priority: 3 }
    ],
    ctas: ["Request an investor update", "Schedule a quick intro"],
    isDefault: false
  }
];

export const seedCards: Card[] = [
  {
    id: "card_demo",
    userId: seedUserId,
    slug: "demo",
    label: "Demo NFC Card"
  }
];
