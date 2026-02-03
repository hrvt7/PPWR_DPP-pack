import Link from "next/link";
import { seedCards, seedUserId } from "../../data/seed";
import { getAnalyticsForCard, listProfiles } from "../../lib/store";
import ProfileBuilder from "./profile-builder";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const card = seedCards[0];
  const analytics = await getAnalyticsForCard(card.id);
  const profiles = await listProfiles(seedUserId);

  return (
    <main className="shell">
      <nav className="nav">
        <div className="logo">
          <span className="logo-mark" />
          SignalCard Dashboard
        </div>
        <div className="cta-stack">
          <Link className="btn btn-ghost" href="/">
            Landing
          </Link>
          <Link className="btn btn-primary" href={`/r/${card.slug}`}>
            Megnyitás élőben
          </Link>
        </div>
      </nav>

      <section className="grid" style={{ gap: 24 }}>
        <div className="card">
          <h2>Analytics snapshot</h2>
          <div className="stat-grid" style={{ marginTop: 16 }}>
            <div className="stat">
              <strong>{analytics.views}</strong>
              Tap (views)
            </div>
            <div className="stat">
              <strong>{analytics.captures}</strong>
              Lead capture
            </div>
            <div className="stat">
              <strong>{analytics.conversionRate}%</strong>
              Konverzió
            </div>
          </div>
          <p style={{ marginTop: 16, color: "var(--muted)" }}>
            PostHog események + Supabase aggregáció. Egyedi események később
            bővíthetők.
          </p>
        </div>

        <div className="card">
          <h2>Profilok</h2>
          <div className="grid" style={{ gap: 12 }}>
            {profiles.map((profile) => (
              <div key={profile.id} className="link-item">
                <div>
                  <strong>{profile.type.toUpperCase()}</strong>
                  <div style={{ color: "var(--muted)" }}>
                    {profile.title} · {profile.role}
                  </div>
                </div>
                <Link className="btn btn-ghost" href={`/r/${card.slug}?profile=${profile.type}`}>
                  Preview
                </Link>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, color: "var(--muted)" }}>
            Kontextus alapján automatikusan választunk profilt, de itt manuálisan
            is tesztelheted.
          </p>
        </div>

        <ProfileBuilder profiles={profiles} />

        <div className="card">
          <h3>Integrációk</h3>
          <p>
            Zapier/Make webhook + Resend follow‑up fut, ha beállítod a környezeti
            változókat.
          </p>
          <ul className="form">
            <li>RESEND_API_KEY, RESEND_FROM</li>
            <li>ZAPIER_WEBHOOK_URL</li>
            <li>SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY</li>
            <li>OPENAI_API_KEY</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
