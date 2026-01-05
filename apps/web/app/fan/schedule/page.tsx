"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useActiveEvent } from "../_components/useActiveEvent";
import { useSupabaseUser } from "../_components/useSupabaseUser";

interface SessionRecord {
  id: string;
  name: string;
  session_type: string;
  start_at: string | null;
  end_at: string | null;
}

export default function SchedulePage() {
  const { user } = useSupabaseUser();
  const { activeEventId } = useActiveEvent();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const sessionQuery = supabase
        .from("sessions")
        .select("id, name, session_type, start_at, end_at")
        .order("start_at", { ascending: true });

      if (activeEventId) {
        sessionQuery.eq("event_id", activeEventId);
      }

      const { data: sessionData } = await sessionQuery;
      setSessions(sessionData ?? []);
    };

    load();
  }, [activeEventId]);

  useEffect(() => {
    const loadSchedule = async () => {
      if (!supabase || !user) return;
      const { data } = await supabase
        .from("user_schedules")
        .select("session_id")
        .eq("user_id", user.id);
      setSelected((data ?? []).map((item) => item.session_id));
    };

    loadSchedule();
  }, [user]);

  const selectedLabel = useMemo(() => {
    return sessions
      .filter((session) => selected.includes(session.id))
      .map((session) => session.name)
      .join(", ");
  }, [selected, sessions]);

  const toggleSession = async (sessionId: string) => {
    if (!user) {
      setStatus("Sign in to save your schedule.");
      return;
    }
    if (!supabase) return;

    if (selected.includes(sessionId)) {
      const { error } = await supabase
        .from("user_schedules")
        .delete()
        .eq("user_id", user.id)
        .eq("session_id", sessionId);
      if (!error) {
        setSelected((prev) => prev.filter((id) => id !== sessionId));
      }
    } else {
      const { error } = await supabase
        .from("user_schedules")
        .insert({ user_id: user.id, session_id: sessionId });
      if (!error) {
        setSelected((prev) => [...prev, sessionId]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Schedule Builder
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Personalize your sessions
        </h1>
      </div>

      <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
        <div className="space-y-3">
          {sessions.map((session) => (
            <label
              key={session.id}
              className="flex items-center justify-between rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice/80"
            >
              <span>
                {session.start_at
                  ? new Date(session.start_at).toLocaleString()
                  : "TBD"}{" "}
                - {session.name}
              </span>
              <input
                checked={selected.includes(session.id)}
                className="h-4 w-4 accent-redline"
                onChange={() => toggleSession(session.id)}
                type="checkbox"
              />
            </label>
          ))}
        </div>
        <p className="mt-4 text-xs text-ice/60">
          Selected: {selectedLabel || "No sessions selected"}
        </p>
        {status && <p className="mt-2 text-xs text-ice/60">{status}</p>}
      </div>
    </div>
  );
}
