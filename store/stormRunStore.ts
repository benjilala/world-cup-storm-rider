import { create } from "zustand";
import type { StormRun, StageKey, StageResult, VaultContribution, LightningMultiplier } from "@/lib/types/storm";
import { LIGHTNING_MULTIPLIERS, STAGE_ORDER, STAGE_MATCH_COUNTS } from "@/config/storm";

interface StormRunState {
  currentRun: StormRun | null;
  isStarting: boolean;

  startRun: (userId: string, username: string, stake: number) => void;
  completeStage: (stage: StageKey, correct: number, total: number) => void;
  simulateStageComplete: () => void;
  makeDecision: (stage: StageKey, decision: "ride" | "vault") => void;
  awardLightning: (stage: StageKey) => void;
  bustRun: () => void;
  completeRun: () => void;
  setRun: (run: StormRun) => void;
  clearRun: () => void;
}

export const useStormRunStore = create<StormRunState>((set, get) => ({
  currentRun: null,
  isStarting: false,

  startRun: (userId, username, stake) => {
    const run: StormRun = {
      id: `run-${Date.now()}`,
      userId,
      username,
      status: "active",
      currentStage: "groups",
      startingStake: stake,
      currentValue: stake,
      vaultBalance: 0,
      vaultContributions: [],
      stageResults: [],
      lightningMultipliers: STAGE_ORDER.map((stage) => ({
        stage,
        multiplier: LIGHTNING_MULTIPLIERS[stage],
        awarded: false,
      })),
      createdAt: new Date().toISOString(),
    };
    set({ currentRun: run, isStarting: false });

    setTimeout(() => {
      const total = 48;
      const correct = Math.floor(Math.random() * 12) + 30;
      get().completeStage("groups", correct, total);
    }, 3000);
  },

  simulateStageComplete: () => {
    const run = get().currentRun;
    if (!run || run.status !== "active") return;

    const alreadyCompleted = run.stageResults.find((r) => r.stage === run.currentStage);
    if (alreadyCompleted) return;

    const total = STAGE_MATCH_COUNTS[run.currentStage];
    const minCorrect = Math.ceil(total * 0.5);
    const correct = minCorrect + Math.floor(Math.random() * (total - minCorrect + 1));
    get().completeStage(run.currentStage, correct, total);
  },

  completeStage: (stage, correct, total) =>
    set((state) => {
      if (!state.currentRun) return state;
      const isPerfect = correct === total;
      const result: StageResult = {
        stage,
        picks: [],
        correct,
        total,
        isPerfect,
        decision: null,
        valueAtEnd: state.currentRun.currentValue,
      };
      return {
        currentRun: {
          ...state.currentRun,
          stageResults: [...state.currentRun.stageResults, result],
        },
      };
    }),

  makeDecision: (stage, decision) =>
    set((state) => {
      if (!state.currentRun) return state;
      const run = { ...state.currentRun };
      const stageIdx = run.stageResults.findIndex((r) => r.stage === stage);
      if (stageIdx < 0) return state;

      const results = [...run.stageResults];
      results[stageIdx] = { ...results[stageIdx], decision };

      // #region agent log
      const preDecisionValue = run.currentValue;
      // #endregion

      if (decision === "vault") {
        const vaultAmount = run.currentValue * 0.2;
        const contribution: VaultContribution = {
          stage,
          amount: vaultAmount,
          timestamp: new Date().toISOString(),
        };
        run.vaultBalance += vaultAmount;
        run.vaultContributions = [...run.vaultContributions, contribution];
        run.currentValue -= vaultAmount;
      }

      const nextIdx = STAGE_ORDER.indexOf(stage) + 1;
      if (nextIdx < STAGE_ORDER.length) {
        run.currentStage = STAGE_ORDER[nextIdx];
      }

      // #region agent log
      fetch('http://127.0.0.1:7482/ingest/72fd7319-6308-4797-b18e-079211a675e2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9046d1'},body:JSON.stringify({sessionId:'9046d1',location:'stormRunStore.ts:makeDecision',message:'Storm Run decision made',data:{stage,decision,preDecisionValue,postDecisionValue:run.currentValue,vaultBalance:run.vaultBalance,nextStage:run.currentStage,allDecisions:results.map(r=>({stage:r.stage,decision:r.decision,valueAtEnd:r.valueAtEnd}))},timestamp:Date.now(),hypothesisId:'H-A,H-C'})}).catch(()=>{});
      // #endregion

      return { currentRun: { ...run, stageResults: results } };
    }),

  awardLightning: (stage) =>
    set((state) => {
      if (!state.currentRun) return state;
      const multipliers: LightningMultiplier[] = state.currentRun.lightningMultipliers.map((lm) =>
        lm.stage === stage ? { ...lm, awarded: true } : lm
      );
      const awarded = multipliers.find((lm) => lm.stage === stage);
      const newValue = awarded
        ? state.currentRun.currentValue * awarded.multiplier
        : state.currentRun.currentValue;

      // #region agent log
      fetch('http://127.0.0.1:7482/ingest/72fd7319-6308-4797-b18e-079211a675e2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9046d1'},body:JSON.stringify({sessionId:'9046d1',location:'stormRunStore.ts:awardLightning',message:'Lightning awarded',data:{stage,multiplier:awarded?.multiplier,prevValue:state.currentRun.currentValue,newValue},timestamp:Date.now(),hypothesisId:'H-B'})}).catch(()=>{});
      // #endregion

      return {
        currentRun: {
          ...state.currentRun,
          lightningMultipliers: multipliers,
          currentValue: newValue,
        },
      };
    }),

  bustRun: () =>
    set((state) => ({
      currentRun: state.currentRun
        ? { ...state.currentRun, status: "busted" }
        : null,
    })),

  completeRun: () =>
    set((state) => ({
      currentRun: state.currentRun
        ? { ...state.currentRun, status: "completed" }
        : null,
    })),

  setRun: (run) => set({ currentRun: run }),
  clearRun: () => set({ currentRun: null }),
}));
