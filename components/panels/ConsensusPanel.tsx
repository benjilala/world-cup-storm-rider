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
      .filter((e) => e.type === "CONSENSUS_FLIP" || e.type === "BIG_SWING")
      .slice(-40)
      .reverse()
      .map((e) => {
        const m = markets[e.eventId];
        const swing = m?.swing60s ?? e.delta ?? 0;
        return {
          id: e.id,
          type: e.type,
          eventName: e.eventName,
          league: e.league,
          aPct: m?.sideAPct ?? 0.5,
          swing,
          line: m?.line ?? e.line ?? 0.5,
        };
      });
  }, [consoleEvents, markets]);

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/35">
      <Table className="text-[12px]">
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="h-9 text-white/50">SIGNAL</TableHead>
            <TableHead className="h-9 text-white/50">EVENT</TableHead>
            <TableHead className="h-9 text-right text-white/50">A%</TableHead>
            <TableHead className="h-9 text-right text-white/50">SWING</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} className="border-white/10 hover:bg-white/5">
              <TableCell className="py-2">
                <span
                  className={cn(
                    "rounded-md border px-2 py-1 text-[10px] font-semibold tracking-widest",
                    r.type === "CONSENSUS_FLIP"
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200/90"
                      : "border-amber-400/30 bg-amber-400/10 text-amber-200/90",
                  )}
                >
                  {r.type === "CONSENSUS_FLIP" ? "FLIP" : "SWING"}
                </span>
              </TableCell>
              <TableCell className="py-2 font-medium text-white/85">
                <div className="truncate">{r.eventName}</div>
                <div className="truncate text-[10px] text-white/45">{r.league}</div>
              </TableCell>
              <TableCell className="py-2 text-right font-mono tabular-nums text-white/75">
                {fmtPct(r.aPct)}
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
              <TableCell colSpan={4} className="py-4 text-center text-white/45">
                Waiting for flips and swings…
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}

