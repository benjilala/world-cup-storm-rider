"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSimStore } from "@/store/useSimStore";

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${Math.round(n)}`;
}

export function OverviewPanel() {
  const markets = useSimStore((s) => s.markets);
  const cascades = useSimStore((s) => s.cascades);
  const intensityMode = useSimStore((s) => s.intensityMode);

  const stats = useMemo(() => {
    const ms = Object.values(markets);
    const totalHandle = ms.reduce((acc, m) => acc + (m?.totalHandle5m ?? 0), 0);
    const totalBpm = ms.reduce((acc, m) => acc + (m?.betsPerMin ?? 0), 0);
    const avgLine = ms.length ? ms.reduce((acc, m) => acc + (m?.line ?? 0.5), 0) / ms.length : 0.5;
    const activeCascades = Object.values(cascades).filter((c) => (c?.strength ?? 0) > 0.08).length;
    return { totalHandle, totalBpm, avgLine, activeCascades, markets: ms.length };
  }, [cascades, markets]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[12px] text-white/70">
          Global synthetic market pulse (5-minute memory).
        </div>
        <Badge variant="secondary" className="uppercase tracking-wide">
          {intensityMode}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="border-white/10 bg-black/35">
          <CardHeader className="py-3">
            <CardTitle className="text-[11px] font-semibold tracking-widest text-white/60">
              TOTAL LIQUIDITY (5M)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-mono text-2xl tabular-nums text-white/90">
              {fmtMoney(stats.totalHandle)}
            </div>
            <div className="mt-1 text-[11px] text-white/45">
              Across {stats.markets} markets
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/35">
          <CardHeader className="py-3">
            <CardTitle className="text-[11px] font-semibold tracking-widest text-white/60">
              ACTIVITY (BPM)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-mono text-2xl tabular-nums text-white/90">
              {Math.round(stats.totalBpm)}
            </div>
            <div className="mt-1 text-[11px] text-white/45">
              Aggregate bets per minute (est.)
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/35">
          <CardHeader className="py-3">
            <CardTitle className="text-[11px] font-semibold tracking-widest text-white/60">
              ACTIVE COPY WAVES
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div
              className={cn(
                "font-mono text-2xl tabular-nums",
                stats.activeCascades > 0 ? "text-amber-200/90" : "text-white/90",
              )}
            >
              {stats.activeCascades}
            </div>
            <div className="mt-1 text-[11px] text-white/45">
              Whale hits, flips, swings, and line moves can trigger waves
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/35">
          <CardHeader className="py-3">
            <CardTitle className="text-[11px] font-semibold tracking-widest text-white/60">
              AVG PRICE INDEX
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="font-mono text-2xl tabular-nums text-white/90">
              {stats.avgLine.toFixed(2)}
            </div>
            <div className="mt-1 text-[11px] text-white/45">
              Bounded 0.20–0.80
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

