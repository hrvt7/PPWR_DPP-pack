import { headers } from "next/headers";
import { getCardWithProfiles, logTap } from "../../../lib/store";
import { resolveProfile } from "../../../lib/router";
import ProfileView from "./profile-view";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value ?? null;
}

export default async function ProfilePage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: SearchParams;
}) {
  const cardBundle = await getCardWithProfiles(params.slug);
  if (!cardBundle) {
    return (
      <main className="shell">
        <div className="card">
          <h2>Nincs ilyen kártya</h2>
          <p>Próbáld ki a demo linket: /r/demo</p>
        </div>
      </main>
    );
  }
  if (cardBundle.profiles.length === 0) {
    return (
      <main className="shell">
        <div className="card">
          <h2>Nincs profil beállítva</h2>
          <p>Adj hozzá legalább egy profilt a dashboardban.</p>
        </div>
      </main>
    );
  }

  const requestedType = getParam(searchParams, "profile");
  const event = getParam(searchParams, "event");
  const context = getParam(searchParams, "context");
  const source = getParam(searchParams, "source");
  const location = getParam(searchParams, "location");

  const profile = await resolveProfile({
    profiles: cardBundle.profiles,
    requestedType,
    event,
    context
  });

  const headerList = headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = headerList.get("user-agent");

  await logTap({
    cardId: cardBundle.card.id,
    profileId: profile.id,
    source,
    event,
    location,
    userAgent,
    ip
  });

  return (
    <main className="shell">
      <ProfileView
        cardLabel={cardBundle.card.label}
        profile={profile}
        context={{ source, event, location }}
      />
    </main>
  );
}
