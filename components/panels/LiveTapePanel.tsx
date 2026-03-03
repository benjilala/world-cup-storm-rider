"use client";

import { useMemo, useState } from "react";

import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSimStore } from "@/store/useSimStore";

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${Math.round(n)}`;
}

export function LiveTapePanel() {
  const bets = useSimStore((s) => s.events);
  const highlightWhales = useSimStore((s) => s.toggles.highlightWhales);

  const [paused, setPaused] = useState(false);
  const [frozen, setFrozen] = useState<typeof bets>([]);

  const rows = useMemo(() => {
    const src = paused ? frozen : bets;
    return src
      .slice(-140)
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
  }, [bets, frozen, paused]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold tracking-widest text-white/60">
          LIVE TAPE
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-7 px-2 text-[11px]"
          onClick={() => {
            setPaused((p) => {
              const next = !p;
              if (next) setFrozen(bets);
              return next;
            });
          }}
        >
          {paused ? (
            <>
              <Play className="h-4 w-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          )}
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/35">
        <ScrollArea className="h-[64vh]">
          <div className="divide-y divide-white/10">
            {rows.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "px-3 py-2 hover:bg-white/5",
                  highlightWhales && t.kind === "whale" ? "bg-amber-500/5" : "",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className={cn("truncate text-[12px] font-medium text-white/85", t.kind === "whale" ? "text-amber-200/90" : "")}>
                    {t.note} · {t.eventName}
                  </div>
                  <div className={cn("shrink-0 font-mono text-[12px] tabular-nums", t.kind === "whale" ? "text-amber-200/90" : "text-white/75")}>
                    {fmtMoney(t.stake)}
                  </div>
                </div>
                <div className="mt-0.5 truncate text-[10px] text-white/45">
                  {t.country} · {t.channel} · {t.eventId}
                </div>
              </div>
            ))}
            {rows.length === 0 ? (
              <div className="py-8 text-center text-sm text-white/45">Waiting for flow…</div>
            ) : null}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

