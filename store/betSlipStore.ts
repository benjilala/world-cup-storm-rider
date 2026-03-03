import { create } from "zustand";

export interface SlipSelection {
  id: string;
  marketId: string;
  matchId: string;
  label: string;
  odds: number;
  stake: number;
}

interface BetSlipState {
  selections: SlipSelection[];
  isOpen: boolean;
  mode: "single" | "multi";

  addSelection: (sel: Omit<SlipSelection, "stake">) => void;
  removeSelection: (selectionId: string) => void;
  setStake: (selectionId: string, stake: number) => void;
  toggleMode: () => void;
  clearSlip: () => void;
  openSlip: () => void;
  closeSlip: () => void;
  toggleSlip: () => void;
  totalStake: () => number;
  potentialPayout: () => number;
}

export const useBetSlipStore = create<BetSlipState>((set, get) => ({
  selections: [],
  isOpen: false,
  mode: "single",

  addSelection: (sel) =>
    set((state) => {
      if (state.selections.some((s) => s.id === sel.id)) return state;
      return { selections: [...state.selections, { ...sel, stake: 10 }], isOpen: true };
    }),

  removeSelection: (selectionId) =>
    set((state) => ({
      selections: state.selections.filter((s) => s.id !== selectionId),
    })),

  setStake: (selectionId, stake) =>
    set((state) => ({
      selections: state.selections.map((s) =>
        s.id === selectionId ? { ...s, stake } : s
      ),
    })),

  toggleMode: () =>
    set((state) => ({ mode: state.mode === "single" ? "multi" : "single" })),

  clearSlip: () => set({ selections: [] }),
  openSlip: () => set({ isOpen: true }),
  closeSlip: () => set({ isOpen: false }),
  toggleSlip: () => set((s) => ({ isOpen: !s.isOpen })),

  totalStake: () => get().selections.reduce((sum, s) => sum + s.stake, 0),

  potentialPayout: () => {
    const state = get();
    if (state.mode === "single") {
      return state.selections.reduce((sum, s) => sum + s.stake * s.odds, 0);
    }
    const totalOdds = state.selections.reduce((prod, s) => prod * s.odds, 1);
    const totalStake = state.selections.reduce((sum, s) => sum + s.stake, 0);
    return totalStake * totalOdds;
  },
}));
