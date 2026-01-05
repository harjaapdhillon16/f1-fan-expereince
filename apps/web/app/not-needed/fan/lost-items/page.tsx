"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useActiveEvent } from "../../../fan/_components/useActiveEvent";
import { useSupabaseUser } from "../../../fan/_components/useSupabaseUser";

interface LostItem {
  id: string;
  description: string;
  last_location: string | null;
  status: string;
}

export default function LostItemsPage() {
  const { user } = useSupabaseUser();
  const { activeEventId } = useActiveEvent();
  const [items, setItems] = useState<LostItem[]>([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!supabase || !user) return;
      const { data } = await supabase
        .from("lost_items")
        .select("id, description, last_location, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems(data ?? []);
    };

    load();
  }, [user]);

  const handleSubmit = async () => {
    if (!user) {
      setStatus("Sign in to report a lost item.");
      return;
    }
    if (!supabase) return;
    const { data, error } = await supabase
      .from("lost_items")
      .insert({
        user_id: user.id,
        event_id: activeEventId,
        description,
        last_location: location,
        contact_email: email,
      })
      .select("id, description, last_location, status")
      .single();

    if (error) {
      setStatus(error.message);
      return;
    }
    if (data) {
      setItems((prev) => [data, ...prev]);
      setDescription("");
      setLocation("");
      setStatus("Lost item submitted.");
    }
  };

  const handleStatus = async (id: string, nextStatus: string) => {
    if (!supabase) return;
    await supabase.from("lost_items").update({ status: nextStatus }).eq("id", id);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Lost Item Reporting
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Report and track items
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
          <input
            className="w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Item description"
            type="text"
            value={description}
          />
          <input
            className="mt-3 w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Last known location"
            type="text"
            value={location}
          />
          <input
            className="mt-3 w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Contact email"
            type="email"
            value={email}
          />
          <button
            className="mt-4 w-full rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
            onClick={handleSubmit}
            type="button"
          >
            Submit report
          </button>
          {status && <p className="mt-3 text-xs text-ice/60">{status}</p>}
        </div>

        <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
            Your reports
          </p>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-ice/10 bg-ink/70 p-4 text-sm text-ice/80"
              >
                <p className="text-ice">{item.description}</p>
                <p className="mt-1 text-xs text-ice/60">{item.last_location}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em]">
                  <span className="rounded-full border border-ice/20 px-3 py-1">
                    {item.status}
                  </span>
                  <button
                    className="rounded-full border border-ice/20 px-3 py-1"
                    onClick={() => handleStatus(item.id, "found")}
                    type="button"
                  >
                    Mark found
                  </button>
                  <button
                    className="rounded-full border border-ice/20 px-3 py-1"
                    onClick={() => handleStatus(item.id, "returned")}
                    type="button"
                  >
                    Mark returned
                  </button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-ice/60">No lost item reports yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
