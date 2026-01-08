"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { supabase } from "../../../lib/supabaseClient";
import { useActiveEvent } from "../_components/useActiveEvent";

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

const SPAIN_GRAND_PRIX_CENTER = { lat: 41.5689, lng: 2.2611 };
const SPAIN_GRAND_PRIX_ZOOM = 14.5;

export default function MapPage() {
  const { activeEventId } = useActiveEvent();
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const mapboxToken = 'pk.eyJ1IjoiaGFyamFhcGRoaWxsb24iLCJhIjoiY2s0azk5dzZuMGhxcjNkbWxkczZudDNjMiJ9.JypD0r3tgGxZKN0nCsfP9A'

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

  const filteredPoints = useMemo(() => {
    if (activeLayers.length === 0) return [];
    return points.filter((point) => activeLayers.includes(point.layer_id));
  }, [points, activeLayers]);

  const mapPoints = useMemo(() => {
    return filteredPoints.filter(
      (point) =>
        typeof point.latitude === "number" &&
        Number.isFinite(point.latitude) &&
        typeof point.longitude === "number" &&
        Number.isFinite(point.longitude)
    );
  }, [filteredPoints]);

  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || mapRef.current) return;
    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [SPAIN_GRAND_PRIX_CENTER.lng, SPAIN_GRAND_PRIX_CENTER.lat],
      zoom: SPAIN_GRAND_PRIX_ZOOM,
      attributionControl: false,
    });
    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );
    mapRef.current = map;

    const handleLoad = () => setMapReady(true);
    map.on("load", handleLoad);

    return () => {
      map.off("load", handleLoad);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    mapPoints.forEach((point) => {
      if (point.latitude === null || point.longitude === null) return;
      const markerEl = document.createElement("div");
      markerEl.className =
        "h-3 w-3 rounded-full bg-redline shadow-[0_0_12px_rgba(225,6,0,0.75)]";
      const popup = new mapboxgl.Popup({
        offset: 12,
        closeButton: false,
        className: "f1-map-popup",
      });
      const labelEl = document.createElement("span");
      labelEl.className = "f1-map-popup__label";
      labelEl.textContent = point.name;
      popup.setDOMContent(labelEl);
      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([point.longitude, point.latitude])
        .setPopup(popup)
        .addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [mapPoints, mapReady]);

  const handleToggleLayer = (id: string) => {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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

      <div className="rounded-3xl border border-ice/15 bg-carbon/70 p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-ice/50">
            Circuit Map
          </p>
          <span className="text-xs text-ice/60">
            {mapPoints.length} active points
          </span>
        </div>
        <div className="mt-4">
          <div className="relative h-[420px] rounded-2xl border border-ice/10 sm:h-[480px] lg:h-[560px]">
            {!mapboxToken && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/85 px-6 text-center text-xs text-ice/70">
                Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to render the Mapbox map.
              </div>
            )}
            <div
              ref={mapContainerRef}
              className="h-full w-full f1-map-container"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-ice/60">
          {mapboxToken
            ? "Tap a marker to view the point name."
            : "Mapbox token required to render live map tiles."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
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
            Active points: {mapPoints.length}
          </div>
        </div>
      </div>
    </div>
  );
}
