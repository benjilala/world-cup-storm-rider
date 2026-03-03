"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSimStore } from "@/store/useSimStore";

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${Math.round(n)}`;
}

function fmtPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function fmtSwing(n: number) {
  const s = (n * 100).toFixed(1);
  return `${n >= 0 ? "+" : ""}${s}pts`;
}

export function EventIntelDrawer() {
  const selectedEventId = useSimStore((s) => s.selectedEventId);
  const selectEvent = useSimStore((s) => s.selectEvent);
  const eventCatalog = useSimStore((s) => s.eventCatalog);
  const markets = useSimStore((s) => s.markets);
  const cascades = useSimStore((s) => s.cascades);
  const nowMs = useSimStore((s) => s.nowMs);

  const ev = selectedEventId ? eventCatalog.find((e) => e.id === selectedEventId) : undefined;
  const m = selectedEventId ? markets[selectedEventId] : undefined;
  const c = selectedEventId ? cascades[selectedEventId] : undefined;

  const lineMove = m?.lineMove60s ?? 0;
  const lineUp = lineMove >= 0;

  return (
    <Sheet
      open={selectedEventId !== null}
      onOpenChange={(open) => {
        if (!open) selectEvent(null);
      }}
    >
      <SheetContent side="right" className="w-[420px] max-w-[92vw] border-white/10 bg-black/70 text-white backdrop-blur">
        <SheetHeader>
          <SheetTitle className="text-sm tracking-wide">EVENT INTEL</SheetTitle>
        </SheetHeader>

        {!ev ? (
          <div className="mt-4 text-sm text-white/70">Select an event on the map.</div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-white/90">{ev.eventName}</div>
                  <div className="truncate text-xs text-white/55">{ev.league}</div>
                </div>
                <Badge variant="secondary" className="shrink-0 uppercase tracking-wide">
                  {ev.sport}
                </Badge>
              </div>
              <div className="text-xs text-white/50">
                {ev.country} · starts {Math.max(0, Math.round((ev.startTimeMs - nowMs) / 60_000))}m
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div className="grid grid-cols-2 gap-3">
              <Card className="border-white/10 bg-black/30">
                <CardHeader className="py-3">
                  <CardTitle className="text-[11px] font-semibold tracking-widest text-white/60">HANDLE (5M)</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="font-mono text-lg tabular-nums text-white/85">{fmtMoney(m?.totalHandle5m ?? 0)}</div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-black/30">
                <CardHeader className="py-3">
                  <CardTitle className="text-[11px] font-semibold tracking-widest text-white/60">BPM (EST)</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="font-mono text-lg tabular-nums text-white/85">{Math.round(m?.betsPerMin ?? 0)}</div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-black/30">
                <CardHeader className="py-3">
                  <CardTitle className="text-[11px] font-semibold tracking-widest text-white/60">CONSENSUS (A)</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="font-mono text-lg tabular-nums text-white/85">{fmtPct(m?.sideAPct ?? 0.5)}</div>
                    <div className={cn("font-mono text-[12px] tabular-nums", (m?.swing60s ?? 0) >= 0 ? "text-emerald-200/80" : "text-amber-200/80")}>
                      {fmtSwing(m?.swing60s ?? 0)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-black/30">
                <CardHeader className="py-3">
                  <CardTitle className="text-[11px] font-semibold tracking-widest text-white/60">LINE</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-lg tabular-nums text-white/85">{(m?.line ?? 0.5).toFixed(2)}</div>
                    <div className={cn("inline-flex items-center gap-1 font-mono text-[12px] tabular-nums", lineUp ? "text-emerald-200/80" : "text-amber-200/80")}>
                      {lineUp ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      {(Math.abs(lineMove) * 100).toFixed(1)}pts
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="bg-white/10" />

            <Card className="border-white/10 bg-black/30">
              <CardHeader className="py-3">
                <CardTitle className="text-[11px] font-semibold tracking-widest text-white/60">CASCADE</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-[12px] text-white/70">
                {c && c.strength > 0.02 ? (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-white/85">
                        Active · bias {c.biasSide ?? "?"}
                      </div>
                      <div className="text-white/45">
                        rate ×{c.rateBoost.toFixed(2)} · strength {(c.strength * 100).toFixed(0)}%
                      </div>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-200/90 hover:bg-amber-500/20" variant="secondary">
                      COPY-TRADE
                    </Badge>
                  </div>
                ) : (
                  <div className="text-white/45">No active cascade.</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

