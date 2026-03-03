"use client";

import { useMemo } from "react";

import { ArrowDown, ArrowUp } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useSimStore } from "@/store/useSimStore";

export function LineMovementPanel() {
  const consoleEvents = useSimStore((s) => s.consoleEvents);
  const markets = useSimStore((s) => s.markets);

  const rows = useMemo(() => {
    return consoleEvents
      .filter((e) => e.type === "LINE_UP" || e.type === "LINE_DOWN")
      .slice(-10)
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
    <div className="overflow-hidden">
      <Table className="text-[12px]">
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="h-8 text-white/50">LINE MOVES</TableHead>
            <TableHead className="h-8 text-right text-white/50">LINE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const up = r.move >= 0;
            return (
              <TableRow key={r.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="py-2 font-medium text-white/85">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-black/30",
                        up ? "text-emerald-200/90" : "text-amber-200/90",
                      )}
                    >
                      {up ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate">{r.eventName}</div>
                      <div className="truncate text-[10px] text-white/45">{r.league}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={cn("py-2 text-right font-mono tabular-nums", up ? "text-emerald-200/80" : "text-amber-200/80")}>
                  {r.line.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
          {rows.length === 0 ? (
            <TableRow className="border-white/10">
              <TableCell colSpan={2} className="py-3 text-center text-white/45">
                Waiting for line moves…
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}

