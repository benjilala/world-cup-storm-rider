"use client";

import { useLiveStore } from "@/store/liveStore";
import { Badge } from "@/components/ui/badge";
import { Zap, Trophy, Shield, Radio, TrendingUp } from "lucide-react";
import type { ActivityEvent } from "@/lib/types/storm";

const EVENT_ICONS: Record<ActivityEvent["type"], typeof Zap> = {
  bet_placed: TrendingUp,
  run_started: Zap,
  stage_cleared: Trophy,
  vault_decision: Shield,
  lightning_awarded: Zap,
  perfect_stage: Trophy,
};

export function ActivityTicker() {
  const { activityFeed } = useLiveStore();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Radio className="h-3.5 w-3.5 text-storm-ride animate-pulse" />
        <span className="text-sm font-medium">Live Activity</span>
      </div>
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
        {activityFeed.map((event) => {
          const Icon = EVENT_ICONS[event.type];
          return (
            <div
              key={event.id}
              className="flex items-start gap-2 rounded-md border bg-card/50 p-2 text-xs"
            >
              <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-storm-accent" />
              <div className="flex-1 min-w-0">
                <span className="font-medium">{event.username}</span>{" "}
                <span className="text-muted-foreground">{event.description}</span>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {new Date(event.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
