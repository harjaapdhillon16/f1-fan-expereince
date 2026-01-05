"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useActiveEvent } from "../_components/useActiveEvent";
import { useSupabaseUser } from "../_components/useSupabaseUser";

function formatCountdown(target: Date | null) {
  if (!target) return "No event selected";
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "Event is live";
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default function CountdownPage() {
  const { user } = useSupabaseUser();
  const { events, activeEventId, setActiveEventId } = useActiveEvent();
  const [countdown, setCountdown] = useState("Calculating...");
  const [status, setStatus] = useState("");

  const activeEvent = useMemo(
    () => events.find((event) => event.id === activeEventId) ?? null,
    [events, activeEventId]
  );

  useEffect(() => {
    const tick = () => {
      const date = activeEvent?.start_at ? new Date(activeEvent.start_at) : null;
      setCountdown(formatCountdown(date));
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [activeEvent]);

  const handleSaveFavorite = async () => {
    if (!user) {
      setStatus("Sign in to save your favorite event.");
      return;
    }
    if (!supabase || !activeEventId) return;
    const { error } = await supabase
      .from("profiles")
      .update({ favorite_event_id: activeEventId })
      .eq("id", user.id);

    setStatus(error ? error.message : "Favorite event saved.");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Event Countdown
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Next session start
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
            Countdown
          </p>
          <p className="mt-4 text-4xl font-semibold text-ice">{countdown}</p>
          <p className="mt-2 text-sm text-ice/60">
            {activeEvent?.name ?? "Select an event to start"}
          </p>
          <button
            className="mt-4 rounded-full border border-redline/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-redline"
            onClick={handleSaveFavorite}
            type="button"
          >
            Save as favorite
          </button>
          {status && <p className="mt-3 text-xs text-ice/60">{status}</p>}
        </div>

        <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
            Select Event
          </p>
          <div className="mt-4 space-y-3">
            {events.length === 0 && (
              <p className="text-sm text-ice/60">No events found.</p>
            )}
            {events.map((event) => (
              <button
                key={event.id}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  activeEventId === event.id
                    ? "border-redline/60 bg-redline/10 text-ice"
                    : "border-ice/10 bg-ink/70 text-ice/70"
                }`}
                onClick={() => setActiveEventId(event.id)}
                type="button"
              >
                <div className="flex items-center justify-between">
                  <span>{event.name}</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-ice/50">
                    {event.start_at
                      ? new Date(event.start_at).toLocaleString()
                      : "TBD"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
