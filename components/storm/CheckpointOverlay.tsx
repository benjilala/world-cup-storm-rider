"use client";

import { useCallback, useEffect, useState } from "react";
import { Shield, Zap, TrendingUp } from "lucide-react";
import { useStormRunStore } from "@/store/stormRunStore";
import { STAGE_LABELS, LIGHTNING_MULTIPLIERS } from "@/config/storm";

function AnimatedValue({ value, prefix = "$" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const from = 0;
    const to = value;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}{display.toLocaleString()}
    </span>
  );
}

export function CheckpointOverlay() {
  const { currentRun, makeDecision, awardLightning } = useStormRunStore();
  const [phase, setPhase] = useState<"counting" | "deciding" | "exiting">("counting");
  const [chosen, setChosen] = useState<"ride" | "vault" | null>(null);

  const run = currentRun;
  const pendingDecision = run
    ? run.stageResults.find((r) => r.stage === run.currentStage && !r.decision)
    : null;

  const shouldShow = !!run && !!pendingDecision && run.status === "active";

  useEffect(() => {
    if (shouldShow) {
      setPhase("counting");
      setChosen(null);
      const timer = setTimeout(() => setPhase("deciding"), 1400);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  const handleDecision = useCallback(
    (decision: "ride" | "vault") => {
      if (!run || !pendingDecision) return;
      setChosen(decision);
      setPhase("exiting");

      setTimeout(() => {
        makeDecision(run.currentStage, decision);
        if (decision === "ride" && pendingDecision.isPerfect) {
          awardLightning(run.currentStage);
        }
      }, 600);
    },
    [run, pendingDecision, makeDecision, awardLightning],
  );

  if (!shouldShow || !run || !pendingDecision) return null;

  const stage = run.currentStage;
  const lightningMult = LIGHTNING_MULTIPLIERS[stage];
  const vaultPortion = Math.round(run.currentValue * 0.2);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center animate-checkpoint-enter ${
        phase === "exiting" ? "opacity-0 transition-opacity duration-500" : ""
      }`}
      style={{ background: "var(--storm-checkpoint-bg)" }}
    >
      {/* Stage label */}
      <div className="mb-2">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-storm-gold uppercase">
          {STAGE_LABELS[stage]} Complete
        </span>
      </div>

      {/* Result */}
      <div className="mb-2 text-center">
        <span className="text-sm text-muted-foreground">
          {pendingDecision.correct}/{pendingDecision.total} correct
          {pendingDecision.isPerfect && (
            <span className="ml-2 text-storm-perfect font-bold">PERFECT</span>
          )}
        </span>
      </div>

      {/* Animated value */}
      <div className={`text-center mb-8 animate-count-up ${
        chosen === "vault" ? "text-storm-vault" : chosen === "ride" ? "text-storm-gold" : "text-foreground"
      }`}>
        <p className="text-6xl sm:text-8xl font-bold font-mono tracking-tight">
          <AnimatedValue value={run.currentValue} />
        </p>
        <p className="text-sm text-muted-foreground mt-2">current value</p>
      </div>

      {/* Decision buttons */}
      {phase === "deciding" && !chosen && (
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg px-6 animate-count-up">
          {/* VAULT */}
          <button
            onClick={() => handleDecision("vault")}
            className="group relative w-full sm:w-1/2 rounded-2xl border-2 border-storm-vault/40 bg-storm-vault/5 px-6 py-6 text-center transition-all hover:border-storm-vault hover:bg-storm-vault/10 hover:shadow-[0_0_32px_rgba(16,185,129,0.15)] active:scale-[0.98]"
          >
            <Shield className="h-8 w-8 text-storm-vault mx-auto mb-3" />
            <p className="text-xl font-bold text-storm-vault">VAULT</p>
            <p className="text-sm text-muted-foreground mt-1">
              Bank ${vaultPortion.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-2">
              Protect 20% — guaranteed floor
            </p>
          </button>

          {/* RIDE */}
          <button
            onClick={() => handleDecision("ride")}
            className="group relative w-full sm:w-1/2 rounded-2xl border-2 border-storm-ride/40 bg-storm-ride/5 px-6 py-6 text-center transition-all hover:border-storm-ride hover:bg-storm-ride/10 hover:shadow-[0_0_32px_rgba(200,80,40,0.15)] animate-breathe-glow active:scale-[0.98]"
          >
            <Zap className="h-8 w-8 text-storm-gold mx-auto mb-3" />
            <p className="text-xl font-bold text-storm-gold">RIDE</p>
            <p className="text-sm text-muted-foreground mt-1">
              Keep ${run.currentValue.toLocaleString()} at risk
            </p>
            {pendingDecision.isPerfect && (
              <p className="text-[10px] text-storm-lightning mt-2 font-semibold flex items-center justify-center gap-1">
                <Zap className="h-3 w-3" />
                Lightning {lightningMult}x multiplier
              </p>
            )}
            {!pendingDecision.isPerfect && (
              <p className="text-[10px] text-muted-foreground/60 mt-2">
                Full amount — higher ceiling, wipeout risk
              </p>
            )}
          </button>
        </div>
      )}

      {/* Chosen confirmation */}
      {chosen && (
        <div className="animate-count-up text-center">
          <p className="text-2xl font-bold">
            {chosen === "vault" ? (
              <span className="text-storm-vault">VAULTED</span>
            ) : (
              <span className="text-storm-gold">RIDING</span>
            )}
          </p>
        </div>
      )}

      {/* Vault balance indicator */}
      {run.vaultBalance > 0 && (
        <div className="absolute bottom-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-storm-vault" />
          <span className="font-mono">${run.vaultBalance.toLocaleString()}</span>
          <span>in vault</span>
        </div>
      )}
    </div>
  );
}
