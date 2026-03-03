import { applyDecay, clamp01 } from "./decay";
import type { BetSide } from "./line";

export type CascadeState = {
  eventId: string;
  cooldownUntilMs: number;
  activeUntilMs: number;
  biasSide: BetSide | null;
  biasStrength: number; // 0..1 (effect strength)
  rateBoost: number; // >= 1
  strength: number; // 0..1 (UI)
  lastTriggerTs: number;
};

export type CascadeBehavior = {
  cooldownMs: number;
  durationMs: number;
  rateBoostMax: number;
  biasStrengthMax: number;
  decayHalfLifeMs: number;
};

export type CascadeTrigger =
  | { kind: "whale"; side: BetSide; magnitude01: number }
  | { kind: "consensus_flip"; side: BetSide; magnitude01: number }
  | { kind: "swing"; side: BetSide; magnitude01: number }
  | { kind: "line"; side: BetSide; magnitude01: number };

export function makeCascadeState(eventId: string): CascadeState {
  return {
    eventId,
    cooldownUntilMs: 0,
    activeUntilMs: 0,
    biasSide: null,
    biasStrength: 0,
    rateBoost: 1,
    strength: 0,
    lastTriggerTs: 0,
  };
}

export function cascadeIsActive(s: CascadeState, nowMs: number) {
  return nowMs < s.activeUntilMs && s.strength > 0.02;
}

export function cascadeStep(s: CascadeState, nowMs: number, behavior: CascadeBehavior): CascadeState {
  if (!cascadeIsActive(s, nowMs)) {
    // Keep cooldown, but clear effects once inactive.
    return {
      ...s,
      biasSide: null,
      biasStrength: 0,
      rateBoost: 1,
      strength: 0,
    };
  }

  // Exponential decay from last step based on dt.
  const dt = Math.max(0, nowMs - s.lastTriggerTs);
  const strength = applyDecay(s.strength, dt, behavior.decayHalfLifeMs);

  return {
    ...s,
    strength,
    biasStrength: s.biasStrength * strength,
    rateBoost: 1 + (s.rateBoost - 1) * strength,
    lastTriggerTs: nowMs,
  };
}

export function maybeTriggerCascade(args: {
  state: CascadeState;
  nowMs: number;
  trigger: CascadeTrigger;
  behavior: CascadeBehavior;
  intensityCascadeMult: number;
}): { state: CascadeState; didStart: boolean } {
  const { state: s, nowMs, trigger, behavior } = args;
  if (nowMs < s.cooldownUntilMs) return { state: s, didStart: false };

  const mag = clamp01(trigger.magnitude01) * args.intensityCascadeMult;
  const nextStrength = clamp01(0.65 + 0.55 * mag);
  const nextBiasStrength = clamp01(behavior.biasStrengthMax * (0.45 + 0.7 * mag));
  const nextRateBoost = 1 + (behavior.rateBoostMax - 1) * (0.45 + 0.7 * mag);

  const next: CascadeState = {
    ...s,
    biasSide: trigger.side,
    biasStrength: nextBiasStrength,
    rateBoost: nextRateBoost,
    strength: nextStrength,
    cooldownUntilMs: nowMs + behavior.cooldownMs,
    activeUntilMs: nowMs + behavior.durationMs,
    lastTriggerTs: nowMs,
  };

  return { state: next, didStart: true };
}

