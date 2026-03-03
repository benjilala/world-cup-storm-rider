"use client";

import { useMemo } from "react";

import { ArrowDown, ArrowUp } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useSimStore } from "@/store/useSimStore";

export function LineMovesPanel() {
  const consoleEvents = useSimStore((s) => s.consoleEvents);
  const markets = useSimStore((s) => s.markets);

  const rows = useMemo(() => {
    return consoleEvents
      .filter((e) => e.type === "LINE_MOVE" || e.type === "LINE_UP" || e.type === "LINE_DOWN")
      .slice(-40)
      .reverse()
      .map((e) => {
        const m = markets[e.eventId];
        const move = e.delta ?? m?.lineMove60s ?? 0;
        return {
          id: e.id,
          eventName: e.eventName,
          league: e.league,
          line: m?.line ?? e.line ?? 0.5,
          move,
        };
      });
  }, [consoleEvents, markets]);

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/35">
      <Table className="text-[12px]">
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="h-9 text-white/50">MOVE</TableHead>
            <TableHead className="h-9 text-white/50">EVENT</TableHead>
            <TableHead className="h-9 text-right text-white/50">LINE</TableHead>
            <TableHead className="h-9 text-right text-white/50">60S</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const up = r.move >= 0;
            return (
              <TableRow key={r.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="py-2">
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-black/30",
                      up ? "text-emerald-200/90" : "text-amber-200/90",
                    )}
                  >
                    {up ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </span>
                </TableCell>
                <TableCell className="py-2 font-medium text-white/85">
                  <div className="truncate">{r.eventName}</div>
                  <div className="truncate text-[10px] text-white/45">{r.league}</div>
                </TableCell>
                <TableCell className={cn("py-2 text-right font-mono tabular-nums", up ? "text-emerald-200/80" : "text-amber-200/80")}>
                  {r.line.toFixed(2)}
                </TableCell>
                <TableCell className={cn("py-2 text-right font-mono tabular-nums", up ? "text-emerald-200/80" : "text-amber-200/80")}>
                  {(Math.abs(r.move) * 100).toFixed(1)}pts
                </TableCell>
              </TableRow>
            );
          })}
          {rows.length === 0 ? (
            <TableRow className="border-white/10">
              <TableCell colSpan={4} className="py-4 text-center text-white/45">
                Waiting for line moves…
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}

