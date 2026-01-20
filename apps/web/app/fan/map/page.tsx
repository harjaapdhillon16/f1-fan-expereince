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
  point_type?: string;
}

const MEXICO_GRAND_PRIX_CENTER = { lat: 19.4042, lng: -99.0907 };
const MEXICO_GRAND_PRIX_ZOOM = 14.5;

// Demo user location near the circuit (simulated for demo purposes)
const DEMO_USER_LOCATION = { lat: 19.4055, lng: -99.0920 };

export default function MapPage() {
  const { activeEventId } = useActiveEvent();
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const mapboxToken =
    "pk.eyJ1IjoiaGFyamFhcGRoaWxsb24iLCJhIjoiY2s0azk5dzZuMGhxcjNkbWxkczZudDNjMiJ9.JypD0r3tgGxZKN0nCsfP9A";

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
        .select("id, layer_id, name, latitude, longitude, point_type")
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
      center: [MEXICO_GRAND_PRIX_CENTER.lng, MEXICO_GRAND_PRIX_CENTER.lat],
      zoom: MEXICO_GRAND_PRIX_ZOOM,
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
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    
    // Clear all existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // FIRST: Add the blue user location marker (so it's visible)
    const userMarkerEl = document.createElement("div");
    userMarkerEl.className = "h-5 w-5 rounded-full bg-blue-500 shadow-[0_0_16px_rgba(59,130,246,1)] cursor-pointer animate-pulse";
    
    const userPopup = new mapboxgl.Popup({
      offset: 15,
      closeButton: false,
      className: "f1-map-popup",
    });
    
    const userPopupContent = document.createElement("div");
    userPopupContent.className = "f1-map-popup__content";
    userPopupContent.innerHTML = `
      <div class="f1-map-popup__header">Your Location</div>
      <div class="f1-map-popup__meta" style="color: rgb(59, 130, 246);">Near Main Entrance</div>
    `;
    userPopup.setDOMContent(userPopupContent);
    
    const userMarker = new mapboxgl.Marker({ element: userMarkerEl })
      .setLngLat([DEMO_USER_LOCATION.lng, DEMO_USER_LOCATION.lat])
      .setPopup(userPopup)
      .addTo(mapRef.current);
    
    userMarkerRef.current = userMarker;
    console.log('✅ Blue user marker added at:', DEMO_USER_LOCATION);

    // THEN: Add all the red point markers
    mapPoints.forEach((point) => {
      if (point.latitude === null || point.longitude === null) return;
      
      const markerEl = document.createElement("div");
      markerEl.className =
        "h-3 w-3 rounded-full bg-redline shadow-[0_0_12px_rgba(225,6,0,0.75)] cursor-pointer hover:scale-125 transition-transform";
      
      const popup = new mapboxgl.Popup({
        offset: 12,
        closeButton: false,
        className: "f1-map-popup",
      });
      
      const popupContent = document.createElement("div");
      popupContent.className = "f1-map-popup__content";
      
      const typeLabel = point.point_type
        ? point.point_type.charAt(0).toUpperCase() + point.point_type.slice(1)
        : "Location";
      
      popupContent.innerHTML = `
        <div class="f1-map-popup__header">${point.name}</div>
        <div class="f1-map-popup__meta">${typeLabel}</div>
      `;
      
      popup.setDOMContent(popupContent);
      
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
    <>
      <style jsx global>{`
        .f1-map-popup .mapboxgl-popup-content {
          background: linear-gradient(135deg, rgba(18, 18, 18, 0.98) 0%, rgba(30, 30, 30, 0.98) 100%);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(225, 6, 0, 0.3);
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(225, 6, 0, 0.15);
          min-width: 180px;
        }

        .f1-map-popup .mapboxgl-popup-tip {
          border-top-color: rgba(18, 18, 18, 0.98);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .f1-map-popup__content {
          padding: 12px 16px;
        }

        .f1-map-popup__header {
          font-size: 14px;
          font-weight: 600;
          color: rgba(239, 243, 255, 0.95);
          letter-spacing: 0.02em;
          margin-bottom: 4px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .f1-map-popup__meta {
          font-size: 11px;
          color: rgba(225, 6, 0, 0.85);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
        }
      `}</style>

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
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-xs text-blue-400">
                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
                Your location
              </span>
              <span className="text-xs text-ice/60">
                {mapPoints.length} active points
              </span>
            </div>
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
              ? "Tap a marker to view details. Blue pulsing marker shows your current location."
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
                  className="flex items-center justify-between rounded-2xl border border-ice/10 bg-ink/70 px-4 py-3 text-sm text-ice/80 cursor-pointer hover:border-ice/20 transition-colors"
                >
                  <span>{layer.name}</span>
                  <input
                    checked={activeLayers.includes(layer.id)}
                    className="h-4 w-4 accent-redline cursor-pointer"
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
    </>
  );
}