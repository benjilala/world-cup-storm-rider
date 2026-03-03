import { create } from "zustand";
import type { BracketPick, StageKey } from "@/lib/types/storm";
import { STAGE_ORDER } from "@/config/storm";

interface BracketState {
  groupPicks: Record<string, string[]>;
  knockoutPicks: Record<string, BracketPick>;
  confirmedStages: StageKey[];

  setGroupWinners: (groupId: string, teamIds: string[]) => void;
  setKnockoutPick: (matchId: string, winnerId: string) => void;
  resetDownstream: (fromStage: StageKey) => void;
  confirmStage: (stage: StageKey) => void;
  clearBracket: () => void;
  getPickForMatch: (matchId: string) => BracketPick | undefined;
}

export const useBracketStore = create<BracketState>((set, get) => ({
  groupPicks: {},
  knockoutPicks: {},
  confirmedStages: [],

  setGroupWinners: (groupId, teamIds) =>
    set((state) => ({
      groupPicks: { ...state.groupPicks, [groupId]: teamIds },
    })),

  setKnockoutPick: (matchId, winnerId) =>
    set((state) => ({
      knockoutPicks: {
        ...state.knockoutPicks,
        [matchId]: { matchId, winnerId },
      },
    })),

  resetDownstream: (fromStage) => {
    const idx = STAGE_ORDER.indexOf(fromStage);
    if (idx < 0) return;
    const stagesToReset = STAGE_ORDER.slice(idx + 1);
    set((state) => {
      const newKnockout = { ...state.knockoutPicks };
      for (const key of Object.keys(newKnockout)) {
        const pick = newKnockout[key];
        if (pick && stagesToReset.includes(pick.matchId.split("-")[0] as StageKey)) {
          delete newKnockout[key];
        }
      }
      return {
        knockoutPicks: newKnockout,
        confirmedStages: state.confirmedStages.filter((s) => !stagesToReset.includes(s)),
      };
    });
  },

  confirmStage: (stage) =>
    set((state) => ({
      confirmedStages: state.confirmedStages.includes(stage)
        ? state.confirmedStages
        : [...state.confirmedStages, stage],
    })),

  clearBracket: () =>
    set({ groupPicks: {}, knockoutPicks: {}, confirmedStages: [] }),

  getPickForMatch: (matchId) => get().knockoutPicks[matchId],
}));
