"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useActiveEvent } from "../_components/useActiveEvent";
import { useSupabaseUser } from "../_components/useSupabaseUser";

interface TransportRoute {
  id: string;
  mode: string;
  zone: string | null;
  instructions: string | null;
}

interface TransportPlan {
  id: string;
  mode: string;
  zone: string | null;
  notes: string | null;
}

export default function TransportPlannerPage() {
  const { user } = useSupabaseUser();
  const { activeEventId } = useActiveEvent();
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [plans, setPlans] = useState<TransportPlan[]>([]);
  const [mode, setMode] = useState("shuttle");
  const [zone, setZone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadRoutes = async () => {
      if (!supabase) return;
      const query = supabase
        .from("transport_routes")
        .select("id, mode, zone, instructions")
        .eq("is_active", true);
      if (activeEventId) {
        query.eq("event_id", activeEventId);
      }
      const { data } = await query;
      setRoutes(data ?? []);
    };

    loadRoutes();
  }, [activeEventId]);

  useEffect(() => {
    const loadPlans = async () => {
      if (!supabase || !user) return;
      const { data } = await supabase
        .from("user_transport_plans")
        .select("id, mode, zone, notes")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setPlans(data ?? []);
    };

    loadPlans();
  }, [user]);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => route.mode === mode);
  }, [routes, mode]);

  const handleSavePlan = async () => {
    if (!user) {
      setStatus("Sign in to save your transport plan.");
      return;
    }
    if (!supabase) return;
    const { data, error } = await supabase
      .from("user_transport_plans")
      .insert({
        user_id: user.id,
        event_id: activeEventId,
        mode,
        zone: zone || null,
        notes,
      })
      .select("id, mode, zone, notes")
      .single();

    if (error) {
      setStatus(error.message);
      return;
    }
    setPlans((prev) => (data ? [data, ...prev] : prev));
    setNotes("");
    setZone("");
    setStatus("Plan saved.");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Transport Planner
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Plan your arrival
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
            Available Routes
          </p>
          <select
            className="mt-4 w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
            onChange={(event) => setMode(event.target.value)}
            value={mode}
          >
            <option value="shuttle">Shuttle</option>
            <option value="metro">Metro</option>
            <option value="parking">Parking</option>
            <option value="rideshare">Ride share</option>
          </select>
          <div className="mt-4 space-y-3">
            {filteredRoutes.map((route) => (
              <div
                key={route.id}
                className="rounded-2xl border border-ice/10 bg-ink/70 p-4 text-sm text-ice/80"
              >
                <p>
                  {route.mode} {route.zone ? `- ${route.zone}` : ""}
                </p>
                <p className="mt-2 text-xs text-ice/60">
                  {route.instructions ?? "No instructions yet."}
                </p>
              </div>
            ))}
            {filteredRoutes.length === 0 && (
              <p className="text-sm text-ice/60">No routes available.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
            Save Your Plan
          </p>
          <input
            className="mt-4 w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
            onChange={(event) => setZone(event.target.value)}
            placeholder="Zone or stop"
            type="text"
            value={zone}
          />
          <textarea
            className="mt-3 h-24 w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Notes"
            value={notes}
          />
          <button
            className="mt-4 w-full rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
            onClick={handleSavePlan}
            type="button"
          >
            Save plan
          </button>
          {status && <p className="mt-3 text-xs text-ice/60">{status}</p>}
        </div>
      </div>

      <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
          Saved Plans
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border border-ice/10 bg-ink/70 p-4 text-sm text-ice/80"
            >
              <p className="uppercase tracking-[0.2em] text-ice/60">
                {plan.mode}
              </p>
              <p className="mt-2">{plan.zone ?? "No zone"}</p>
              <p className="mt-2 text-xs text-ice/60">{plan.notes}</p>
            </div>
          ))}
          {plans.length === 0 && (
            <p className="text-sm text-ice/60">No plans yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
