"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main className="shell">
      <nav className="nav">
        <div className="logo">
          <span className="logo-mark" />
          SignalCard
        </div>
        <Link className="btn btn-ghost" href="/">
          Vissza a landingre
        </Link>
      </nav>

      <section className="card" style={{ maxWidth: 520 }}>
        <h2>Magic link belépés</h2>
        <p>
          Küldünk egy egyszer használatos belépési linket. Az MVP-ben ezt a
          folyamatot Supabase Auth kezeli.
        </p>
        <form className="form" onSubmit={handleSubmit}>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            type="email"
            placeholder="te@ceged.hu"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit">
            Magic link küldése
          </button>
        </form>
        {sent && (
          <p className="notice" style={{ marginTop: 16 }}>
            Magic link elküldve. (Demo mód: a Supabase integráció beállítása után
            élőben fog működni.)
          </p>
        )}
      </section>
    </main>
  );
}
