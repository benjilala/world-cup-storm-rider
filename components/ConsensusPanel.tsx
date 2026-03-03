"use client";

import { useMemo } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useSimStore } from "@/store/useSimStore";

function fmtPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function fmtSwing(n: number) {
  const s = (n * 100).toFixed(1);
  return `${n >= 0 ? "+" : ""}${s}pts`;
}

export function ConsensusPanel() {
  const consoleEvents = useSimStore((s) => s.consoleEvents);
  const markets = useSimStore((s) => s.markets);

  const rows = useMemo(() => {
    return consoleEvents
      .filter((e) => e.type === "SWING" || e.type === "CONSENSUS_FLIP")
      .slice(-10)
      .reverse()
      .map((e) => {
        const m = markets[e.eventId];
        return {
          id: e.id,
          eventId: e.eventId,
          eventName: e.eventName,
          league: e.league,
          sideA: m?.sideAPct ?? 0.5,
          swing: m?.swing60s ?? e.delta ?? 0,
          type: e.type,
        };
      });
  }, [consoleEvents, markets]);

  return (
    <div className="overflow-hidden">
      <Table className="text-[12px]">
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="h-8 text-white/50">CONSENSUS SHIFTS</TableHead>
            <TableHead className="h-8 text-right text-white/50">A%</TableHead>
            <TableHead className="h-8 text-right text-white/50">SWING</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} className="border-white/10 hover:bg-white/5">
              <TableCell className="py-2 font-medium text-white/85">
                <div className="truncate">{r.eventName}</div>
                <div className="truncate text-[10px] text-white/45">{r.league}</div>
              </TableCell>
              <TableCell className="py-2 text-right font-mono tabular-nums text-white/75">
                {fmtPct(r.sideA)}
              </TableCell>
              <TableCell
                className={cn(
                  "py-2 text-right font-mono tabular-nums",
                  r.swing >= 0 ? "text-emerald-200/80" : "text-amber-200/80",
                )}
              >
                {fmtSwing(r.swing)}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 ? (
            <TableRow className="border-white/10">
              <TableCell colSpan={3} className="py-3 text-center text-white/45">
                Waiting for shifts…
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}

