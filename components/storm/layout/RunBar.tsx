"use client";

import { useState } from "react";
import { Zap, Shield, TrendingUp, FastForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStormRunStore } from "@/store/stormRunStore";
import { useAuthStore } from "@/store/authStore";
import { STAGE_ORDER, STAGE_LABELS } from "@/config/storm";

function StageDots({ currentStage, stageResults }: { currentStage: string; stageResults: { stage: string }[] }) {
  const completedStages = new Set(stageResults.map((r) => r.stage));

  return (
    <div className="flex items-center gap-1.5">
      {STAGE_ORDER.map((stage, i) => {
        const done = completedStages.has(stage);
        const isCurrent = stage === currentStage;
        return (
          <div key={stage} className="flex items-center gap-1.5">
            <div
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                done
                  ? "bg-storm-live scale-100"
                  : isCurrent
                    ? "bg-storm-gold animate-pulse scale-110"
                    : "bg-muted-foreground/30"
              }`}
              title={STAGE_LABELS[stage]}
            />
            {i < STAGE_ORDER.length - 1 && (
              <div className={`h-px w-3 ${done ? "bg-storm-live/50" : "bg-muted-foreground/15"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function RunBar() {
  const { currentRun, makeDecision, awardLightning, startRun, simulateStageComplete, clearRun } = useStormRunStore();
  const { isAuthenticated, openAuthDialog } = useAuthStore();
  const [showStakePicker, setShowStakePicker] = useState(false);
  const [stake, setStake] = useState(100);

  const run = currentRun;

  const pendingDecision = run
    ? run.stageResults.find((r) => r.stage === run.currentStage && !r.decision)
    : null;

  const handleStartRun = () => {
    if (!isAuthenticated) {
      openAuthDialog();
      return;
    }
    if (showStakePicker) {
      startRun("user-1", "You", stake);
      setShowStakePicker(false);
    } else {
      setShowStakePicker(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 glass-surface">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4">
        {run ? (
          <>
            <StageDots currentStage={run.currentStage} stageResults={run.stageResults} />

            <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground">
              <Zap className="h-3 w-3 text-storm-gold" />
              {STAGE_LABELS[run.currentStage]}
            </div>

            <div className="ml-auto flex items-center gap-4">
              <div className="text-right">
                <p className="text-lg font-bold font-mono leading-none">${run.currentValue.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">value</p>
              </div>

              <div className="h-8 w-px bg-border/50" />

              <div className="text-right">
                <p className="text-lg font-bold font-mono leading-none text-storm-vault">
                  <Shield className="inline h-3.5 w-3.5 mr-0.5 -mt-0.5" />${run.vaultBalance.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">vault</p>
              </div>

              {run.currentValue > 0 && (
                <Badge variant="outline" className="text-[10px] text-storm-live gap-0.5 hidden sm:flex">
                  <TrendingUp className="h-3 w-3" />
                  {((run.currentValue / run.startingStake) * 100 - 100).toFixed(0)}%
                </Badge>
              )}

              <div className="h-8 w-px bg-border/50" />

              {pendingDecision ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="gap-1.5 bg-storm-vault hover:bg-storm-vault/90 text-white font-bold h-9 px-4"
                    onClick={() => makeDecision(run.currentStage, "vault")}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    VAULT
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-storm-ride hover:bg-storm-ride/90 text-white font-bold h-9 px-4 animate-breathe-glow"
                    onClick={() => {
                      makeDecision(run.currentStage, "ride");
                      if (pendingDecision.isPerfect) {
                        awardLightning(run.currentStage);
                      }
                    }}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    RIDE
                  </Button>
                </div>
              ) : run.status === "active" ? (
                <div className="flex gap-2 items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 h-8 px-3 text-xs border-storm-accent/30 text-storm-accent hover:bg-storm-accent/10"
                    onClick={simulateStageComplete}
                  >
                    <FastForward className="h-3.5 w-3.5" />
                    Sim {STAGE_LABELS[run.currentStage]}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                    onClick={clearRun}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {run.status.toUpperCase()}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-storm-gold/10">
                <Zap className="h-4 w-4 text-storm-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold">Storm Run</p>
                <p className="text-[10px] text-muted-foreground">
                  Pick &rarr; Ride or Vault &rarr; Win
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {showStakePicker && (
                <div className="flex items-center gap-2">
                  {[50, 100, 250, 500].map((v) => (
                    <button
                      key={v}
                      onClick={() => setStake(v)}
                      className={`rounded-md px-2.5 py-1 text-xs font-mono font-bold transition-colors ${
                        stake === v
                          ? "bg-storm-gold/20 text-storm-gold ring-1 ring-storm-gold/40"
                          : "bg-storm-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      ${v}
                    </button>
                  ))}
                </div>
              )}
              <Button
                size="sm"
                className="gap-1.5 bg-storm-gold text-storm-lightning-foreground font-bold h-9 px-5 hover:bg-storm-gold/90"
                onClick={handleStartRun}
              >
                <Zap className="h-3.5 w-3.5" />
                {showStakePicker ? `Start — $${stake}` : "Start Storm Run"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
