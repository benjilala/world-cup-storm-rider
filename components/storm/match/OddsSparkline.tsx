"use client";

import type { OddsHistoryPoint } from "@/lib/types/storm";

export function OddsSparkline({ data }: { data: OddsHistoryPoint[] }) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.odds);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const w = 200;
  const h = 40;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d.odds - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-1">
      <p className="text-[10px] text-muted-foreground">Odds Movement</p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-10"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke="var(--storm-accent)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
        <span>{min.toFixed(2)}</span>
        <span>{max.toFixed(2)}</span>
      </div>
    </div>
  );
}
