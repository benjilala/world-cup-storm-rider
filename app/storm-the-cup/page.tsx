"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Radio, Zap, Shield, BarChart3, MessageCircle, X,
  Trophy, Users, ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroMatch } from "@/components/storm/hq/HeroMatch";
import { InlineRunCard } from "@/components/storm/hq/InlineRunCard";
import { CommunityPanel } from "@/components/storm/hq/CommunityPanel";
import { LiveScoresStrip } from "@/components/storm/live/LiveScoresStrip";
import { matches, teams, stats, activity, users } from "@/lib/mock/storm";
import { useLiveStore } from "@/store/liveStore";
import { useAuthStore } from "@/store/authStore";

function OnboardingHero() {
  const { openAuthDialog } = useAuthStore();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-storm-accent/30 bg-gradient-to-br from-storm-accent/8 via-storm-surface to-storm-gold/5 p-6 sm:p-8">
      <div className="relative z-10 max-w-lg">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-storm-gold" />
          <Badge className="bg-storm-gold/20 text-storm-gold text-[10px] font-bold">
            FIFA WORLD CUP 2026
          </Badge>
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Storm the Cup
        </h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-md">
          Build your bracket. Start Storm Runs. Ride or vault at every checkpoint.
          Compete with the community for the ultimate prediction crown.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-5">
          <Button
            size="sm"
            className="gap-1.5 bg-storm-gold text-storm-lightning-foreground font-bold hover:bg-storm-gold/90 h-9 px-5"
            onClick={() => openAuthDialog()}
          >
            <Zap className="h-3.5 w-3.5" />
            Join the Storm
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 h-9 text-xs" asChild>
            <Link href="/storm-the-cup/bracket">
              <Trophy className="h-3 w-3" />
              Build Bracket
            </Link>
          </Button>
        </div>
      </div>
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-storm-accent/5 blur-3xl" />
      <div className="absolute -bottom-12 right-12 h-32 w-32 rounded-full bg-storm-gold/5 blur-3xl" />
    </div>
  );
}

function QuickNavCard({
  href, icon: Icon, label, description, accent = "text-storm-accent",
}: {
  href: string;
  icon: typeof Zap;
  label: string;
  description: string;
  accent?: string;
}) {
  return (
    <Link
      href={href}
      className="group glass-panel rounded-xl px-4 py-3 flex items-center gap-3 transition-all hover:border-storm-accent/40 hover:shadow-lg"
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-storm-surface ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
    </Link>
  );
}

export default function TournamentHQ() {
  const hydrate = useLiveStore((s) => s.hydrate);
  const tickLive = useLiveStore((s) => s.tickLive);
  const addLiveBet = useLiveStore((s) => s.addLiveBet);
  const addChatMessage = useLiveStore((s) => s.addChatMessage);
  const addActivityEvent = useLiveStore((s) => s.addActivityEvent);
  const { isAuthenticated } = useAuthStore();

  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    hydrate();
    const timer = setInterval(() => {
      tickLive();

      if (Math.random() > 0.45) {
        const user = users[Math.floor(Math.random() * users.length)];
        const match = matches[Math.floor(Math.random() * matches.length)];
        const home = teams.find((t) => t.id === match.homeTeamId)?.name ?? "Home";
        const away = teams.find((t) => t.id === match.awayTeamId)?.name ?? "Away";
        const amount = Math.floor(Math.random() * 1500) + 40;

        addLiveBet({
          id: `live-bet-${Date.now()}`,
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

      if (Math.random() > 0.52) {
        const CHAT_LINES = [
          "Spain look locked in tonight",
          "Big value on the underdog",
          "Massive momentum swing",
          "Who is riding with Argentina?",
          "Lightning run still alive!",
          "Vault or ride? I'm riding",
          "That bracket is stacked",
          "Copy my picks, trust",
        ];
        const user = users[Math.floor(Math.random() * users.length)];
        addChatMessage({
          id: `chat-${Date.now()}`,
          userId: user.id,
          username: user.username,
          text: CHAT_LINES[Math.floor(Math.random() * CHAT_LINES.length)],
          timestamp: new Date().toISOString(),
          matchId: "global",
        });
      }

      if (Math.random() > 0.7) {
        const base = activity[Math.floor(Math.random() * activity.length)];
        addActivityEvent({
          ...base,
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
        });
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [hydrate, tickLive, addLiveBet, addChatMessage, addActivityEvent]);

  const liveCount = useMemo(
    () => matches.filter((m) => m.status === "live").length,
    [],
  );

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {/* Top stats strip */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-storm-gold" />
            <h1 className="text-lg font-bold tracking-wide sm:text-xl">TOURNAMENT HQ</h1>
          </div>
          {liveCount > 0 && (
            <Badge className="gap-1 bg-storm-live/20 text-storm-live text-[10px]">
              <Radio className="h-3 w-3 animate-pulse" />
              {liveCount} LIVE
            </Badge>
          )}
          <div className="ml-auto hidden sm:flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-storm-gold" />
              {stats.activeRuns.toLocaleString()} runs
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-storm-vault" />
              ${(stats.totalVaulted / 1_000_000).toFixed(1)}M vaulted
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-storm-accent" />
              ${stats.biggestPayout.toLocaleString()} top payout
            </span>
          </div>
        </div>

        {/* Onboarding hero for new users */}
        {!isAuthenticated && <OnboardingHero />}

        {/* Hero match */}
        <HeroMatch />

        {/* Inline storm run */}
        <InlineRunCard />

        {/* Quick navigation grid */}
        <div className="grid gap-3 sm:grid-cols-3">
          <QuickNavCard
            href="/storm-the-cup/live"
            icon={Radio}
            label="Live"
            description={liveCount > 0 ? `${liveCount} match${liveCount !== 1 ? "es" : ""} live now` : "Command centre"}
            accent="text-storm-live"
          />
          <QuickNavCard
            href="/storm-the-cup/bracket"
            icon={Trophy}
            label="Bracket"
            description="Build your path to the final"
            accent="text-storm-gold"
          />
          <QuickNavCard
            href="/storm-the-cup/community"
            icon={Users}
            label="Community"
            description="Leaderboards & experts"
            accent="text-storm-accent"
          />
        </div>

        {/* Live scores */}
        <LiveScoresStrip matches={matches} teams={teams} />
      </div>

      {/* Community panel — desktop sidebar */}
      <div className="hidden lg:flex w-[380px] shrink-0 border-l border-border/40 p-3">
        <CommunityPanel />
      </div>

      {/* Mobile chat FAB */}
      <button
        onClick={() => setChatOpen(true)}
        className="lg:hidden fixed bottom-16 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-storm-accent text-white shadow-lg shadow-storm-accent/25 active:scale-95 transition-transform"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      {/* Mobile chat drawer */}
      {chatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/60" onClick={() => setChatOpen(false)} />
          <div className="h-[70vh] bg-card border-t border-border/40 rounded-t-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <span className="text-sm font-bold">Community</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setChatOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CommunityPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
