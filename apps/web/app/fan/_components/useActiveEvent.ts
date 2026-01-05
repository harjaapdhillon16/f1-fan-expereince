"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useSupabaseUser } from "./useSupabaseUser";

interface EventRecord {
  id: string;
  name: string;
  start_at: string | null;
}

export function useActiveEvent() {
  const { user } = useSupabaseUser();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from("events")
        .select("id, name, start_at")
        .order("start_at", { ascending: true })
        .limit(20);
      setEvents(data ?? []);
    };

    load();
  }, []);

  useEffect(() => {
    const loadFavorite = async () => {
      if (!supabase || !user) return;
      const { data } = await supabase
        .from("profiles")
        .select("favorite_event_id")
        .eq("id", user.id)
        .maybeSingle();

      if (data?.favorite_event_id) {
        setActiveEventId(data.favorite_event_id);
      }
    };

    loadFavorite();
  }, [user]);

  useEffect(() => {
    if (!activeEventId && events.length > 0) {
      setActiveEventId(events[0]?.id ?? null);
    }
  }, [events, activeEventId]);

  return { events, activeEventId, setActiveEventId };
}
