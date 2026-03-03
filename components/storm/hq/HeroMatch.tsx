"use client";

import { useEffect, useState, useMemo } from "react";
import { Radio, MapPin, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { matches, teams } from "@/lib/mock/storm";
import { useLiveStore } from "@/store/liveStore";
import { useBetSlipStore } from "@/store/betSlipStore";
import Link from "next/link";

function CrowdBar({ home, draw, away }: { home: number; draw: number; away: number }) {
  const total = home + draw + away;
  const hp = (home / total) * 100;
  const dp = (draw / total) * 100;
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
      <div className="bg-storm-accent" style={{ width: `${hp}%` }} />
      <div className="bg-muted-foreground/40" style={{ width: `${dp}%` }} />
      <div className="flex-1 bg-storm-ride/70" />
    </div>
  );
}

export function HeroMatch() {
  const matchClock = useLiveStore((s) => s.matchClock);
  const { openSlip } = useBetSlipStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const liveMatch = useMemo(
    () => matches.find((m) => m.status === "live"),
    []
  );

  const nextMatch = useMemo(
    () =>
      matches
        .filter((m) => m.status === "upcoming")
        .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())[0],
    []
  );

  const match = liveMatch ?? nextMatch;
  if (!match) return null;

  const home = teams.find((t) => t.id === match.homeTeamId);
  const away = teams.find((t) => t.id === match.awayTeamId);
  if (!home || !away) return null;

  const isLive = match.status === "live";
  const clock = mounted ? matchClock[match.id] : undefined;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-5 ${
        isLive
          ? "border-storm-live/40 animate-pulse-live"
          : "border-border/50"
      } bg-gradient-to-br from-storm-surface via-card to-storm-surface`}
    >
      <div className="flex items-center gap-2 mb-4">
        {match.group && (
          <Badge variant="outline" className="text-[10px]">{match.group}</Badge>
        )}
        {isLive ? (
          <Badge className="gap-1 bg-storm-live/20 text-storm-live text-[10px]">
            <Radio className="h-3 w-3 animate-pulse" />
            LIVE
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            NEXT UP
          </Badge>
        )}
        <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {match.venue}
        </span>
      </div>

      <div className="flex items-center justify-center gap-6 sm:gap-10">
        <div className="flex flex-col items-center gap-2">
          <img
            src={home.flag}
            alt={home.code}
            className="h-12 w-16 rounded-md object-cover shadow-lg sm:h-14 sm:w-20"
          />
          <p className="text-lg font-bold tracking-wide">{home.code}</p>
          <p className="text-[10px] text-muted-foreground">{home.name}</p>
        </div>

        <div className="flex flex-col items-center gap-1">
          {isLive && mounted ? (
            <>
              <p className="text-4xl font-bold font-mono tracking-wider sm:text-5xl">
                {match.homeScore}
                <span className="mx-2 text-muted-foreground/50">:</span>
                {match.awayScore}
              </p>
              {clock !== undefined && (
                <Badge className="bg-storm-live/10 text-storm-live text-xs font-mono">
                  {clock}&apos; min
                </Badge>
              )}
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-muted-foreground">vs</p>
              <Countdown kickoff={match.kickoff} />
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <img
            src={away.flag}
            alt={away.code}
            className="h-12 w-16 rounded-md object-cover shadow-lg sm:h-14 sm:w-20"
          />
          <p className="text-lg font-bold tracking-wide">{away.code}</p>
          <p className="text-[10px] text-muted-foreground">{away.name}</p>
        </div>
      </div>

      {isLive && (
        <div className="mt-4 space-y-1">
          <CrowdBar
            home={match.crowdPickHome}
            draw={match.crowdPickDraw}
            away={match.crowdPickAway}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{(match.crowdPickHome * 100).toFixed(0)}% {home.code}</span>
            <span>Draw</span>
            <span>{away.code} {(match.crowdPickAway * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 justify-center">
        {isLive ? (
          <Button size="sm" className="gap-1.5 bg-storm-accent hover:bg-storm-accent/90 h-8" onClick={openSlip}>
            Place Bet
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" asChild>
            <Link href={`/storm-the-cup/match/${match.id}`}>
              Match Preview
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function Countdown({ kickoff }: { kickoff: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const diff = new Date(kickoff).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Starting soon");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [kickoff]);

  if (!mounted) return null;

  return (
    <p className="text-xs font-mono text-storm-gold">{timeLeft}</p>
  );
}
