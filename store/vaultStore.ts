import { create } from "zustand";
import type { VaultContribution, FinalUnlockWager } from "@/lib/types/storm";

interface VaultStoreState {
  vaultBalance: number;
  vaultContributions: VaultContribution[];
  isVaultLocked: boolean;
  hasUnlockedVault: boolean;
  finalUnlockWager: FinalUnlockWager | null;

  addContribution: (contribution: VaultContribution) => void;
  lockVault: () => void;
  unlockVault: (wager: FinalUnlockWager) => void;
  setFinalUnlockWager: (wager: FinalUnlockWager) => void;
  resetVault: () => void;
}

export const useVaultStore = create<VaultStoreState>((set) => ({
  vaultBalance: 0,
  vaultContributions: [],
  isVaultLocked: true,
  hasUnlockedVault: false,
  finalUnlockWager: null,

  addContribution: (contribution) =>
    set((state) => ({
      vaultBalance: state.vaultBalance + contribution.amount,
      vaultContributions: [...state.vaultContributions, contribution],
    })),

  lockVault: () => set({ isVaultLocked: true }),

  unlockVault: (wager) =>
    set({
      isVaultLocked: false,
      hasUnlockedVault: true,
      finalUnlockWager: wager,
    }),

  setFinalUnlockWager: (wager) => set({ finalUnlockWager: wager }),

  resetVault: () =>
    set({
      vaultBalance: 0,
      vaultContributions: [],
      isVaultLocked: true,
      hasUnlockedVault: false,
      finalUnlockWager: null,
    }),
}));
