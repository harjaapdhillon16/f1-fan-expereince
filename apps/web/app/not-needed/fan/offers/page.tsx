"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useActiveEvent } from "../../../fan/_components/useActiveEvent";
import { useSupabaseUser } from "../../../fan/_components/useSupabaseUser";

interface Campaign {
  id: string;
  sponsor_id: string | null;
  title: string;
  cta_text: string | null;
}

interface Sponsor {
  id: string;
  name: string;
}

export default function OffersPage() {
  const { user } = useSupabaseUser();
  const { activeEventId } = useActiveEvent();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sponsors, setSponsors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const query = supabase
        .from("sponsor_campaigns")
        .select("id, sponsor_id, title, cta_text")
        .eq("status", "live");
      if (activeEventId) {
        query.eq("event_id", activeEventId);
      }
      const { data: campaignData } = await query;
      setCampaigns(campaignData ?? []);

      const { data: sponsorData } = await supabase
        .from("sponsors")
        .select("id, name");
      const next: Record<string, string> = {};
      (sponsorData ?? []).forEach((sponsor) => {
        next[sponsor.id] = sponsor.name;
      });
      setSponsors(next);
    };

    load();
  }, [activeEventId]);

  const handleRedeem = async (campaignId: string) => {
    if (!user) {
      setStatus("Sign in to redeem an offer.");
      return;
    }
    if (!supabase) return;
    await supabase.from("sponsor_interactions").insert({
      campaign_id: campaignId,
      user_id: user.id,
      action: "redeem",
    });
    setStatus("Offer redeemed.");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Sponsor Offers
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Post-race rewards
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="rounded-3xl border border-ice/15 bg-carbon/70 p-6"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
              {campaign.sponsor_id
                ? sponsors[campaign.sponsor_id] ?? "Sponsor"
                : "Sponsor"}
            </p>
            <p className="mt-3 text-lg font-semibold text-ice">
              {campaign.title}
            </p>
            <button
              className="mt-4 rounded-full border border-redline/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-redline"
              onClick={() => handleRedeem(campaign.id)}
              type="button"
            >
              {campaign.cta_text ?? "Redeem"}
            </button>
          </div>
        ))}
        {campaigns.length === 0 && (
          <p className="text-sm text-ice/60">No offers available.</p>
        )}
      </div>
      {status && <p className="text-xs text-ice/60">{status}</p>}
    </div>
  );
}
