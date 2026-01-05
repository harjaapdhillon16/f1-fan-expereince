"use client";

import { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useSupabaseUser } from "../../../fan/_components/useSupabaseUser";

export default function PwaPage() {
  const { user } = useSupabaseUser();
  const [status, setStatus] = useState("");

  const handleRecordInstall = async () => {
    if (!user) {
      setStatus("Sign in to log your install.");
      return;
    }
    if (!supabase) return;

    await supabase.from("pwa_installs").insert({
      user_id: user.id,
      platform: navigator.platform,
      metadata: { userAgent: navigator.userAgent },
    });
    setStatus("Install recorded.");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          PWA Install
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Add to home screen
        </h1>
      </div>

      <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6 space-y-4">
        <p className="text-sm text-ice/70">
          Install the app for offline-friendly access and instant push alerts.
        </p>
        <ol className="space-y-2 text-sm text-ice/60">
          <li>1. Open the browser menu.</li>
          <li>2. Tap "Add to Home Screen".</li>
          <li>3. Confirm to install the F1 Fan Assistant.</li>
        </ol>
        <button
          className="w-full rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
          onClick={handleRecordInstall}
          type="button"
        >
          Record install
        </button>
        {status && <p className="text-xs text-ice/60">{status}</p>}
      </div>
    </div>
  );
}
