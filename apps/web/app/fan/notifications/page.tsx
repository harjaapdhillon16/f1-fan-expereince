"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useSupabaseUser } from "../_components/useSupabaseUser";

const topics = [
  { key: "safety", label: "Safety alerts" },
  { key: "weather", label: "Weather changes" },
  { key: "session", label: "Session reminders" },
  { key: "transport", label: "Transport updates" },
];

export default function NotificationsPage() {
  const { user } = useSupabaseUser();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadPrefs = async () => {
      if (!supabase || !user) return;
      const { data } = await supabase
        .from("notification_preferences")
        .select("topic, enabled")
        .eq("user_id", user.id)
        .eq("channel", "push");

      const next: Record<string, boolean> = {};
      (data ?? []).forEach((item) => {
        next[item.topic] = item.enabled;
      });
      setPrefs(next);
    };

    loadPrefs();
  }, [user]);

  const togglePreference = async (topic: string) => {
    if (!user) {
      setStatus("Sign in to manage notifications.");
      return;
    }
    if (!supabase) return;
    const enabled = !prefs[topic];
    setPrefs((prev) => ({ ...prev, [topic]: enabled }));

    const { error } = await supabase
      .from("notification_preferences")
      .upsert(
        {
          user_id: user.id,
          topic,
          channel: "push",
          enabled,
        },
        { onConflict: "user_id,topic,channel" }
      );

    if (error) setStatus(error.message);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Notifications
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Control alerts and reminders
        </h1>
      </div>

      <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
        <div className="space-y-3">
          {topics.map((topic) => (
            <label
              key={topic.key}
              className="flex items-center justify-between rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice/80"
            >
              <span>{topic.label}</span>
              <input
                checked={prefs[topic.key] ?? false}
                className="h-4 w-4 accent-redline"
                onChange={() => togglePreference(topic.key)}
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
