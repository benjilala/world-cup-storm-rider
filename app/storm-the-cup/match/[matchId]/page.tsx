"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Radio, Calendar, MapPin } from "lucide-react";
import { matches, teams, markets, chat, oddsHistory } from "@/lib/mock/storm";
import { StreamEmbed } from "@/components/storm/match/StreamEmbed";
import { MatchChat } from "@/components/storm/match/MatchChat";
import { OddsSparkline } from "@/components/storm/match/OddsSparkline";
import { QuickMarketsSheet } from "@/components/storm/match/QuickMarketsSheet";
import { CrowdBars } from "@/components/storm/bracket/CrowdBars";

export default function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const match = matches.find((m) => m.id === matchId);
  const home = match ? teams.find((t) => t.id === match.homeTeamId) : null;
  const away = match ? teams.find((t) => t.id === match.awayTeamId) : null;
  const matchMarkets = markets.filter((m) => m.matchId === matchId);
  const matchChat = chat.filter((c) => c.matchId === matchId);
  const matchOdds = oddsHistory.filter((o) => o.matchId === matchId);

  if (!match) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Match not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Match Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          {match.group && <Badge variant="outline">{match.group}</Badge>}
          {match.status === "live" && (
            <Badge className="gap-1 bg-storm-ride text-storm-ride-foreground">
              <Radio className="h-3 w-3 animate-pulse" />
              LIVE
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{home?.code}</p>
            <p className="text-xs text-muted-foreground">{home?.name}</p>
          </div>
          <div className="text-center">
            {match.status !== "upcoming" ? (
              <p className="text-3xl font-bold font-mono">
                {match.homeScore} - {match.awayScore}
              </p>
            ) : (
              <p className="text-lg text-muted-foreground">vs</p>
            )}
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{away?.code}</p>
            <p className="text-xs text-muted-foreground">{away?.name}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(match.kickoff).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {match.venue}
          </span>
        </div>
      </div>

      {/* Crowd Data */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Crowd Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <CrowdBars match={match} />
          <div className="flex justify-between text-xs mt-2">
            <span>{home?.code} picks</span>
            <span>Draw</span>
            <span>{away?.code} picks</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <StreamEmbed />

          {matchMarkets.length > 0 && (
            <div className="flex items-center gap-2">
              <QuickMarketsSheet markets={matchMarkets} matchId={matchId} />
              <span className="text-xs text-muted-foreground">
                {matchMarkets.length} markets available
              </span>
            </div>
          )}

          {matchOdds.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <OddsSparkline data={matchOdds} />
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Match Chat</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <MatchChat messages={matchChat} matchId={matchId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
