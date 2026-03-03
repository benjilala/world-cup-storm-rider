"use client";

import { useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useSimStore } from "@/store/useSimStore";

function fmtOffset(ms: number) {
  const s = Math.round(Math.abs(ms) / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  const text = m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
  return ms < 0 ? `PAST ${text}` : ms > 0 ? `FUTURE ${text}` : "LIVE";
}

export function TimelineScrubber({ className }: { className?: string }) {
  const timeline = useSimStore((s) => s.timeline);
  const beginScrub = useSimStore((s) => s.beginScrub);
  const setTimelineOffsetMs = useSimStore((s) => s.setTimelineOffsetMs);
  const commitTimelineOffsetMs = useSimStore((s) => s.commitTimelineOffsetMs);

  const [dragging, setDragging] = useState(false);

  const range = useMemo(() => {
    return {
      min: -timeline.pastWindowMs,
      max: timeline.futureWindowMs,
    };
  }, [timeline.futureWindowMs, timeline.pastWindowMs]);

  const value = timeline.cursorOffsetMs;

  return (
    <Card className={cn("border-white/10 bg-black/55 backdrop-blur-xl", className)}>
      <CardContent className="flex items-center gap-3 p-3">
        <div className="w-[96px] flex-none font-mono text-[11px] tabular-nums text-white/70">
          {fmtOffset(value)}
        </div>
        <div className="flex-1">
          <Slider
            value={[value]}
            min={range.min}
            max={range.max}
            step={1000}
            onPointerDown={() => {
              if (!timeline.scrubbing) beginScrub();
              setDragging(true);
            }}
            onPointerUp={() => setDragging(false)}
            onValueChange={(v) => {
              const next = v[0] ?? 0;
              if (!timeline.scrubbing) beginScrub();
              setTimelineOffsetMs(next);
            }}
            onValueCommit={(v) => {
              const next = v[0] ?? 0;
              commitTimelineOffsetMs(next);
            }}
          />
          <div className="mt-1 flex items-center justify-between text-[10px] text-white/45">
            <span>PAST</span>
            <span className={cn(dragging ? "text-white/65" : "")}>PRESENT</span>
            <span>FUTURE</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

