"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useActiveEvent } from "../../../fan/_components/useActiveEvent";
import { useSupabaseUser } from "../../../fan/_components/useSupabaseUser";

interface Highlight {
  id: string;
  title: string;
  summary: string | null;
  media_url: string | null;
}

export default function HighlightsPage() {
  const { user } = useSupabaseUser();
  const { activeEventId } = useActiveEvent();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const query = supabase
        .from("race_highlights")
        .select("id, title, summary, media_url")
        .order("created_at", { ascending: false });
      if (activeEventId) {
        query.eq("event_id", activeEventId);
      }
      const { data } = await query;
      setHighlights(data ?? []);
    };

    load();
  }, [activeEventId]);

  const handleView = async (highlightId: string) => {
    if (!user) {
      setStatus("Sign in to track highlight views.");
      return;
    }
    if (!supabase) return;
    await supabase.from("engagement_events").insert({
      event_id: activeEventId,
      user_id: user.id,
      event_type: "highlight_view",
      metadata: { highlight_id: highlightId },
    });
    setStatus("View logged.");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Race Highlights
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Relive the best moments
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {highlights.map((highlight) => (
          <div
            key={highlight.id}
            className="rounded-3xl border border-ice/15 bg-carbon/70 p-6"
          >
            <p className="text-lg font-semibold text-ice">{highlight.title}</p>
            <p className="mt-2 text-sm text-ice/60">{highlight.summary}</p>
            {highlight.media_url && (
              <a
                className="mt-3 inline-block text-xs uppercase tracking-[0.3em] text-redline"
                href={highlight.media_url}
              >
                Watch clip
              </a>
            )}
            <button
              className="mt-4 w-full rounded-full border border-redline/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-redline"
              onClick={() => handleView(highlight.id)}
              type="button"
            >
              Mark as viewed
            </button>
          </div>
        ))}
        {highlights.length === 0 && (
          <p className="text-sm text-ice/60">No highlights posted yet.</p>
        )}
      </div>
      {status && <p className="text-xs text-ice/60">{status}</p>}
    </div>
  );
}
