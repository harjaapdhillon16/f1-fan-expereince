"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

interface Integration {
  id: string;
  provider: string;
  status: string;
  last_sync_at: string | null;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from("integration_connections")
        .select("id, provider, status, last_sync_at")
        .order("created_at", { ascending: false });
      setIntegrations(data ?? []);
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          API Integrations
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Connected services
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="rounded-3xl border border-ice/15 bg-carbon/70 p-6"
          >
            <p className="text-lg font-semibold text-ice">
              {integration.provider}
            </p>
            <p className="mt-2 text-sm text-ice/60">
              Status: {integration.status}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-ice/40">
              Last sync: {integration.last_sync_at ?? "n/a"}
            </p>
          </div>
        ))}
        {integrations.length === 0 && (
          <p className="text-sm text-ice/60">No integrations configured.</p>
        )}
      </div>
    </div>
  );
}
