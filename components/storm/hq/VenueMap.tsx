"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { venues, matches, teams } from "@/lib/mock/storm";

const COUNTRY_COLORS: Record<string, string> = {
  US: "#60a5fa",
  MX: "#34d399",
  CA: "#f87171",
};

interface VenueMapProps {
  onSelectVenue?: (venueId: string | null) => void;
  selectedVenueId?: string | null;
}

export function VenueMap({ onSelectVenue, selectedVenueId }: VenueMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const liveVenues = useMemo(() => {
    const liveMatches = matches.filter((m) => m.status === "live");
    return new Set(
      liveMatches.map((m) => {
        const v = venues.find((v) => m.venue.toLowerCase().includes(v.city.toLowerCase().split("/")[0]));
        return v?.id;
      }).filter(Boolean)
    );
  }, []);

  const venueMatchCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of venues) {
      counts[v.id] = matches.filter((m) =>
        m.venue.toLowerCase().includes(v.city.toLowerCase().split("/")[0]) ||
        m.venue.toLowerCase().includes(v.name.toLowerCase().split(" ")[0])
      ).length;
    }
    return counts;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mounted) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    const minLat = 18;
    const maxLat = 52;
    const minLng = -130;
    const maxLng = -65;

    function project(lat: number, lng: number): [number, number] {
      const x = ((lng - minLng) / (maxLng - minLng)) * w * 0.85 + w * 0.075;
      const y = (1 - (lat - minLat) / (maxLat - minLat)) * h * 0.85 + h * 0.075;
      return [x, y];
    }

    let frameId: number;
    let t = 0;

    function draw() {
      if (!ctx) return;
      t += 0.02;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < venues.length; i++) {
        for (let j = i + 1; j < venues.length; j++) {
          if (venues[i].country === venues[j].country) {
            const [x1, y1] = project(venues[i].lat, venues[i].lng);
            const [x2, y2] = project(venues[j].lat, venues[j].lng);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = "rgba(255,255,255,0.03)";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (const venue of venues) {
        const [x, y] = project(venue.lat, venue.lng);
        const isLive = liveVenues.has(venue.id);
        const isSelected = selectedVenueId === venue.id;
        const isHov = hovered === venue.id;
        const color = COUNTRY_COLORS[venue.country] || "#94a3b8";
        const matchCount = venueMatchCounts[venue.id] || 0;
        const radius = 4 + matchCount * 0.4;

        if (isLive) {
          const pulse = Math.sin(t * 3) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(x, y, radius + 8 + pulse * 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(52, 211, 153, ${0.08 + pulse * 0.08})`;
          ctx.fill();
        }

        if (isSelected || isHov) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? "rgba(250, 204, 21, 0.15)" : "rgba(255,255,255,0.08)";
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isLive ? "#34d399" : color;
        ctx.globalAlpha = isSelected || isHov ? 1 : 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;

        if (isHov || isSelected || isLive) {
          ctx.font = "10px system-ui, sans-serif";
          ctx.fillStyle = "rgba(255,255,255,0.8)";
          ctx.textAlign = "center";
          ctx.fillText(venue.city, x, y - radius - 6);
          if (matchCount > 0) {
            ctx.font = "9px system-ui, sans-serif";
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.fillText(`${matchCount} matches`, x, y - radius + 4);
          }
        }
      }

      frameId = requestAnimationFrame(draw);
    }

    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [mounted, hovered, selectedVenueId, liveVenues, venueMatchCounts]);

  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    const minLat = 18;
    const maxLat = 52;
    const minLng = -130;
    const maxLng = -65;

    let closest: string | null = null;
    let closestDist = Infinity;

    for (const venue of venues) {
      const x = ((venue.lng - minLng) / (maxLng - minLng)) * w * 0.85 + w * 0.075;
      const y = (1 - (venue.lat - minLat) / (maxLat - minLat)) * h * 0.85 + h * 0.075;
      const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
      if (dist < 20 && dist < closestDist) {
        closest = venue.id;
        closestDist = dist;
      }
    }

    return closest;
  };

  if (!mounted) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-4 h-[280px] flex items-center justify-center">
        <span className="text-xs text-muted-foreground">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-storm-accent" />
          <span className="text-[10px] font-semibold tracking-widest">HOST VENUES</span>
        </div>
        <div className="flex items-center gap-2">
          {(["US", "MX", "CA"] as const).map((c) => (
            <div key={c} className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full" style={{ background: COUNTRY_COLORS[c] }} />
              <span className="text-[9px] text-muted-foreground">{c}</span>
            </div>
          ))}
          {liveVenues.size > 0 && (
            <Badge className="bg-storm-live/20 text-storm-live text-[9px] px-1 py-0">
              {liveVenues.size} live
            </Badge>
          )}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-[250px] cursor-crosshair"
        onMouseMove={(e) => setHovered(handleCanvasInteraction(e) ?? null)}
        onMouseLeave={() => setHovered(null)}
        onClick={(e) => {
          const id = handleCanvasInteraction(e);
          onSelectVenue?.(id === selectedVenueId ? null : id ?? null);
        }}
      />
    </div>
  );
}
