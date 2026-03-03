"use client";

import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConsensusPanel } from "@/components/ConsensusPanel";
import { LineMovementPanel } from "@/components/LineMovementPanel";
import { LiveTape } from "@/components/LiveTape";
import { useSimStore } from "@/store/useSimStore";

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${Math.round(n)}`;
}

export function BottomConsole() {
  const eventCatalog = useSimStore((s) => s.eventCatalog);
  const markets = useSimStore((s) => s.markets);

  const hot = useMemo(() => {
    return eventCatalog
      .map((e) => {
        const m = markets[e.id];
        return {
          id: e.id,
          name: e.eventName,
          league: e.league,
          heat: m?.heatScore ?? 0,
          handle: m?.totalHandle5m ?? 0,
          bpm: m?.betsPerMin ?? 0,
        };
      })
      .sort((a, b) => b.heat - a.heat)
      .slice(0, 8);
  }, [eventCatalog, markets]);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <Card className="border-white/10 bg-black/55 backdrop-blur-xl">
        <CardHeader className="py-3">
          <CardTitle className="text-[11px] font-semibold tracking-widest text-white/80">
            HOT EVENTS
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[220px]">
            <Table className="text-[12px]">
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="h-8 text-white/50">EVENT</TableHead>
                  <TableHead className="h-8 text-right text-white/50">HEAT</TableHead>
                  <TableHead className="h-8 text-right text-white/50">5M</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hot.map((r) => (
                  <TableRow key={r.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="py-2 font-medium text-white/85">
                      <div className="truncate">{r.name}</div>
                      <div className="truncate text-[10px] text-white/45">{r.league}</div>
                    </TableCell>
                    <TableCell className="py-2 text-right font-mono tabular-nums text-white/75">
                      {(r.heat * 100).toFixed(0)}
                    </TableCell>
                    <TableCell className="py-2 text-right font-mono tabular-nums text-white/75">
                      {fmtMoney(r.handle)}
                    </TableCell>
                  </TableRow>
                ))}
                {hot.length === 0 ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={3} className="py-3 text-center text-white/45">
                      Waiting for ticks…
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-black/55 backdrop-blur-xl">
        <CardHeader className="py-3">
          <CardTitle className="text-[11px] font-semibold tracking-widest text-white/80">
            CONSENSUS SHIFTS
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[220px]">
            <ConsensusPanel />
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-black/55 backdrop-blur-xl">
        <CardHeader className="py-3">
          <CardTitle className="text-[11px] font-semibold tracking-widest text-white/80">
            LINE MOVEMENTS
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[220px]">
            <LineMovementPanel />
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-black/55 backdrop-blur-xl">
        <CardHeader className="py-3">
          <CardTitle className="text-[11px] font-semibold tracking-widest text-white/80">
            LIVE TAPE
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[220px]">
            <LiveTape />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

