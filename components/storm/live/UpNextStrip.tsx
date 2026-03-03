"use client";

import { useMemo } from "react";
import type { Match, Team } from "@/lib/types/storm";
import { useLiveStore } from "@/store/liveStore";

function fmt(ms: number): string {
  if (ms <= 0) return "LIVE";
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  return `${h}h ${rem}m`;
}

export function UpNextStrip({
  matches,
  teams,
}: {
  matches: Match[];
  teams: Team[];
}) {
  const nowMs = useLiveStore((s) => s.nowMs);

  const upcoming = useMemo(() => {
    return matches
      .filter((m) => m.status !== "finished")
      .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
      .slice(0, 3);
  }, [matches]);

  if (upcoming.length === 0) return null;

  return (
    <div className="rounded-lg border bg-zinc-900/60 p-3">
      <p className="mb-2 text-[11px] font-semibold tracking-widest text-zinc-400">UP NEXT</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {upcoming.map((match) => {
          const home = teams.find((t) => t.id === match.homeTeamId);
          const away = teams.find((t) => t.id === match.awayTeamId);
          const eta = fmt(new Date(match.kickoff).getTime() - nowMs);
          return (
            <div key={match.id} className="rounded-md border border-zinc-700 bg-zinc-950/60 px-3 py-2">
              <p className="text-xs font-semibold text-white">
                {home?.code} vs {away?.code}
              </p>
              <p className="text-[11px] text-zinc-400">{match.venue}</p>
              <p className="mt-1 text-[10px] font-semibold text-emerald-300">{eta}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
