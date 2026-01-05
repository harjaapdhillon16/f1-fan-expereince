"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useActiveEvent } from "../_components/useActiveEvent";

interface TransportUpdate {
  id: string;
  route_name: string;
  status: string;
  detail: string | null;
  severity: string | null;
}

export default function TransportUpdatesPage() {
  const { activeEventId } = useActiveEvent();
  const [updates, setUpdates] = useState<TransportUpdate[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const query = supabase
        .from("transport_updates")
        .select("id, route_name, status, detail, severity")
        .order("created_at", { ascending: false });
      if (activeEventId) {
        query.eq("event_id", activeEventId);
      }
      const { data } = await query;
      setUpdates(data ?? []);
    };

    load();
  }, [activeEventId]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Transport Updates
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Live transit status
        </h1>
      </div>

      <div className="grid gap-4">
        {updates.map((update) => (
          <div
            key={update.id}
            className="rounded-3xl border border-ice/15 bg-carbon/70 p-6"
          >
            <div className="flex items-center justify-between text-sm text-ice">
              <span>{update.route_name}</span>
              <span className="text-redline">{update.status}</span>
            </div>
            <p className="mt-2 text-sm text-ice/60">{update.detail}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-ice/40">
              Severity: {update.severity ?? "info"}
            </p>
          </div>
        ))}
        {updates.length === 0 && (
          <p className="text-sm text-ice/60">No transport updates yet.</p>
        )}
      </div>
    </div>
  );
}
