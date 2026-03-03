"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown, ChevronUp, Zap, X, Trash2,
  Shield, TrendingUp, Lock, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParlayStore } from "@/store/parlayStore";
import { useStormRunStore } from "@/store/stormRunStore";
import type { StageKey } from "@/lib/types/storm";

export function ParlayTracker() {
  const { legs, removeLeg, clearParlay, combinedOdds, legCount, roundSummaries } = useParlayStore();
  const run = useStormRunStore((s) => s.currentRun);
  const [expanded, setExpanded] = useState(false);

  const count = legCount();

  const stageDecisions = useMemo(() => {
    const map: Partial<Record<StageKey, "ride" | "vault" | null>> = {};
    if (run) {
      for (const sr of run.stageResults) {
        map[sr.stage] = sr.decision;
      }
    }
    return map;
  }, [run]);

  const awardedStages = useMemo(() => {
    const set = new Set<StageKey>();
    if (run) {
      for (const lm of run.lightningMultipliers) {
        if (lm.awarded) set.add(lm.stage);
      }
    }
    return set;
  }, [run]);

  const stake = run?.startingStake ?? 10;
  const summaries = roundSummaries(stake, stageDecisions, awardedStages);
  const combined = combinedOdds();
  const finalValue = summaries.length > 0
    ? summaries[summaries.length - 1].runningValueOut
    : stake * combined;

  // #region agent log
  fetch('http://127.0.0.1:7482/ingest/72fd7319-6308-4797-b18e-079211a675e2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9046d1'},body:JSON.stringify({sessionId:'9046d1',location:'ParlayTracker.tsx:render',message:'ParlayTracker state snapshot',data:{parlayLegCount:count,stakeUsed:stake,runStartingStake:run?.startingStake,runCurrentValue:run?.currentValue,runVaultBalance:run?.vaultBalance,combinedOdds:combined,finalValue,stageDecisions:Object.fromEntries(Object.entries(stageDecisions)),awardedStages:Array.from(awardedStages),summaries:summaries.map(s=>({round:s.round,rawOdds:s.rawOdds,lightningMult:s.lightningMultiplier,isRiding:s.isRiding,effectiveMult:s.effectiveMultiplier,valueIn:s.runningValueIn,valueOut:s.runningValueOut,legCount:s.legs.length}))},timestamp:Date.now(),hypothesisId:'H-A,H-B,H-C'})}).catch(()=>{});
  // #endregion

  if (count < 1) return null;

  return (
    <div className="fixed bottom-16 right-4 z-40 w-80 animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-lg overflow-hidden">
        {/* Header pill */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-2 px-3 py-2.5 transition-colors hover:bg-storm-surface/50"
        >
          <Zap className="h-3.5 w-3.5 text-accent-lightning shrink-0" />
          <span className="text-xs font-semibold flex-1 text-left">
            {count}-Leg Parlay
          </span>
          <Badge variant="outline" className="text-[10px] font-mono tabular-nums border-accent-lightning/30 text-accent-lightning">
            @ {combined.toFixed(2)}x
          </Badge>
          <span className="text-[10px] font-mono font-bold text-storm-live tabular-nums">
            → {finalValue.toFixed(2)}
          </span>
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          )}
        </button>

        {/* Expanded: grouped by round */}
        {expanded && (
          <div className="border-t border-border/30">
            <div className="max-h-72 overflow-y-auto">
              {summaries.map((rs) => (
                <div key={rs.round} className="border-b border-border/20 last:border-b-0">
                  {/* Round header */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/20">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground flex-1">
                      {rs.label}
                    </span>

                    {/* Vault / Ride indicator */}
                    {stageDecisions[rs.round] === "vault" && (
                      <Badge variant="outline" className="text-[8px] h-4 gap-0.5 border-accent-gold/40 text-accent-gold">
                        <Shield className="h-2 w-2" />
                        VAULT
                      </Badge>
                    )}
                    {stageDecisions[rs.round] === "ride" && (
                      <Badge variant="outline" className="text-[8px] h-4 gap-0.5 border-accent-lightning/40 text-accent-lightning">
                        <TrendingUp className="h-2 w-2" />
                        RIDE
                      </Badge>
                    )}
                    {!stageDecisions[rs.round] && (
                      <Badge variant="outline" className="text-[8px] h-4 text-muted-foreground/50">
                        PENDING
                      </Badge>
                    )}

                    {/* Round odds */}
                    <span className="text-[9px] font-mono tabular-nums text-muted-foreground">
                      {rs.rawOdds.toFixed(2)}x
                    </span>
                  </div>

                  {/* Legs in this round */}
                  {rs.legs.map((leg) => (
                    <div
                      key={leg.id}
                      className="flex items-center gap-2 px-3 py-1.5"
                    >
                      <span className="text-[10px] font-medium text-foreground flex-1 leading-tight">
                        {leg.label}
                      </span>
                      <span className="text-[10px] font-mono tabular-nums text-muted-foreground shrink-0">
                        {leg.odds.toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeLeg(leg.id); }}
                        className="shrink-0 rounded-full p-0.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}

                  {/* Round value flow */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/10">
                    <span className="text-[9px] font-mono tabular-nums text-muted-foreground">
                      {rs.runningValueIn.toFixed(2)}
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40" />
                    <span className="text-[9px] font-mono tabular-nums font-bold text-foreground">
                      {rs.runningValueOut.toFixed(2)}
                    </span>
                    {rs.lightningMultiplier > 1 && (
                      <Badge className="text-[7px] h-3.5 gap-0.5 bg-accent-lightning/15 text-accent-lightning border-accent-lightning/30" variant="outline">
                        <Zap className="h-2 w-2" />
                        ×{rs.lightningMultiplier}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border/40 px-3 py-2.5 bg-muted/5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                    {run ? (
                      <>Storm Run stake: {stake.toFixed(2)} USDT</>
                    ) : (
                      <>Notional stake: {stake.toFixed(2)} USDT</>
                    )}
                  </p>
                  <p className="text-sm font-bold text-storm-live font-mono tabular-nums flex items-center gap-1">
                    → {finalValue.toFixed(2)} USDT
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] text-muted-foreground hover:text-destructive"
                  onClick={() => clearParlay()}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>

              {/* Vault total if any vaulted */}
              {run && run.vaultBalance > 0 && (
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/20">
                  <Lock className="h-3 w-3 text-accent-gold" />
                  <span className="text-[9px] text-accent-gold font-medium">
                    Vault: {run.vaultBalance.toFixed(2)} USDT secured
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
