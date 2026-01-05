"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useSupabaseUser } from "../../../fan/_components/useSupabaseUser";

interface AccessibilityPrefs {
  highContrast: boolean;
  textToSpeech: boolean;
  largeText: boolean;
}

const defaultPrefs: AccessibilityPrefs = {
  highContrast: false,
  textToSpeech: false,
  largeText: false,
};

export default function AccessibilityPage() {
  const { user } = useSupabaseUser();
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(defaultPrefs);
  const [status, setStatus] = useState("");
  const [speechStatus, setSpeechStatus] = useState("Text-to-speech ready");

  useEffect(() => {
    const load = async () => {
      if (!supabase || !user) return;
      const { data } = await supabase
        .from("profiles")
        .select("accessibility")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.accessibility) {
        setPrefs({ ...defaultPrefs, ...data.accessibility });
      }
    };

    load();
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    if (prefs.highContrast) {
      root.dataset.contrast = "high";
    } else {
      delete root.dataset.contrast;
    }
  }, [prefs.highContrast]);

  const handleToggle = (key: keyof AccessibilityPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!user) {
      setStatus("Sign in to save accessibility settings.");
      return;
    }
    if (!supabase) return;
    const { error } = await supabase
      .from("profiles")
      .update({ accessibility: prefs })
      .eq("id", user.id);
    setStatus(error ? error.message : "Accessibility settings saved.");
  };

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      setSpeechStatus("Text-to-speech not supported.");
      return;
    }
    const message = new SpeechSynthesisUtterance(
      "Safety update: Stay hydrated and follow steward instructions."
    );
    window.speechSynthesis.speak(message);
    setSpeechStatus("Playing audio update");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Accessibility
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Make the app your own
        </h1>
      </div>

      <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
        <div className="space-y-3">
          {([
            { key: "highContrast", label: "High contrast mode" },
            { key: "textToSpeech", label: "Text to speech" },
            { key: "largeText", label: "Large text" },
          ] as const).map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice/80"
            >
              <span>{item.label}</span>
              <input
                checked={prefs[item.key]}
                className="h-4 w-4 accent-redline"
                onChange={() => handleToggle(item.key)}
                type="checkbox"
              />
            </label>
          ))}
        </div>
        <button
          className="mt-4 w-full rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
          onClick={handleSave}
          type="button"
        >
          Save preferences
        </button>
        <button
          className="mt-3 w-full rounded-full border border-redline/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-redline"
          onClick={handleSpeak}
          type="button"
        >
          Play audio update
        </button>
        {status && <p className="mt-3 text-xs text-ice/60">{status}</p>}
        <p className="mt-2 text-xs text-ice/60">{speechStatus}</p>
      </div>
    </div>
  );
}
