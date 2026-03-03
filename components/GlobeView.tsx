"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import DeckGL from "@deck.gl/react";
import {
  _GlobeView as DeckGlobeView,
  AmbientLight,
  DirectionalLight,
  LightingEffect,
  type Layer,
} from "@deck.gl/core";
import { ColumnLayer, GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import type { FeatureCollection } from "geojson";

import { cn } from "@/lib/utils";
import { useSimStore } from "@/store/useSimStore";

type HoverState =
  | {
      x: number;
      y: number;
      eventId: string;
      eventName: string;
      sport: string;
      league: string;
      handle5m: number;
      line: number;
      sideAPct: number;
    }
  | null;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${Math.round(n)}`;
}

type BeamDatum = {
  id: string;
  position: [number, number];
  elevation: number;
  intensity01: number;
  isAlert: boolean;
  eventName: string;
  sport: string;
  league: string;
  handle5m: number;
  line: number;
  sideAPct: number;
};

type PulseDatum = BeamDatum & { phase: number };

export function GlobeView({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const eventCatalog = useSimStore((s) => s.eventCatalog);
  const markets = useSimStore((s) => s.markets);
  const cascades = useSimStore((s) => s.cascades);
  const betEvents = useSimStore((s) => s.events);
  const toggles = useSimStore((s) => s.toggles);
  const nowMs = useSimStore((s) => s.nowMs);
  const selectEvent = useSimStore((s) => s.selectEvent);

  const [hover, setHover] = useState<HoverState>(null);
  const [countriesGeoJson, setCountriesGeoJson] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Lightweight, subtle outlines. If this fetch fails, we still render beams.
    fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled) return;
        if (j) setCountriesGeoJson(j as FeatureCollection);
      })
      .catch(() => {
        // noop
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const recentWhaleEventIds = useMemo(() => {
    const cutoff = nowMs - 12_000;
    const ids = new Set<string>();
    for (let i = betEvents.length - 1; i >= 0 && betEvents.length - i < 340; i--) {
      const b = betEvents[i]!;
      if (b.tsMs < cutoff) break;
      if (b.kind === "whale") ids.add(b.eventId);
    }
    return ids;
  }, [betEvents, nowMs]);

  const beamData = useMemo(() => {
    const rows = eventCatalog.map((e) => {
      const m = markets[e.id];
      const handle = m?.totalHandle5m ?? 0;
      const heat = m?.heatScore ?? 0;
      const intensity01 = clamp01(Math.log10(1 + handle) / 6.2) * 0.75 + heat * 0.25;

      const elev = lerp(127_000, 1_590_000, intensity01); // ~0.02R..0.25R
      const isAlert =
        (toggles.highlightWhales && recentWhaleEventIds.has(e.id)) ||
        ((cascades[e.id]?.strength ?? 0) > 0.08);

      return {
        id: e.id,
        position: [e.eventLng, e.eventLat] as [number, number],
        elevation: elev,
        intensity01,
        isAlert,
        eventName: e.eventName,
        sport: e.sport,
        league: e.league,
        handle5m: handle,
        line: m?.line ?? 0.5,
        sideAPct: m?.sideAPct ?? 0.5,
      } satisfies BeamDatum;
    });

    return rows;
  }, [cascades, eventCatalog, markets, recentWhaleEventIds, toggles.highlightWhales]);

  const pulseData = useMemo(() => {
    // Pulse rings under the strongest beams.
    const top = [...beamData].sort((a, b) => b.intensity01 - a.intensity01).slice(0, 26);
    return top.map((d) => ({ ...d, phase: (nowMs / 1000) % 1 }) satisfies PulseDatum);
  }, [beamData, nowMs]);

  const layers: Layer[] = useMemo(() => {
    const landLayer =
      toggles.showRipples &&
      countriesGeoJson &&
      new GeoJsonLayer({
        id: "landmass",
        data: countriesGeoJson,
        pickable: false,
        filled: true,
        stroked: true,
        lineWidthMinPixels: 0.7,
        getFillColor: [8, 12, 18, 210],
        getLineColor: [0, 255, 209, 46],
        getLineWidth: 1,
        // Reduce z-fighting shimmer
        parameters: { depthTest: true },
      });

    const glowLayer = new ColumnLayer<BeamDatum>({
      id: "beams-glow",
      data: beamData,
      pickable: false,
      diskResolution: 20,
      radius: 108_000,
      elevationScale: 1,
      getPosition: (d) => d.position,
      getElevation: (d) => d.elevation,
      getFillColor: (d) => (d.isAlert ? [255, 166, 64, 52] : [0, 255, 209, 50]),
      getLineColor: [0, 0, 0, 0],
      parameters: {
        blend: true,
      },
    });

    const coreLayer = new ColumnLayer<BeamDatum>({
      id: "beams-core",
      data: beamData,
      pickable: true,
      diskResolution: 18,
      radius: 36_000,
      elevationScale: 1,
      getPosition: (d) => d.position,
      getElevation: (d) => d.elevation,
      getFillColor: (d) => (d.isAlert ? [255, 166, 64, 180] : [0, 255, 209, 160]),
      getLineColor: (d) => (d.isAlert ? [255, 166, 64, 220] : [0, 255, 209, 220]),
      lineWidthMinPixels: 0.5,
      onClick: (info) => {
        const obj = info.object as BeamDatum | undefined;
        if (obj?.id) selectEvent(obj.id);
      },
      onHover: (info) => {
        const obj = info.object as BeamDatum | undefined;
        if (!obj?.id || info.x == null || info.y == null) {
          setHover(null);
          return;
        }
        setHover({
          x: info.x,
          y: info.y,
          eventId: obj.id,
          eventName: obj.eventName,
          sport: obj.sport,
          league: obj.league,
          handle5m: obj.handle5m,
          line: obj.line,
          sideAPct: obj.sideAPct,
        });
      },
      parameters: {
        blend: true,
      },
      updateTriggers: { data: beamData },
    });

    const basePulse = new ScatterplotLayer<PulseDatum>({
      id: "base-pulse",
      data: pulseData,
      pickable: false,
      filled: false,
      stroked: true,
      lineWidthMinPixels: 1,
      radiusUnits: "meters",
      getPosition: (d) => d.position,
      getRadius: (d) => 60_000 + (0.4 + d.intensity01) * (80_000 + 70_000 * Math.sin((nowMs / 1000) * 2.2)),
      getLineColor: (d) => (d.isAlert ? [255, 166, 64, 80] : [0, 255, 209, 70]),
      parameters: {
        blend: true,
      },
      updateTriggers: { getRadius: nowMs, data: pulseData },
    });

    const maybePulse = toggles.showFlows ? basePulse : null;

    return [landLayer, maybePulse, glowLayer, coreLayer].filter(Boolean) as Layer[];
  }, [beamData, countriesGeoJson, nowMs, pulseData, selectEvent, toggles.showFlows, toggles.showRipples]);

  const effects = useMemo(() => {
    const ambient = new AmbientLight({ color: [255, 255, 255], intensity: 0.35 });
    const key = new DirectionalLight({
      color: [120, 235, 255],
      intensity: 0.75,
      direction: [-1, -0.2, -0.8],
    });
    const rim = new DirectionalLight({
      color: [0, 255, 209],
      intensity: 0.35,
      direction: [1, 0.3, 0.9],
    });
    return [new LightingEffect({ ambient, key, rim })];
  }, []);

  const viewState = useMemo(
    () => ({
      longitude: 0,
      latitude: 18,
      zoom: 0.85,
      minZoom: 0,
      maxZoom: 8,
    }),
    [],
  );

  return (
    <div ref={wrapRef} className={cn("relative h-full w-full bg-[#03040a]", className)}>
      <DeckGL
        views={new DeckGlobeView({ id: "globe", resolution: 10, altitude: 1.6 })}
        initialViewState={viewState}
        controller={{ inertia: 800 }}
        layers={layers}
        effects={effects}
        style={{ position: "absolute", inset: "0" }}
        getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
      />

      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(900px_650px_at_18%_12%,rgba(0,255,209,0.06),transparent_70%),radial-gradient(900px_650px_at_82%_18%,rgba(0,174,255,0.05),transparent_70%),radial-gradient(1100px_800px_at_50%_120%,rgba(255,166,64,0.04),transparent_72%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.07),transparent_55%),radial-gradient(circle_at_45%_40%,rgba(0,255,209,0.06),transparent_62%),radial-gradient(circle_at_50%_50%,transparent_55%,rgba(0,0,0,0.62)_78%,rgba(0,0,0,0.9)_100%)]" />

      {hover ? (
        <div
          className="pointer-events-none absolute z-50 max-w-[280px] -translate-y-2 rounded-md border border-white/10 bg-black/75 px-3 py-2 text-xs text-white/85 backdrop-blur"
          style={{ left: hover.x + 12, top: hover.y + 12 }}
        >
          <div className="truncate text-[11px] font-semibold tracking-widest text-white/70">
            {hover.sport}
          </div>
          <div className="truncate font-medium text-white/90">{hover.eventName}</div>
          <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums text-white/70">
            <div>liq {fmtMoney(hover.handle5m)}</div>
            <div>line {hover.line.toFixed(2)}</div>
            <div>A% {(hover.sideAPct * 100).toFixed(1)}</div>
            <div className="truncate">{hover.league}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

