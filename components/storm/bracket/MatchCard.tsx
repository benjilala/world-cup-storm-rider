"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Match } from "@/lib/types/storm";
import type { OddsMovement } from "@/lib/odds";
import { teams, getMatchOdds } from "@/lib/mock/storm";
import { CrowdBars } from "./CrowdBars";
import { AuthGate } from "@/components/auth/AuthGate";
import { useBetSlipStore } from "@/store/betSlipStore";

function MovementIcon({ movement }: { movement: OddsMovement }) {
  if (movement === "up") return <TrendingUp className="h-2.5 w-2.5 text-storm-live" />;
  if (movement === "down") return <TrendingDown className="h-2.5 w-2.5 text-storm-ride" />;
  return <Minus className="h-2 w-2 text-muted-foreground/40" />;
}

export function MatchCard({ match }: { match: Match }) {
  const home = teams.find((t) => t.id === match.homeTeamId);
  const away = teams.find((t) => t.id === match.awayTeamId);
  const { addSelection, selections } = useBetSlipStore();
  const odds = getMatchOdds(match.id);

  const inSlip = (selId: string) => selections.some((s) => s.id === selId);

  const handleAdd = (side: "home" | "draw" | "away") => {
    const selId = side === "home" ? `sel-h-${match.id}` : side === "draw" ? `sel-d-${match.id}` : `sel-a-${match.id}`;
    const label =
      side === "home" ? `${home?.name ?? "Home"} to win`
      : side === "draw" ? `${home?.code ?? "?"} vs ${away?.code ?? "?"} Draw`
      : `${away?.name ?? "Away"} to win`;
    const oddsVal = side === "home" ? odds.home : side === "draw" ? odds.draw : odds.away;

    addSelection({
      id: selId,
      marketId: `mkt-1x2-${match.id}`,
      matchId: match.id,
      label,
      odds: oddsVal,
    });
  };

  const cells: { side: "home" | "draw" | "away"; label: string; value: number; movement: OddsMovement; selId: string }[] = [
    { side: "home", label: home?.code ?? "1", value: odds.home, movement: odds.homeMovement, selId: `sel-h-${match.id}` },
    { side: "draw", label: "X", value: odds.draw, movement: odds.drawMovement, selId: `sel-d-${match.id}` },
    { side: "away", label: away?.code ?? "2", value: odds.away, movement: odds.awayMovement, selId: `sel-a-${match.id}` },
  ];

  return (
    <Card className="hover:border-storm-accent/30 transition-colors">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {match.group && (
              <Badge variant="outline" className="text-[10px]">
                {match.group}
              </Badge>
            )}
            {match.status === "live" && (
              <Badge className="gap-1 bg-storm-ride text-storm-ride-foreground text-[10px]">
                <Radio className="h-2.5 w-2.5 animate-pulse" />
                LIVE
              </Badge>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {new Date(match.kickoff).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        <Link href={`/storm-the-cup/match/${match.id}`} className="block">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm font-medium">{home?.code}</span>
            </div>
            <div className="text-center px-3">
              {match.status === "finished" || match.status === "live" ? (
                <span className="text-sm font-bold font-mono">
                  {match.homeScore} - {match.awayScore}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">vs</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="text-sm font-medium">{away?.code}</span>
            </div>
          </div>
        </Link>

        <CrowdBars match={match} />

        {/* Odds row */}
        <div className="grid grid-cols-3 gap-1">
          {cells.map((cell) => {
            const active = inSlip(cell.selId);
            return (
              <AuthGate
                key={cell.side}
                intent={{ type: "add_to_slip", selectionId: cell.selId, marketId: `mkt-1x2-${match.id}` }}
                fallbackLabel="Sign in"
              >
                <button
                  onClick={() => handleAdd(cell.side)}
                  className={
                    "flex flex-col items-center gap-0.5 rounded-md border px-1.5 py-1.5 transition-all text-center " +
                    (active
                      ? "border-storm-accent/60 bg-storm-accent/10 shadow-[0_0_8px_rgba(85,130,230,0.12)]"
                      : "border-border/40 bg-storm-surface/40 hover:border-storm-accent/30 hover:bg-storm-surface")
                  }
                >
                  <span className="text-[9px] text-muted-foreground leading-none">{cell.label}</span>
                  <span className="flex items-center gap-0.5">
                    <span className={`text-xs font-mono font-bold leading-none ${active ? "text-storm-accent" : ""}`}>
                      {cell.value.toFixed(2)}
                    </span>
                    <MovementIcon movement={cell.movement} />
                  </span>
                </button>
              </AuthGate>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
