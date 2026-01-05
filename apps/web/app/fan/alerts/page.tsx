"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useActiveEvent } from "../_components/useActiveEvent";

interface AlertItem {
  id: string;
  title: string;
  message: string;
  alert_type: string;
  severity: string;
}

export default function AlertsPage() {
  const { activeEventId } = useActiveEvent();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const query = supabase
        .from("alerts")
        .select("id, title, message, alert_type, severity")
        .order("created_at", { ascending: false });
      if (activeEventId) {
        query.eq("event_id", activeEventId);
      }
      const { data } = await query;
      setAlerts(data ?? []);
    };

    load();
  }, [activeEventId]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Safety Alerts
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Live announcements
        </h1>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="rounded-3xl border border-ice/15 bg-carbon/70 p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-ice">{alert.title}</p>
              <span className="text-xs uppercase tracking-[0.3em] text-redline">
                {alert.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-ice/60">{alert.message}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-ice/50">
              Type: {alert.alert_type}
            </p>
          </div>
        ))}
        {alerts.length === 0 && (
          <p className="text-sm text-ice/60">No active alerts.</p>
        )}
      </div>
    </div>
  );
}
