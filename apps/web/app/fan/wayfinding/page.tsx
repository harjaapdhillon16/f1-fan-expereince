"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useActiveEvent } from "../_components/useActiveEvent";
import { useSupabaseUser } from "../_components/useSupabaseUser";

interface MapPoint {
  id: string;
  name: string;
}

interface WayfindingRequest {
  id: string;
  destination_point_id: string | null;
  status: string;
  created_at: string;
}

export default function WayfindingPage() {
  const { user } = useSupabaseUser();
  const { activeEventId } = useActiveEvent();
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [requests, setRequests] = useState<WayfindingRequest[]>([]);
  const [destination, setDestination] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadPoints = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from("map_points")
        .select("id, name")
        .limit(200);
      setPoints(data ?? []);
    };

    loadPoints();
  }, []);

  useEffect(() => {
    const loadRequests = async () => {
      if (!supabase || !user) return;
      const { data } = await supabase
        .from("wayfinding_requests")
        .select("id, destination_point_id, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setRequests(data ?? []);
    };

    loadRequests();
  }, [user]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setStatus("GPS unavailable on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => setStatus("Location permission denied.")
    );
  };

  const handleRequest = async () => {
    if (!user) {
      setStatus("Sign in to request directions.");
      return;
    }
    if (!supabase) return;
    if (!location) {
      setStatus("Enable GPS first.");
      return;
    }
    if (!destination) {
      setStatus("Select a destination.");
      return;
    }
    const { data, error } = await supabase
      .from("wayfinding_requests")
      .insert({
        user_id: user.id,
        event_id: activeEventId,
        start_lat: location.lat,
        start_lng: location.lng,
        destination_point_id: destination,
      })
      .select("id, destination_point_id, status, created_at")
      .single();

    if (error) {
      setStatus(error.message);
      return;
    }
    if (data) {
      setRequests((prev) => [data, ...prev]);
      setStatus("Route requested.");
    }
  };

  const handleResolve = async (id: string) => {
    if (!supabase) return;
    await supabase.from("wayfinding_requests").update({ status: "resolved" }).eq("id", id);
    setRequests((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "resolved" } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Wayfinding Assistant
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Where am I?
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
            GPS and destination
          </p>
          <button
            className="mt-4 w-full rounded-full border border-redline/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-redline"
            onClick={handleLocate}
            type="button"
          >
            Locate me
          </button>
          <p className="mt-3 text-sm text-ice/70">
            {location
              ? `Lat ${location.lat.toFixed(4)}, Lng ${location.lng.toFixed(4)}`
              : "Location not set"}
          </p>

          <select
            className="mt-4 w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
            onChange={(event) => setDestination(event.target.value)}
            value={destination}
          >
            <option value="">Select destination</option>
            {points.map((point) => (
              <option key={point.id} value={point.id}>
                {point.name}
              </option>
            ))}
          </select>
          <button
            className="mt-4 w-full rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
            onClick={handleRequest}
            type="button"
          >
            Request route
          </button>
          {status && <p className="mt-3 text-xs text-ice/60">{status}</p>}
        </div>

        <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
            Recent requests
          </p>
          <div className="mt-4 space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-ice/10 bg-ink/70 p-4"
              >
                <div className="flex items-center justify-between text-sm text-ice">
                  <span>{request.destination_point_id}</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-ice/50">
                    {request.status}
                  </span>
                </div>
                <button
                  className="mt-3 rounded-full border border-ice/30 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-ice/70"
                  onClick={() => handleResolve(request.id)}
                  type="button"
                >
                  Mark resolved
                </button>
              </div>
            ))}
            {requests.length === 0 && (
              <p className="text-sm text-ice/60">No wayfinding requests yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
