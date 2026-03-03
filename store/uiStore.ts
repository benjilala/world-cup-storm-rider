import { create } from "zustand";

type BracketViewMode = "standard" | "full";

interface UIState {
  bracketViewMode: BracketViewMode;
  setBracketViewMode: (mode: BracketViewMode) => void;
  toggleBracketViewMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  bracketViewMode: "standard",

  setBracketViewMode: (mode) => set({ bracketViewMode: mode }),

  toggleBracketViewMode: () =>
    set((s) => ({
      bracketViewMode: s.bracketViewMode === "standard" ? "full" : "standard",
    })),
}));
