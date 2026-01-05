"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useActiveEvent } from "../_components/useActiveEvent";
import { useSupabaseUser } from "../_components/useSupabaseUser";

interface MapLayer {
  id: string;
  name: string;
}

interface MapPoint {
  id: string;
  layer_id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

interface SavedLocation {
  id: string;
  map_point_id: string | null;
  label: string | null;
}

export default function MapPage() {
  const { user } = useSupabaseUser();
  const { activeEventId } = useActiveEvent();
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [selectedPoint, setSelectedPoint] = useState("");
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const layerQuery = supabase
        .from("map_layers")
        .select("id, name")
        .order("sort_order", { ascending: true });
      if (activeEventId) {
        layerQuery.eq("event_id", activeEventId);
      }
      const { data: layerData } = await layerQuery;
      setLayers(layerData ?? []);
      setActiveLayers((layerData ?? []).map((layer) => layer.id));

      const { data: pointData } = await supabase
        .from("map_points")
        .select("id, layer_id, name, latitude, longitude")
        .limit(500);
      setPoints(pointData ?? []);
    };

    load();
  }, [activeEventId]);

  useEffect(() => {
    const loadSaved = async () => {
      if (!supabase || !user) return;
      const { data } = await supabase
        .from("saved_locations")
        .select("id, map_point_id, label")
        .eq("user_id", user.id);
      setSavedLocations(data ?? []);
    };

    loadSaved();
  }, [user]);

  const filteredPoints = useMemo(() => {
    if (activeLayers.length === 0) return [];
    return points.filter((point) => activeLayers.includes(point.layer_id));
  }, [points, activeLayers]);

  const handleToggleLayer = (id: string) => {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveLocation = async () => {
    if (!user) {
      setStatus("Sign in to save a location.");
      return;
    }
    if (!supabase) return;
    if (!selectedPoint) {
      setStatus("Select a map point.");
      return;
    }
    const { error, data } = await supabase
      .from("saved_locations")
      .insert({
        user_id: user.id,
        map_point_id: selectedPoint,
        label,
      })
      .select("id, map_point_id, label")
      .single();

    if (error) {
      setStatus(error.message);
      return;
    }
    setSavedLocations((prev) => (data ? [data, ...prev] : prev));
    setSelectedPoint("");
    setLabel("");
    setStatus("Location saved.");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
          Interactive Venue Map
        </p>
        <h1 className="mt-3 text-3xl font-semibold uppercase tracking-[0.1em]">
          Explore the circuit
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
            Map Layers
          </p>
          <div className="mt-4 space-y-3">
            {layers.map((layer) => (
              <label
                key={layer.id}
                className="flex items-center justify-between rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice/80"
              >
                <span>{layer.name}</span>
                <input
                  checked={activeLayers.includes(layer.id)}
                  className="h-4 w-4 accent-redline"
                  onChange={() => handleToggleLayer(layer.id)}
                  type="checkbox"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-ice/10 bg-ink/70 p-4 text-sm text-ice/70">
            Active points: {filteredPoints.length}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
              Points of Interest
            </p>
            <div className="mt-4 max-h-64 space-y-3 overflow-auto">
              {filteredPoints.map((point) => (
                <div
                  key={point.id}
                  className="rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice/80"
                >
                  <p>{point.name}</p>
                  <p className="mt-1 text-xs text-ice/60">
                    {point.latitude?.toFixed(3)}, {point.longitude?.toFixed(3)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
              Save a Location
            </p>
            <select
              className="mt-4 w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
              onChange={(event) => setSelectedPoint(event.target.value)}
              value={selectedPoint}
            >
              <option value="">Select a point</option>
              {points.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.name}
                </option>
              ))}
            </select>
            <input
              className="mt-3 w-full rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice"
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Label"
              type="text"
              value={label}
            />
            <button
              className="mt-4 w-full rounded-full bg-redline px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
              onClick={handleSaveLocation}
              type="button"
            >
              Save location
            </button>
            {status && <p className="mt-3 text-xs text-ice/60">{status}</p>}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
          Saved Locations
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {savedLocations.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice/80"
            >
              <p>{item.label || "Saved location"}</p>
              <p className="mt-1 text-xs text-ice/60">{item.map_point_id}</p>
            </div>
          ))}
          {savedLocations.length === 0 && (
            <p className="text-sm text-ice/60">No saved locations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
