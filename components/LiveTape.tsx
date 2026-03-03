"use client";

import { useMemo } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useSimStore } from "@/store/useSimStore";

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${Math.round(n)}`;
}

export function LiveTape() {
  const bets = useSimStore((s) => s.events);
  const highlightWhales = useSimStore((s) => s.toggles.highlightWhales);

  const rows = useMemo(() => {
    return bets
      .slice(-18)
      .reverse()
      .map((b) => {
        const note =
          b.kind === "whale"
            ? `WHALE ${b.side}`
            : b.kind === "sharp"
              ? `SHARP ${b.side}`
              : b.kind === "spike"
                ? `SPIKE ${b.side}`
                : `BET ${b.side}`;
        return { ...b, note };
      });
  }, [bets]);

  return (
    <div className="overflow-hidden">
      <Table className="text-[12px]">
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="h-8 text-white/50">LIVE TAPE</TableHead>
            <TableHead className="h-8 text-right text-white/50">STAKE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((t) => (
            <TableRow
              key={t.id}
              className={cn(
                "border-white/10 hover:bg-white/5",
                highlightWhales && t.kind === "whale" ? "bg-amber-500/5" : "",
              )}
            >
              <TableCell className="py-2 text-white/85">
                <div className={cn("truncate font-medium", t.kind === "whale" ? "text-amber-200/90" : "")}>
                  {t.note} · {t.eventName}
                </div>
                <div className="truncate text-[10px] text-white/45">
                  {t.country} · {t.channel} · {t.eventId}
                </div>
              </TableCell>
              <TableCell className={cn("py-2 text-right font-mono tabular-nums", t.kind === "whale" ? "text-amber-200/90" : "text-white/75")}>
                {fmtMoney(t.stake)}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 ? (
            <TableRow className="border-white/10">
              <TableCell colSpan={2} className="py-3 text-center text-white/45">
                Waiting for flow…
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}

