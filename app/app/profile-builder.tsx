"use client";

import { useState } from "react";
import type { Profile } from "../../lib/types";

export default function ProfileBuilder({ profiles }: { profiles: Profile[] }) {
  const primary = profiles[0];
  const [bio, setBio] = useState(primary?.bio ?? "");
  const [tone, setTone] = useState("clear");
  const [rewritten, setRewritten] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRewrite = async () => {
    setLoading(true);
    setRewritten(null);
    try {
      const response = await fetch("/api/ai/bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, tone })
      });
      const data = await response.json();
      setRewritten(data.bio ?? "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Profil builder</h3>
      <p>Állítsd be a bio‑t, és kérj AI rewrite‑ot kontextushoz igazítva.</p>
      <div className="form">
        <label className="label" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          className="textarea"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
        />
        <label className="label" htmlFor="tone">
          Hangnem
        </label>
        <select
          id="tone"
          className="select"
          value={tone}
          onChange={(event) => setTone(event.target.value)}
        >
          <option value="clear">Közvetlen</option>
          <option value="friendly">Barátságos</option>
          <option value="executive">Executive</option>
        </select>
        <button className="btn btn-primary" type="button" onClick={handleRewrite}>
          {loading ? "AI dolgozik..." : "AI rewrite"}
        </button>
        {rewritten && (
          <div className="notice">
            <strong>AI javaslat:</strong>
            <p style={{ margin: "8px 0 0" }}>{rewritten}</p>
          </div>
        )}
      </div>
    </div>
  );
}
