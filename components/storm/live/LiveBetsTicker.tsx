"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLiveStore } from "@/store/liveStore";

function rel(ts: string, now: number): string {
  const sec = Math.max(0, Math.floor((now - new Date(ts).getTime()) / 1000));
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  return `${min}m ago`;
}

export function LiveBetsTicker() {
  const bets = useLiveStore((s) => s.liveBets);
  const nowMs = useLiveStore((s) => s.nowMs);

  const biggest = useMemo(() => bets.reduce((acc, b) => (b.amount > acc.amount ? b : acc), bets[0]), [bets]);

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-widest text-zinc-300">LIVE BETS</p>
        {biggest && (
          <Badge variant="outline" className="text-[10px] text-amber-300">
            Biggest: ${biggest.amount.toLocaleString()}
          </Badge>
        )}
      </div>
      <ScrollArea className="h-[240px]">
        <div className="space-y-2">
          {bets.map((bet) => (
            <div key={bet.id} className="rounded-md border border-zinc-800 bg-zinc-900/60 p-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">{bet.avatar}</AvatarFallback>
                </Avatar>
                <p className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-100">{bet.username}</p>
                <Badge className={bet.isWhale ? "bg-amber-600 text-black" : "bg-emerald-700"}>
                  ${bet.amount}
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">{bet.label}</p>
              <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500">
                <span>{bet.market}</span>
                <span>{rel(bet.timestamp, nowMs)}</span>
              </div>
            </div>
          ))}
          {bets.length === 0 && <p className="text-xs text-zinc-500">No bets yet.</p>}
        </div>
      </ScrollArea>
    </div>
  );
}
