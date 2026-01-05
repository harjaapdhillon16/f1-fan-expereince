"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

interface Interaction {
  id: string;
  campaign_id: string;
  action: string;
  created_at: string;
}

export default function SponsorPerformancePage() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [action, setAction] = useState("click");
  const [status, setStatus] = useState("");

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("sponsor_interactions")
      .select("id, campaign_id, action, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    setInteractions(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleLog = async () => {
    if (!supabase) return;
    const { error } = await supabase.from("sponsor_interactions").insert({
      campaign_id: campaignId,
      action,
    });
    setStatus(error ? error.message : "Interaction logged.");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="admin-kicker">
          Sponsor Performance
        </p>
        <h1 className="mt-3 admin-title">
          Track campaign engagement
        </h1>
      </div>

      <div className="admin-card p-6">
        <input
          className="admin-input"
          onChange={(event) => setCampaignId(event.target.value)}
          placeholder="Campaign ID"
          type="text"
          value={campaignId}
        />
        <select
          className="mt-3 admin-select"
          onChange={(event) => setAction(event.target.value)}
          value={action}
        >
          <option value="click">Click</option>
          <option value="redeem">Redeem</option>
          <option value="share">Share</option>
        </select>
        <button
          className="mt-4 w-full admin-button-primary"
          onClick={handleLog}
          type="button"
        >
          Log interaction
        </button>
        {status && <p className="mt-3 text-xs text-opsfog/60">{status}</p>}
      </div>

      <div className="admin-card p-6">
        <p className="admin-kicker-muted">
          Recent Interactions
        </p>
        <div className="mt-4 space-y-3">
          {interactions.map((item) => (
            <div
              key={item.id}
              className="admin-card-inset p-4 text-sm text-opsfog"
            >
              <p>Campaign: {item.campaign_id}</p>
              <p className="mt-2 text-xs text-opsfog/60">
                {item.action} - {item.created_at}
              </p>
            </div>
          ))}
          {interactions.length === 0 && (
            <p className="text-sm text-opsfog/60">No interactions logged.</p>
          )}
        </div>
      </div>
    </div>
  );
}
