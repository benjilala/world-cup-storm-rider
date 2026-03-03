"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Radio, Eye, TrendingUp, MessageCircle,
  Activity, ChevronRight, MapPin, Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLiveStore } from "@/store/liveStore";
import { useBetSlipStore } from "@/store/betSlipStore";
import { matches, teams, users, activity, oddsHistory } from "@/lib/mock/storm";

function rel(ts: string, now: number): string {
  const sec = Math.max(0, Math.floor((now - new Date(ts).getTime()) / 1000));
  if (sec < 5) return "now";
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m`;
}

function MatchSelector({
  liveMatches,
  selectedId,
  onSelect,
}: {
  liveMatches: typeof matches;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const matchClock = useLiveStore((s) => s.matchClock);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {liveMatches.map((match) => {
        const home = teams.find((t) => t.id === match.homeTeamId);
        const away = teams.find((t) => t.id === match.awayTeamId);
        const active = match.id === selectedId;
        const clock = matchClock[match.id] ?? 60;

        return (
          <button
            key={match.id}
            onClick={() => onSelect(match.id)}
            className={`shrink-0 rounded-lg border px-3 py-2 transition-all ${
              active
                ? "border-storm-live/50 bg-storm-live/10 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                : "border-border/30 bg-storm-surface hover:border-border/60"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <span>{home?.code}</span>
                <span className="text-storm-live font-mono text-xs">
                  {match.homeScore}-{match.awayScore}
                </span>
                <span>{away?.code}</span>
              </div>
              <Badge className="bg-storm-live/20 text-storm-live text-[9px] px-1 py-0 h-4">
                {clock}&apos;
              </Badge>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FeaturedMatch({ matchId }: { matchId: string }) {
  const matchClock = useLiveStore((s) => s.matchClock);
  const { openSlip } = useBetSlipStore();

  const match = matches.find((m) => m.id === matchId);
  if (!match) return null;

  const home = teams.find((t) => t.id === match.homeTeamId);
  const away = teams.find((t) => t.id === match.awayTeamId);
  const clock = matchClock[match.id] ?? 60;

  const totalPick = match.crowdPickHome + match.crowdPickDraw + match.crowdPickAway;
  const homePct = Math.round((match.crowdPickHome / totalPick) * 100);
  const awayPct = Math.round((match.crowdPickAway / totalPick) * 100);
  const drawPct = 100 - homePct - awayPct;

  return (
    <div className="glass-panel rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-storm-live animate-pulse" />
          <span className="text-[10px] font-semibold tracking-widest text-storm-live">LIVE</span>
          {match.group && (
            <Badge variant="outline" className="text-[9px] h-4">{match.group}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{match.venue}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 sm:gap-12">
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold tracking-wide sm:text-3xl">{home?.code}</span>
          <span className="text-[10px] text-muted-foreground">{home?.name}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-4xl font-bold font-mono tracking-wider sm:text-5xl">
            {match.homeScore}
            <span className="mx-2 text-muted-foreground/40">:</span>
            {match.awayScore}
          </p>
          <Badge className="bg-storm-live/10 text-storm-live text-xs font-mono h-5">
            {clock}&apos;
          </Badge>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold tracking-wide sm:text-3xl">{away?.code}</span>
          <span className="text-[10px] text-muted-foreground">{away?.name}</span>
        </div>
      </div>

      {/* Consensus bar */}
      <div className="space-y-1">
        <div className="flex h-2 overflow-hidden rounded-full">
          <div className="bg-storm-accent/70 transition-all duration-500" style={{ width: `${homePct}%` }} />
          <div className="bg-muted-foreground/30 transition-all duration-500" style={{ width: `${drawPct}%` }} />
          <div className="bg-storm-ride/60 transition-all duration-500 flex-1" />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{homePct}% {home?.code}</span>
          <span>{drawPct}% Draw</span>
          <span>{away?.code} {awayPct}%</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" className="gap-1.5 bg-storm-accent hover:bg-storm-accent/90 h-8 text-xs" onClick={openSlip}>
          Quick Bet
          <ChevronRight className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" asChild>
          <Link href={`/storm-the-cup/match/${matchId}`}>
            Full Match
            <ChevronRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function OddsStrip({ matchId }: { matchId: string }) {
  const matchOdds = oddsHistory.filter((o) => o.matchId === matchId);
  if (matchOdds.length < 2) return null;

  const selections = [...new Set(matchOdds.map((o) => o.selectionId))];

  return (
    <div className="glass-panel rounded-xl p-3 space-y-2">
      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">ODDS MOVEMENT</p>
      <div className="grid gap-2">
        {selections.slice(0, 3).map((selId) => {
          const points = matchOdds.filter((o) => o.selectionId === selId);
          const latest = points[points.length - 1];
          const prev = points.length > 1 ? points[points.length - 2] : latest;
          if (!latest) return null;
          const diff = latest.odds - (prev?.odds ?? latest.odds);
          const up = diff >= 0;

          return (
            <div key={selId} className="flex items-center justify-between rounded-lg bg-storm-surface px-3 py-2">
              <span className="text-xs font-medium truncate">{selId}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold">{latest.odds.toFixed(2)}</span>
                <span className={`text-[10px] font-mono ${up ? "text-storm-live" : "text-storm-ride"}`}>
                  {up ? "+" : ""}{(diff).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveBetsFeed() {
  const bets = useLiveStore((s) => s.liveBets);
  const nowMs = useLiveStore((s) => s.nowMs);
  const recent = useMemo(() => bets.slice(0, 40), [bets]);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {recent.map((bet) => (
          <div
            key={bet.id}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 animate-slide-in-from-top ${
              bet.isWhale
                ? "bg-storm-whale/5 border border-storm-whale/20 animate-whale-flash"
                : "hover:bg-storm-surface/60"
            }`}
          >
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarFallback className="text-[9px] bg-storm-surface">{bet.avatar}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold">{bet.username}</span>
              <p className="text-[10px] text-muted-foreground truncate">{bet.label}</p>
            </div>
            <span className={`text-[11px] font-mono font-bold shrink-0 ${bet.isWhale ? "text-storm-whale" : "text-foreground"}`}>
              ${bet.amount.toLocaleString()}
            </span>
            <span className="text-[9px] text-muted-foreground shrink-0">
              {rel(bet.timestamp, nowMs)}
            </span>
          </div>
        ))}
        {recent.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">Waiting for bets...</p>
        )}
      </div>
    </ScrollArea>
  );
}

function ActivityFeed() {
  const activityFeed = useLiveStore((s) => s.activityFeed);
  const nowMs = useLiveStore((s) => s.nowMs);
  const recent = useMemo(() => activityFeed.slice(0, 30), [activityFeed]);

  const typeColor: Record<string, string> = {
    bet_placed: "text-storm-accent",
    run_started: "text-storm-lightning",
    stage_cleared: "text-storm-live",
    vault_decision: "text-storm-vault",
    lightning_awarded: "text-storm-gold",
    perfect_stage: "text-storm-perfect",
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {recent.map((ev) => (
          <div key={ev.id} className="flex items-start gap-2 rounded-lg px-2.5 py-1.5 hover:bg-storm-surface/60">
            <div className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${typeColor[ev.type] ?? "text-muted-foreground"} bg-current`} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px]">
                <span className="font-semibold">{ev.username}</span>{" "}
                <span className="text-muted-foreground">{ev.description}</span>
              </p>
            </div>
            <span className="text-[9px] text-muted-foreground shrink-0">
              {rel(ev.timestamp, nowMs)}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export default function LiveCommandCentre() {
  const hydrate = useLiveStore((s) => s.hydrate);
  const tickLive = useLiveStore((s) => s.tickLive);
  const addLiveBet = useLiveStore((s) => s.addLiveBet);
  const addChatMessage = useLiveStore((s) => s.addChatMessage);
  const addActivityEvent = useLiveStore((s) => s.addActivityEvent);
  const viewerCount = useLiveStore((s) => s.viewerCount);

  const [mounted, setMounted] = useState(false);

  const liveMatches = useMemo(() => matches.filter((m) => m.status === "live"), []);
  const [selectedMatchId, setSelectedMatchId] = useState(liveMatches[0]?.id ?? "");

  useEffect(() => {
    setMounted(true);
    hydrate();
    const timer = setInterval(() => {
      tickLive();

      if (Math.random() > 0.4) {
        const user = users[Math.floor(Math.random() * users.length)];
        const match = matches[Math.floor(Math.random() * matches.length)];
        const home = teams.find((t) => t.id === match.homeTeamId)?.name ?? "Home";
        const away = teams.find((t) => t.id === match.awayTeamId)?.name ?? "Away";
        const amount = Math.floor(Math.random() * 1500) + 40;
        addLiveBet({
          id: `live-bet-${Date.now()}-${Math.random()}`,
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          amount,
          label: `$${amount} on ${home} vs ${away}`,
          market: "1X2",
          timestamp: new Date().toISOString(),
          isWhale: amount >= 500,
        });
      }

      if (Math.random() > 0.5) {
        const LINES = [
          "Spain look locked in tonight", "Big value on the underdog",
          "Massive momentum swing", "Who is riding with Argentina?",
          "Lightning run still alive!", "Vault or ride? I'm riding",
          "That bracket is stacked", "Copy my picks trust",
        ];
        const user = users[Math.floor(Math.random() * users.length)];
        addChatMessage({
          id: `chat-${Date.now()}-${Math.random()}`,
          userId: user.id,
          username: user.username,
          text: LINES[Math.floor(Math.random() * LINES.length)],
          timestamp: new Date().toISOString(),
          matchId: "global",
        });
      }

      if (Math.random() > 0.65) {
        const base = activity[Math.floor(Math.random() * activity.length)];
        addActivityEvent({
          ...base,
          id: `act-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
        });
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [hydrate, tickLive, addLiveBet, addChatMessage, addActivityEvent]);

  if (liveMatches.length === 0) {
    const nextMatch = matches
      .filter((m) => m.status === "upcoming")
      .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())[0];

    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-storm-surface mb-4">
          <Radio className="h-10 w-10 text-muted-foreground/20" />
        </div>
        <h2 className="text-xl font-bold">No Matches Live</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          The command centre activates when matches go live. Check back soon.
        </p>
        {nextMatch && (
          <Button variant="outline" className="mt-4 gap-2" asChild>
            <Link href={`/storm-the-cup/match/${nextMatch.id}`}>
              Next Match Preview
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Left: Match content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-storm-live animate-pulse" />
            <h1 className="text-lg font-bold tracking-wide">LIVE COMMAND CENTRE</h1>
            <Badge className="bg-storm-live/20 text-storm-live text-[10px]">
              {liveMatches.length} LIVE
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span className="font-mono">{mounted ? viewerCount.toLocaleString() : "---"}</span>
            <span>watching</span>
          </div>
        </div>

        {/* Match selector ribbon */}
        {liveMatches.length > 1 && (
          <MatchSelector
            liveMatches={liveMatches}
            selectedId={selectedMatchId}
            onSelect={setSelectedMatchId}
          />
        )}

        {/* Featured match */}
        <FeaturedMatch matchId={selectedMatchId} />

        {/* Odds strip */}
        <OddsStrip matchId={selectedMatchId} />

        {/* All live scores (compact) */}
        {liveMatches.length > 1 && (
          <div className="glass-panel rounded-xl p-3">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground mb-2">ALL LIVE SCORES</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {liveMatches.map((m) => {
                const h = teams.find((t) => t.id === m.homeTeamId);
                const a = teams.find((t) => t.id === m.awayTeamId);
                return (
                  <Link
                    key={m.id}
                    href={`/storm-the-cup/match/${m.id}`}
                    className="flex items-center justify-between rounded-lg bg-storm-surface px-3 py-2 hover:bg-storm-surface-hover transition-colors"
                  >
                    <span className="text-xs font-bold">{h?.code}</span>
                    <span className="text-xs font-mono font-bold text-storm-live">
                      {m.homeScore} - {m.awayScore}
                    </span>
                    <span className="text-xs font-bold">{a?.code}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right: Feed tabs */}
      <div className="lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-border/40 flex flex-col h-[50vh] lg:h-full">
        <Tabs defaultValue="bets" className="flex flex-1 flex-col overflow-hidden">
          <div className="px-3 pt-3">
            <TabsList className="bg-storm-surface h-8 w-full">
              <TabsTrigger value="bets" className="text-[10px] gap-1 h-6 flex-1">
                <TrendingUp className="h-3 w-3" />
                Bets
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-[10px] gap-1 h-6 flex-1">
                <MessageCircle className="h-3 w-3" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-[10px] gap-1 h-6 flex-1">
                <Activity className="h-3 w-3" />
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="bets" className="flex-1 overflow-hidden mt-0">
            <LiveBetsFeed />
          </TabsContent>
          <TabsContent value="chat" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
            <ChatFeedInline />
          </TabsContent>
          <TabsContent value="activity" className="flex-1 overflow-hidden mt-0">
            <ActivityFeed />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ChatFeedInline() {
  const chatFeed = useLiveStore((s) => s.chatFeed);
  const addChatMessage = useLiveStore((s) => s.addChatMessage);
  const nowMs = useLiveStore((s) => s.nowMs);
  const [text, setText] = useState("");

  const rows = useMemo(() => chatFeed.slice(-80), [chatFeed]);

  const send = () => {
    if (!text.trim()) return;
    addChatMessage({
      id: `chat-${Date.now()}-${Math.random()}`,
      userId: "user-1",
      username: "You",
      text: text.trim(),
      timestamp: new Date().toISOString(),
      matchId: "global",
    });
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {rows.map((msg) => (
            <div key={msg.id} className="rounded px-2 py-1 hover:bg-storm-surface/60 transition-colors">
              <span className="inline-flex items-center gap-1">
                <span className="text-[11px] font-semibold text-storm-accent">{msg.username}</span>
                <span className="text-[10px] text-muted-foreground">{rel(msg.timestamp, nowMs)}</span>
              </span>
              <p className="text-xs text-foreground/90 leading-relaxed">{msg.text}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t border-border/30 p-2">
        <div className="flex gap-1.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say something..."
            className="flex-1 h-8 rounded-md bg-storm-surface border border-border/30 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-storm-accent"
          />
          <Button className="h-8 w-8 shrink-0 p-0" onClick={send}>
            <MessageCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
