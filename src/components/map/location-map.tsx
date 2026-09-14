"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";

export type MapPoint = {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  confidence: string;
};

const STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/dark";

export function LocationMap({ points, height = 360 }: { points: MapPoint[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current || points.length === 0) return;
      try {
        const maplibregl = await import("maplibre-gl");
        await import("maplibre-gl/dist/maplibre-gl.css");
        if (cancelled || !containerRef.current) return;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: STYLE_URL,
          center: [points[0]!.longitude, points[0]!.latitude],
          zoom: 12,
          attributionControl: { compact: true },
        });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

        map.on("error", () => setFailed(true));

        map.on("load", () => {
          if (cancelled) return;
          const bounds = new maplibregl.LngLatBounds();
          for (const p of points) {
            const marker = new maplibregl.Marker({ color: "#33ffb5" })
              .setLngLat([p.longitude, p.latitude])
              .setPopup(
                new maplibregl.Popup({ offset: 20 }).setHTML(
                  `<div style="font-family:monospace;font-size:12px"><strong>${p.label}</strong><br/>Confidence: ${p.confidence}</div>`,
                ),
              )
              .addTo(map);
            markersRef.current.push(marker);
            bounds.extend([p.longitude, p.latitude]);
          }
          if (points.length > 1) {
            map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
          }
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    init();

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.map((p) => p.id).join(",")]);

  if (points.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[color:var(--color-panel-border)] text-sm text-[color:var(--color-text-dim)]">
        No coordinates available to display.
      </div>
    );
  }

  if (failed) {
    return (
      <div className="rounded-xl border border-[color:var(--color-panel-border)] p-4">
        <p className="mb-2 text-xs text-[color:var(--color-text-dim)]">
          Map rendering is unavailable (WebGL or network). Showing coordinate list instead.
        </p>
        <ul className="space-y-1 text-sm">
          {points.map((p) => (
            <li key={p.id} className="flex justify-between">
              <span>{p.label}</span>
              <span className="text-[color:var(--color-text-dim)]">
                {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <div ref={containerRef} style={{ height }} className="w-full overflow-hidden rounded-xl border border-[color:var(--color-panel-border)]" />;
}

export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}
