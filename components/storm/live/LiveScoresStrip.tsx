"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import type { Match, Team } from "@/lib/types/storm";
import { useLiveStore } from "@/store/liveStore";

export function LiveScoresStrip({
  matches,
  teams,
}: {
  matches: Match[];
  teams: Team[];
}) {
  const [mounted, setMounted] = useState(false);
  const matchClock = useLiveStore((s) => s.matchClock);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const live = matches.filter((m) => m.status === "live");
  if (live.length === 0) return null;

  return (
    <div className="rounded-xl border border-storm-live/20 bg-card p-3">
      <div className="mb-2 flex items-center gap-2">
        <Radio className="h-3.5 w-3.5 animate-pulse text-storm-live" />
        <p className="text-[10px] font-semibold tracking-widest text-storm-live">LIVE SCORES</p>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {live.map((match) => {
          const home = teams.find((t) => t.id === match.homeTeamId);
          const away = teams.find((t) => t.id === match.awayTeamId);
          const clock = matchClock[match.id] ?? 60;
          return (
            <Link
              key={match.id}
              href={`/storm-the-cup/match/${match.id}`}
              className="rounded-lg border border-border/40 bg-storm-surface px-3 py-2 transition-all hover:border-storm-live/30 hover:bg-storm-surface-hover"
            >
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{match.venue}</span>
                <span className="font-mono">{clock}&apos;</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm font-bold">
                <span>{home?.code}</span>
                <span className="text-storm-live font-mono">
                  {match.homeScore} - {match.awayScore}
                </span>
                <span>{away?.code}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted/30">
                <div
                  className="h-full rounded-full bg-storm-live/60"
                  style={{ width: `${Math.max(10, Math.round(match.crowdMoneyHome * 100))}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
