import type { StageKey } from "@/lib/types/storm";

export const LIGHTNING_MULTIPLIERS: Record<StageKey, number> = {
  groups: 2,
  r32: 4,
  r16: 4,
  qf: 3,
  sf: 2,
  final: 2,
};

export const STAGE_ORDER: StageKey[] = [
  "groups",
  "r32",
  "r16",
  "qf",
  "sf",
  "final",
];

export const STAGE_LABELS: Record<StageKey, string> = {
  groups: "Group Stage",
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-Finals",
  sf: "Semi-Finals",
  final: "Final",
};

export const STAGE_MATCH_COUNTS: Record<StageKey, number> = {
  groups: 48,
  r32: 16,
  r16: 8,
  qf: 4,
  sf: 2,
  final: 1,
};

export const CHECKPOINT_RULES: Record<StageKey, { minCorrectPct: number; vaultPct: number }> = {
  groups: { minCorrectPct: 0.5, vaultPct: 0.1 },
  r32: { minCorrectPct: 0.5, vaultPct: 0.15 },
  r16: { minCorrectPct: 0.5, vaultPct: 0.2 },
  qf: { minCorrectPct: 0.5, vaultPct: 0.25 },
  sf: { minCorrectPct: 0.5, vaultPct: 0.3 },
  final: { minCorrectPct: 0, vaultPct: 0 },
};

export const VAULT_UNLOCK_OPTIONS = {
  secure: { label: "SECURE", description: "Lock in your vault balance. No risk.", riskMultiplier: 1 },
  storm_all_in: { label: "STORM ALL-IN", description: "Risk everything for double or nothing.", riskMultiplier: 2 },
  storm_plus: { label: "STORM+", description: "Vault + active boosts for a boosted payout.", riskMultiplier: 1.5 },
} as const;
