"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useSupabaseUser } from "../../../fan/_components/useSupabaseUser";

const consentTypes = [
  { key: "analytics", label: "Usage analytics" },
  { key: "marketing", label: "Sponsor marketing" },
  { key: "location", label: "Location services" },
  { key: "notifications", label: "Notifications" },
];

export default function GdprPage() {
  const { user } = useSupabaseUser();
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!supabase || !user) return;
      const { data } = await supabase
        .from("consents")
        .select("consent_type, accepted")
        .eq("user_id", user.id);

      const next: Record<string, boolean> = {};
      (data ?? []).forEach((item) => {
        next[item.consent_type] = item.accepted;
      });
      setConsents(next);
    };

    load();
  }, [user]);

  const toggleConsent = async (key: string) => {
    if (!user) {
      setStatus("Sign in to manage consents.");
      return;
    }
    if (!supabase) return;

    const accepted = !consents[key];
    setConsents((prev) => ({ ...prev, [key]: accepted }));

    const { error } = await supabase
      .from("consents")
      .upsert(
        {
          user_id: user.id,
          consent_type: key,
          accepted,
          accepted_at: accepted ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,consent_type" }
      );

    if (error) setStatus(error.message);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          GDPR Controls
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Manage data consent
        </h1>
      </div>

      <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
        <div className="space-y-3">
          {consentTypes.map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice/80"
            >
              <span>{item.label}</span>
              <input
                checked={consents[item.key] ?? false}
                className="h-4 w-4 accent-redline"
                onChange={() => toggleConsent(item.key)}
                type="checkbox"
              />
            </label>
          ))}
        </div>
        {status && <p className="mt-3 text-xs text-ice/60">{status}</p>}
      </div>
    </div>
  );
}
