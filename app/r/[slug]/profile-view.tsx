"use client";

import { useEffect, useMemo, useState } from "react";
import type { Profile } from "../../../lib/types";

const PENDING_KEY = "signalcard.pending";

type Context = {
  source?: string | null;
  event?: string | null;
  location?: string | null;
};

type PendingCapture = {
  profileId: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  notes?: string;
  consent: boolean;
  context: Context;
};

function loadPending(): PendingCapture[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(PENDING_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PendingCapture[];
  } catch {
    return [];
  }
}

function savePending(items: PendingCapture[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_KEY, JSON.stringify(items));
}

async function flushPending() {
  const pending = loadPending();
  if (!pending.length) return;
  const remaining: PendingCapture[] = [];

  for (const item of pending) {
    try {
      const response = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      if (!response.ok) throw new Error("Failed");
    } catch {
      remaining.push(item);
    }
  }

  savePending(remaining);
}

export default function ProfileView({
  cardLabel,
  profile,
  context
}: {
  cardLabel: string;
  profile: Profile;
  context: Context;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "offline" | "error">(
    "idle"
  );

  const sortedLinks = useMemo(
    () => [...profile.links].sort((a, b) => a.priority - b.priority),
    [profile.links]
  );

  useEffect(() => {
    flushPending();
    const handler = () => flushPending();
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!consent) {
      setStatus("error");
      return;
    }

    const payload: PendingCapture = {
      profileId: profile.id,
      name,
      email,
      company,
      role,
      notes,
      consent,
      context
    };

    if (!navigator.onLine) {
      const pending = loadPending();
      pending.push(payload);
      savePending(pending);
      setStatus("offline");
      return;
    }

    try {
      const response = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed");
      setStatus("sent");
      setName("");
      setEmail("");
      setCompany("");
      setRole("");
      setNotes("");
      setConsent(false);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="grid" style={{ gap: 28 }}>
      <section className="card profile-card">
        <span className="badge">{cardLabel}</span>
        <h2>{profile.title}</h2>
        <p>
          {profile.role} · {profile.company} · {profile.location}
        </p>
        <p>{profile.bio}</p>
        <div className="cta-stack">
          {profile.ctas.map((cta) => (
            <span key={cta} className="pill">
              {cta}
            </span>
          ))}
        </div>
        <div className="link-list">
          {sortedLinks.map((link) => (
            <a key={link.url} className="link-item" href={link.url}>
              <span>{link.label}</span>
              <span>↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Kapcsolatfelvétel</h3>
        <p>
          Hagyd itt a kontaktot, és azonnal küldünk follow‑upot + CRM exportot.
        </p>
        <form className="form" onSubmit={handleSubmit}>
          <label className="label" htmlFor="name">
            Név
          </label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label className="label" htmlFor="company">
            Cég
          </label>
          <input
            id="company"
            className="input"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />

          <label className="label" htmlFor="role">
            Pozíció
          </label>
          <input
            id="role"
            className="input"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          />

          <label className="label" htmlFor="notes">
            Miben segíthetek?
          </label>
          <textarea
            id="notes"
            className="textarea"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />

          <label className="label">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              style={{ marginRight: 8 }}
            />
            Elfogadom, hogy a kontakt adataimat follow‑up célra használjátok.
          </label>

          <button className="btn btn-primary" type="submit">
            Küldés
          </button>
        </form>

        {status === "sent" && (
          <p className="notice" style={{ marginTop: 16 }}>
            Köszi! Az email follow‑up elindult, és a leadet szinkronizáljuk a CRM‑be.
          </p>
        )}
        {status === "offline" && (
          <p className="notice" style={{ marginTop: 16 }}>
            Offline mód: a leadet elmentettük, és a kapcsolat visszatértekor szinkronizáljuk.
          </p>
        )}
        {status === "error" && (
          <p className="notice" style={{ marginTop: 16 }}>
            A mentés nem sikerült. Ellenőrizd az opt‑int és a netkapcsolatot.
          </p>
        )}
      </section>
    </div>
  );
}
