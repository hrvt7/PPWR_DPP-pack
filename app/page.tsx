import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell">
      <nav className="nav">
        <div className="logo">
          <span className="logo-mark" />
          SignalCard
        </div>
        <div className="cta-stack">
          <Link className="btn btn-ghost" href="/r/demo">
            Demo kártya
          </Link>
          <Link className="btn btn-primary" href="/login">
            Magic link belépés
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div>
          <span className="pill">AI‑enhanced NFC business card</span>
          <h1>Kontakt capture → kontextus → automata follow‑up.</h1>
          <p>
            SignalCard egyetlen NFC/QR érintéssel profilba rendez, leadet ment,
            és azonnal elindítja az e‑mail/CRM workflow‑t. Sales csapatoknak
            készült, akik nem akarnak leadeket elveszteni.
          </p>
          <div className="cta-stack">
            <Link className="btn btn-primary" href="/r/demo">
              Próbáld ki a demo profilt
            </Link>
            <Link className="btn btn-ghost" href="/app">
              Dashboard megnyitása
            </Link>
          </div>
        </div>
        <div className="card">
          <div className="badge">Live MVP</div>
          <h3>Mi történik egy tap után?</h3>
          <p>
            Kontextus alapján kiválasztott profil → GDPR opt‑in → automata
            follow‑up → CRM szinkron → konverzió tracking.
          </p>
          <div className="stat-grid" style={{ marginTop: 20 }}>
            <div className="stat">
              <strong>+38%</strong>
              follow‑up gyorsulás
            </div>
            <div className="stat">
              <strong>1‑katt</strong>
              CRM export
            </div>
            <div className="stat">
              <strong>4h</strong>
              átlagos válaszidő
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">Miben más</h2>
        <div className="grid grid-3">
          {[
            {
              title: "Contextual Profile Routing",
              text: "AI dönti el, melyik profil nyíljon meg az esemény, helyszín és előzmények alapján."
            },
            {
              title: "Automata Follow‑up",
              text: "A lead mentésekor azonnali e‑mail + Zapier/Make workflow indul, manuális munka nélkül."
            },
            {
              title: "CRM Deep Sync",
              text: "Lead scoring, smart tag és HubSpot/Google Contacts export egy kattintással."
            },
            {
              title: "Analytics + Conversion",
              text: "Mérd, melyik kártya hoz meetinget és mennyi a lead → opportunity konverzió."
            },
            {
              title: "Privacy‑first",
              text: "GDPR opt‑in, audit log, adatretenció — amit a B2B ügyfelek elvárnak."
            },
            {
              title: "Offline + Edge",
              text: "Ha nincs net: local capture, későbbi sync. Nem vész el a lead."
            }
          ].map((item) => (
            <div key={item.title} className="card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">MVP fókusz</h2>
        <div className="grid grid-3">
          {[
            "NFC/QR router + short link",
            "Kontakt capture + GDPR opt‑in",
            "Resend e‑mail follow‑up",
            "Zapier/Make CRM export",
            "AI bio rewrite + link prioritizer",
            "Views + captures + conversion dashboard"
          ].map((item) => (
            <div key={item} className="card">
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="footer">
        <div className="cta-stack">
          <Link className="btn btn-primary" href="/r/demo">
            Indítsd a demo tap‑ot
          </Link>
          <Link className="btn btn-ghost" href="/app">
            Nézd meg a dashboardot
          </Link>
        </div>
        <p style={{ marginTop: 16 }}>
          Készen állsz a pilotra? Írj és indítunk egy 2 hetes validációt.
        </p>
      </section>
    </main>
  );
}
