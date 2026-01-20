"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useSupabaseUser } from "../_components/useSupabaseUser";

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Mexico" },
  { code: "fr", label: "French" },
  { code: "ar", label: "Arabic (Latin)" },
  { code: "de", label: "German" },
];

export default function LanguagePage() {
  const { user } = useSupabaseUser();
  const [language, setLanguage] = useState("en");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!supabase || !user) return;
      const { data } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.preferred_language) {
        setLanguage(data.preferred_language);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      setStatus("Sign in to update language.");
      return;
    }
    if (!supabase) return;
    const { error } = await supabase
      .from("profiles")
      .update({ preferred_language: language })
      .eq("id", user.id);
    setStatus(error ? error.message : "Language updated.");
  };

  const handleDetect = () => {
    const browserLang = navigator.language?.slice(0, 2) ?? "en";
    setLanguage(browserLang);
    setStatus("Detected browser language.");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Multi-language Support
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Choose your language
        </h1>
      </div>

      <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
        <select
          className="w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
          onChange={(event) => setLanguage(event.target.value)}
          value={language}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
        <button
          className="mt-4 w-full rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
          onClick={handleSave}
          type="button"
        >
          Save language
        </button>
        <button
          className="mt-3 w-full rounded-full border border-redline/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-redline"
          onClick={handleDetect}
          type="button"
        >
          Detect browser language
        </button>
        {status && <p className="mt-3 text-xs text-ice/60">{status}</p>}
      </div>
    </div>
  );
}
