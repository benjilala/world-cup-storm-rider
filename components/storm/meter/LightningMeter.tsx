"use client";

import { Zap } from "lucide-react";

export function LightningMeter({ progress, total }: { progress: number; total: number }) {
  const pct = Math.min((progress / total) * 100, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Stage {progress}/{total}
        </span>
        <span className="flex items-center gap-0.5 text-storm-lightning font-medium">
          <Zap className="h-3 w-3" />
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-storm-accent to-storm-lightning transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
