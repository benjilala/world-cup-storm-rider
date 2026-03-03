"use client";

import { useEffect, useMemo, useRef } from "react";

import { ArcLayer, ScatterplotLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import maplibregl from "maplibre-gl";

import { cn } from "@/lib/utils";
import { useSimStore } from "@/store/useSimStore";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function MapView({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);

  const eventCatalog = useSimStore((s) => s.eventCatalog);
  const markets = useSimStore((s) => s.markets);
  const betEvents = useSimStore((s) => s.events);
  const toggles = useSimStore((s) => s.toggles);
  const nowMs = useSimStore((s) => s.nowMs);
  const selectedEventId = useSimStore((s) => s.selectedEventId);
  const selectEvent = useSimStore((s) => s.selectEvent);

  useEffect(() => {
    if (!containerRef.current) return;

    const styleUrl = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [0, 18],
      zoom: 1.25,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");

    const overlay = new MapboxOverlay({ interleaved: true, layers: [] });
    overlayRef.current = overlay;
    map.addControl(overlay as unknown as maplibregl.IControl);

    return () => {
      overlayRef.current = null;
      mapRef.current = null;
      try {
        map.remove();
      } catch {
        // noop
      }
    };
  }, []);

  const nodes = useMemo(() => {
    return eventCatalog.map((e) => {
      const m = markets[e.id];
      return {
        id: e.id,
        lon: e.eventLng,
        lat: e.eventLat,
        popularity: e.popularity,
        heat: m?.heatScore ?? 0,
        sideA: m?.sideAPct ?? 0.5,
        handle: m?.totalHandle5m ?? 0,
        bpm: m?.betsPerMin ?? 0,
      };
    });
  }, [eventCatalog, markets]);

  const arcData = useMemo(() => {
    if (!toggles.showFlows) return [];
    const evById = new Map(eventCatalog.map((e) => [e.id, e] as const));
    return betEvents
      .slice(-450)
      .map((b) => {
        const ev = evById.get(b.eventId);
        if (!ev) return null;
        return {
          id: b.id,
          kind: b.kind,
          stake: b.stake,
          source: [b.origin.lng, b.origin.lat] as [number, number],
          target: [ev.eventLng, ev.eventLat] as [number, number],
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      kind: string;
      stake: number;
      source: [number, number];
      target: [number, number];
    }>;
  }, [betEvents, eventCatalog, toggles.showFlows]);

  const rippleData = useMemo(() => {
    if (!toggles.showRipples) return [];
    const cutoff = nowMs - 10_000;
    return betEvents
      .filter((b) => b.tsMs >= cutoff && (b.kind === "whale" || b.kind === "spike"))
      .map((b) => ({
        id: `RP-${b.id}`,
        tsMs: b.tsMs,
        lon: b.origin.lng,
        lat: b.origin.lat,
        strength: clamp01(Math.log10(1 + b.stake) / 6),
        kind: b.kind,
      }));
  }, [betEvents, nowMs, toggles.showRipples]);

  const layers = useMemo(() => {
    const now = nowMs;

    const arcsLayer = new ArcLayer({
      id: "flows",
      data: arcData,
      pickable: false,
      getSourcePosition: (d) => d.source,
      getTargetPosition: (d) => d.target,
      getWidth: (d) => Math.max(0.4, Math.log10(1 + d.stake) * 0.8),
      getSourceColor: (d) => (d.kind === "whale" ? [255, 166, 64, 170] : [0, 255, 209, 90]),
      getTargetColor: (d) => (d.kind === "whale" ? [255, 166, 64, 30] : [0, 174, 255, 25]),
      greatCircle: true,
      opacity: 0.65,
      updateTriggers: { data: arcData },
    });

    const rippleLayer = new ScatterplotLayer({
      id: "ripples",
      data: rippleData,
      pickable: false,
      getPosition: (d) => [d.lon, d.lat],
      getRadius: (d) => {
        const age = Math.max(0, now - d.tsMs) / 1000;
        return 8_000 + age * 55_000 * (0.6 + d.strength);
      },
      radiusUnits: "meters",
      stroked: true,
      filled: false,
      lineWidthMinPixels: 1,
      getLineColor: (d) => (d.kind === "whale" ? [255, 166, 64, 120] : [0, 255, 209, 90]),
      getLineWidth: (d) => 1 + d.strength * 1.8,
      updateTriggers: { getRadius: now, data: rippleData },
    });

    const nodesLayer = new ScatterplotLayer({
      id: "nodes",
      data: nodes,
      pickable: true,
      getPosition: (d) => [d.lon, d.lat],
      radiusUnits: "meters",
      getRadius: (d) => 60_000 + d.popularity * 110_000 + d.heat * 120_000,
      radiusMinPixels: 3,
      radiusMaxPixels: 26,
      filled: true,
      stroked: true,
      getFillColor: (d) => {
        const t = d.sideA;
        const r = Math.round(lerp(20, 80, t));
        const g = Math.round(lerp(210, 255, 1 - Math.abs(t - 0.5) * 2));
        const b = Math.round(lerp(255, 140, t));
        const a = Math.round(lerp(115, 210, d.heat));
        return [r, g, b, a];
      },
      getLineColor: (d) => {
        if (d.id === selectedEventId) return [0, 255, 209, 245];
        return d.heat > 0.7 ? [0, 255, 209, 210] : [255, 255, 255, 110];
      },
      lineWidthMinPixels: 1,
      getLineWidth: (d) => (d.id === selectedEventId ? 2.4 : 1 + d.heat * 1.6),
      onClick: (info) => {
        const obj = info.object as { id: string } | undefined;
        if (!obj?.id) return;
        selectEvent(obj.id);
      },
      updateTriggers: { data: nodes, getLineColor: selectedEventId },
    });

    return toggles.showFlows ? [arcsLayer, rippleLayer, nodesLayer] : [rippleLayer, nodesLayer];
  }, [arcData, nodes, nowMs, rippleData, selectEvent, selectedEventId, toggles.showFlows]);

  useEffect(() => {
    if (!overlayRef.current) return;
    overlayRef.current.setProps({ layers });
  }, [layers]);

  return (
    <div className={cn("relative h-full w-full bg-[#04060c]", className)}>
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(700px_500px_at_50%_-10%,rgba(0,255,209,0.08),transparent_60%),radial-gradient(900px_650px_at_50%_120%,rgba(0,160,255,0.08),transparent_65%)]" />
    </div>
  );
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

