import { create } from "zustand";
import type { StageKey } from "@/lib/types/storm";
import { STAGE_ORDER, STAGE_LABELS, LIGHTNING_MULTIPLIERS } from "@/config/storm";

export interface ParlayLeg {
  id: string;
  matchId: string;
  label: string;
  odds: number;
  teamCode: string;
  round: StageKey;
}

export interface RoundSummary {
  round: StageKey;
  label: string;
  legs: ParlayLeg[];
  rawOdds: number;
  lightningMultiplier: number;
  isRiding: boolean;
  effectiveMultiplier: number;
  runningValueIn: number;
  runningValueOut: number;
}

interface ParlayState {
  legs: ParlayLeg[];
  addLeg: (leg: ParlayLeg) => void;
  removeLeg: (legId: string) => void;
  toggleLeg: (leg: ParlayLeg) => void;
  clearParlay: () => void;
  combinedOdds: () => number;
  legCount: () => number;
  roundSummaries: (
    stake: number,
    stageDecisions: Partial<Record<StageKey, "ride" | "vault" | null>>,
    awardedStages: Set<StageKey>,
  ) => RoundSummary[];
}

export const useParlayStore = create<ParlayState>((set, get) => ({
  legs: [],

  addLeg: (leg) =>
    set((s) => {
      const existing = s.legs.findIndex((l) => l.matchId === leg.matchId);
      if (existing >= 0) {
        const updated = [...s.legs];
        updated[existing] = leg;
        return { legs: updated };
      }
      return { legs: [...s.legs, leg] };
    }),

  removeLeg: (legId) =>
    set((s) => ({ legs: s.legs.filter((l) => l.id !== legId) })),

  toggleLeg: (leg) =>
    set((s) => {
      const idx = s.legs.findIndex((l) => l.id === leg.id);
      if (idx >= 0) {
        return { legs: s.legs.filter((l) => l.id !== leg.id) };
      }
      const byMatch = s.legs.findIndex((l) => l.matchId === leg.matchId);
      if (byMatch >= 0) {
        const updated = [...s.legs];
        updated[byMatch] = leg;
        return { legs: updated };
      }
      return { legs: [...s.legs, leg] };
    }),

  clearParlay: () => set({ legs: [] }),

  combinedOdds: () => {
    const { legs } = get();
    if (legs.length === 0) return 0;
    return Math.round(legs.reduce((acc, l) => acc * l.odds, 1) * 100) / 100;
  },

  legCount: () => get().legs.length,

  roundSummaries: (stake, stageDecisions, awardedStages) => {
    const { legs } = get();
    if (legs.length === 0) return [];

    const byRound = new Map<StageKey, ParlayLeg[]>();
    for (const leg of legs) {
      const arr = byRound.get(leg.round) ?? [];
      arr.push(leg);
      byRound.set(leg.round, arr);
    }

    const summaries: RoundSummary[] = [];
    let runningValue = stake;

    for (const stage of STAGE_ORDER) {
      const roundLegs = byRound.get(stage);
      if (!roundLegs || roundLegs.length === 0) continue;

      const rawOdds = roundLegs.reduce((acc, l) => acc * l.odds, 1);
      const decision = stageDecisions[stage] ?? null;
      const isRiding = decision === "ride";
      const lightningMult = awardedStages.has(stage) && isRiding
        ? LIGHTNING_MULTIPLIERS[stage]
        : 1;
      const effectiveMultiplier = rawOdds * lightningMult;

      const valueIn = runningValue;
      const valueOut = Math.round(valueIn * effectiveMultiplier * 100) / 100;

      summaries.push({
        round: stage,
        label: STAGE_LABELS[stage],
        legs: roundLegs,
        rawOdds: Math.round(rawOdds * 100) / 100,
        lightningMultiplier: lightningMult,
        isRiding,
        effectiveMultiplier: Math.round(effectiveMultiplier * 100) / 100,
        runningValueIn: Math.round(valueIn * 100) / 100,
        runningValueOut: valueOut,
      });

      runningValue = valueOut;
    }

    return summaries;
  },
}));
