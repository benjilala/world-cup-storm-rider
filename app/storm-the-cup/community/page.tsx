"use client";

import { useEffect } from "react";
import { Users, Copy, Trophy, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LeaderboardsTabs } from "@/components/storm/community/LeaderboardsTabs";
import { ExpertCarousel } from "@/components/storm/community/ExpertCarousel";
import { ActivityTicker } from "@/components/storm/community/ActivityTicker";
import { useLiveStore } from "@/store/liveStore";
import { leaderboards } from "@/lib/mock/storm";

export default function CommunityPage() {
  const hydrate = useLiveStore((s) => s.hydrate);
  const viewerCount = useLiveStore((s) => s.viewerCount);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const topRunner = leaderboards.roi[0];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-storm-accent" />
          <div>
            <h1 className="text-xl font-bold tracking-wide sm:text-2xl">COMMUNITY</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Leaderboards, experts, and live activity
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-storm-live animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">
            {viewerCount.toLocaleString()} online
          </span>
        </div>
      </div>

      {/* Featured: Copy a Bracket CTA */}
      {topRunner && (
        <Card className="border-storm-accent/30 bg-gradient-to-r from-storm-accent/5 to-transparent">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-storm-accent/10 shrink-0">
              <Trophy className="h-6 w-6 text-storm-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Copy a winning bracket</p>
              <p className="text-xs text-muted-foreground">
                {topRunner.username} is leading with {topRunner.label} ROI
              </p>
            </div>
            <Button size="sm" className="gap-1.5 bg-storm-accent hover:bg-storm-accent/90 shrink-0">
              <Copy className="h-3.5 w-3.5" />
              Copy Picks
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Leaderboard - wider */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4 text-storm-gold" />
              <h2 className="text-sm font-bold tracking-wide">LEADERBOARDS</h2>
            </div>
            <LeaderboardsTabs />
          </div>

          <ExpertCarousel />
        </div>

        {/* Activity sidebar */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-xl p-4 sticky top-4">
            <ActivityTicker />
          </div>
        </div>
      </div>
    </div>
  );
}
