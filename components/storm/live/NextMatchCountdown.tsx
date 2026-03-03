"use client";

import { useMemo } from "react";
import { Clock3, Radio } from "lucide-react";
import type { Match, Team } from "@/lib/types/storm";
import { useLiveStore } from "@/store/liveStore";

function formatRelative(ms: number): string {
  if (ms <= 0) return "LIVE NOW";
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function NextMatchCountdown({
  matches,
  teams,
}: {
  matches: Match[];
  teams: Team[];
}) {
  const nowMs = useLiveStore((s) => s.nowMs);

  const next = useMemo(() => {
    return matches
      .filter((m) => m.status !== "finished")
      .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())[0];
  }, [matches]);

  if (!next) return null;

  const home = teams.find((t) => t.id === next.homeTeamId);
  const away = teams.find((t) => t.id === next.awayTeamId);
  const msToKickoff = new Date(next.kickoff).getTime() - nowMs;
  const countdown = formatRelative(msToKickoff);

  return (
    <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-zinc-900/70 px-4 py-2.5">
      <div className="flex items-center gap-2 text-xs text-zinc-300">
        <Clock3 className="h-3.5 w-3.5 text-emerald-300" />
        <span className="font-medium">Next Match</span>
      </div>
      <div className="text-sm font-semibold text-white">
        {home?.code} vs {away?.code}
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
        {msToKickoff <= 0 && <Radio className="h-3.5 w-3.5 animate-pulse" />}
        {countdown}
      </div>
    </div>
  );
}
