"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap } from "lucide-react";
import { runs } from "@/lib/mock/storm";
import { STAGE_LABELS } from "@/config/storm";
import Link from "next/link";

export function LastStormStanding() {
  const activeRuns = runs.filter((r) => r.status === "active");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Trophy className="h-4 w-4 text-storm-lightning" />
          Last Storm Standing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {activeRuns.map((run) => (
          <Link
            key={run.id}
            href={`/storm-the-cup/run/${run.id}`}
            className="flex items-center gap-3 rounded-lg border p-3 hover:border-storm-accent/30 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{run.username.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{run.username}</p>
              <p className="text-[10px] text-muted-foreground">
                {STAGE_LABELS[run.currentStage]}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono font-bold">${run.currentValue.toLocaleString()}</p>
              <div className="flex items-center gap-0.5 justify-end">
                <Zap className="h-3 w-3 text-storm-lightning" />
                <span className="text-[10px] text-muted-foreground">
                  {run.lightningMultipliers.filter((lm) => lm.awarded).length}x earned
                </span>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
