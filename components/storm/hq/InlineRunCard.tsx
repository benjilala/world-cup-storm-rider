"use client";

import { Zap, Shield, TrendingUp, ChevronRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStormRunStore } from "@/store/stormRunStore";
import { useAuthStore } from "@/store/authStore";
import { STAGE_ORDER, STAGE_LABELS, LIGHTNING_MULTIPLIERS } from "@/config/storm";
import Link from "next/link";

export function InlineRunCard() {
  const { currentRun } = useStormRunStore();
  const { isAuthenticated, openAuthDialog } = useAuthStore();
  const run = currentRun;

  if (!run) {
    return (
      <div className="rounded-xl border border-border/50 bg-gradient-to-r from-storm-surface to-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-storm-gold/10">
              <Zap className="h-5 w-5 text-storm-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold">Start a Storm Run</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pick winners, ride the multipliers, vault your profits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-storm-gold" />Pick</span>
              <ChevronRight className="h-3 w-3" />
              <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-storm-vault" />Ride or Vault</span>
              <ChevronRight className="h-3 w-3" />
              <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-storm-live" />Win</span>
            </div>
            <Button
              size="sm"
              className="gap-1.5 bg-storm-gold text-storm-lightning-foreground font-bold h-8"
              onClick={() => !isAuthenticated && openAuthDialog()}
            >
              <Zap className="h-3.5 w-3.5" />
              Get Started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const completedStages = new Set(run.stageResults.map((r) => r.stage));
  const roi = ((run.currentValue / run.startingStake) * 100 - 100).toFixed(0);
  const lightningActive = run.lightningMultipliers.filter((lm) => lm.awarded).length;

  return (
    <div className="rounded-xl border border-storm-gold/20 bg-gradient-to-r from-storm-surface to-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-storm-gold/10">
            <Zap className="h-4 w-4 text-storm-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">Storm Run</p>
              <Badge
                className={`text-[10px] px-1.5 py-0 ${
                  run.status === "active"
                    ? "bg-storm-live/20 text-storm-live"
                    : run.status === "busted"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-storm-vault/20 text-storm-vault"
                }`}
              >
                {run.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">{STAGE_LABELS[run.currentStage]}</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          {STAGE_ORDER.map((stage) => {
            const done = completedStages.has(stage);
            const isCurrent = stage === run.currentStage;
            const result = run.stageResults.find((r) => r.stage === stage);
            return (
              <div
                key={stage}
                className={`flex h-6 w-6 items-center justify-center rounded-md text-[9px] font-bold transition-all ${
                  done
                    ? result?.isPerfect
                      ? "bg-storm-gold/20 text-storm-gold"
                      : "bg-storm-live/20 text-storm-live"
                    : isCurrent
                      ? "bg-storm-accent/20 text-storm-accent ring-1 ring-storm-accent/40"
                      : "bg-muted/30 text-muted-foreground/50"
                }`}
                title={STAGE_LABELS[stage]}
              >
                {done ? <CheckCircle2 className="h-3 w-3" /> : STAGE_ORDER.indexOf(stage) + 1}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold font-mono leading-none">
              ${run.currentValue.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">value</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold font-mono leading-none text-storm-vault">
              ${run.vaultBalance.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">vault</p>
          </div>
          <Badge variant="outline" className="text-[10px] text-storm-live gap-0.5">
            <TrendingUp className="h-3 w-3" />
            {roi}%
          </Badge>
          {lightningActive > 0 && (
            <Badge className="text-[10px] bg-storm-gold/20 text-storm-gold gap-0.5">
              <Zap className="h-3 w-3" />
              {lightningActive}x
            </Badge>
          )}
          {run.status === "active" && run.currentStage === "final" && (
            <Button asChild size="sm" className="gap-1 h-7 text-[10px] bg-storm-vault hover:bg-storm-vault/90">
              <Link href="/storm-the-cup/vault/chamber">
                <Shield className="h-3 w-3" />
                Vault Chamber
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
